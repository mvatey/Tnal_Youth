"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, FileText } from "lucide-react";
import { RiAddCircleLine } from "react-icons/ri";

import DataTable from "@/components/table/DataTable";
import { downloadTableAsExcel } from "@/utils/downloadExcel";
import CompanyDocumentPreview from "@/components/document/CompanyDocumentPreview";
import { useAuth } from "@/context/AuthContext";
import { useBranch } from "@/context/BranchContext";
import { useLanguage } from "@/context/LanguageContext";
import { normalizeRole } from "@/lib/navigation";
import { formatDateWithMonth } from "@/lib/formatDate";

const DOCUMENT_TYPE_BADGE_STYLES = {
  PDF: "bg-error-bg text-error",
  Excel: "bg-success-bg text-success",
  XLS: "bg-success-bg text-success",
  XLSX: "bg-success-bg text-success",
  Word: "bg-primary-light text-primary",
  DOC: "bg-primary-light text-primary",
  DOCX: "bg-primary-light text-primary",
  PowerPoint: "bg-warning-bg text-warning",
  PPT: "bg-warning-bg text-warning",
  PPTX: "bg-warning-bg text-warning",
  PNG: "bg-secondary-light text-secondary",
  JPG: "bg-warning-bg text-warning",
  JPEG: "bg-warning-bg text-warning",
};

const DEFAULT_DOCUMENT_TYPE_STYLE = "bg-bg-page-gray text-text-secondary";

export default function MemberDocumentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, isEnglish } = useLanguage();
  const role = normalizeRole(user?.role);
  const { selectedBranch } = useBranch();

  /*
   * SECRETARY and BRANCH_LEADER may create certificates/letters of
   * appointment (matches DocumentController's @PreAuthorize on
   * POST /api/documents). VIEWER and MEMBER are read-only here, and MEMBER
   * additionally only ever sees documents dedicated
   * to them (enforced server-side in DocumentServiceImpl.getDocuments).
   */
  const canManageDocuments =
    role === "secretary" || role === "branch_leader";

  // The cross-branch tab only ever has content for branch-scoped staff —
  // an activity's host branch certifying a co-hosting branch's member.
  // Admin/viewer already see every branch in the main tab, so a second
  // "cross-branch" view would just be an empty duplicate for them.
  const showCrossBranchTab =
    role === "secretary" || role === "branch_leader";

  // Admin/viewer get a free-pick branch filter (their own local state
  // below); secretary/branch_leader see the same dropdown but locked to
  // whichever single branch is active in the sidebar -- it only changes
  // when the sidebar's branch changes, same lock used on the company
  // documents tab and the member list/activity-donation pages.
  const isBranchScoped =
    role === "secretary" || role === "branch_leader";

  const [activeSubTab, setActiveSubTab] = useState("own");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  // "" (not "all") to match FormSelect's own reset option, which always
  // emits "". Ignored for secretary/branch_leader -- see
  // effectiveSelectedBranch below.
  const [localBranchFilter, setLocalBranchFilter] = useState("");
  const [branches, setBranches] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDocuments = useCallback(async () => {
    // A branch-scoped secretary/branch_leader's `selectedBranch` starts at
    // the placeholder "all" for the brief window before BranchContext's own
    // fetch resolves it to their real branch. Fetching then would go out,
    // then get immediately superseded once it resolves -- showing up as
    // the table flashing loading twice for no reason. Wait for it instead.
    if (isBranchScoped && selectedBranch === "all") return;

    setLoading(true);
    setError("");
    try {
      // DataTable paginates client-side over whatever array it's given,
      // so this needs every visible document, not just the backend's
      // default first page of 10 — loop through every page the same
      // way CertificateForm.js does for activities.
      const endpoint =
        activeSubTab === "cross-branch"
          ? "/api/backend/documents/member-documents/cross-branch-certificates"
          : activeSubTab === "received"
            ? "/api/backend/documents/member-documents/received-from-other-branches"
            : "/api/backend/documents";

      // A multi-branch secretary's "received"/"issued" scope must follow
      // whichever single branch is currently selected in the sidebar, not
      // every branch they staff — otherwise an activity hosted by one of
      // their OTHER branches looks like "their own" from both, and never
      // shows up as cross-branch at all. The "own" tab has no such param
      // (see exclude_cross_branch_issued_certificates below instead).
      const branchParam =
        (activeSubTab === "cross-branch" || activeSubTab === "received") &&
        selectedBranch !== "all"
          ? `&branchId=${encodeURIComponent(selectedBranch)}`
          : "";

      // The "own" tab must never mix in a certificate that was actually
      // issued by a different branch's activity — that belongs in the
      // "received" tab instead, regardless of which branch is selected.
      const excludeCrossBranchParam =
        activeSubTab === "own"
          ? "&exclude_cross_branch_issued_certificates=true"
          : "";

      const rows = [];
      let page = 0;
      let totalPages = 1;
      do {
        const response = await fetch(
          `${endpoint}?page=${page}&size=100${branchParam}${excludeCrossBranchParam}`,
          { cache: "no-store" },
        );
        const body = await response.json().catch(() => null);
        if (!response.ok) throw new Error(body?.message || t("documentPage.loadDocumentsFailed"));
        const pageRows = body?.data?.content ?? body?.content ?? body?.data ?? body;
        rows.push(...(Array.isArray(pageRows) ? pageRows : []));
        totalPages = Math.max(1, Number(body?.data?.total_pages ?? body?.total_pages ?? body?.totalPages) || 1);
        page += 1;
      } while (page < totalPages);

      setDocuments(rows.filter((row) => row.member).map((row) => mapMemberDocument(row, isEnglish)));
    } catch (loadError) {
      setError(loadError.message || t("documentPage.loadDocumentsFailed"));
    } finally {
      setLoading(false);
    }
  }, [activeSubTab, isBranchScoped, isEnglish, selectedBranch, t]);

  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/lookups/branches", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : []))
      .then((body) => {
        if (!cancelled) setBranches(Array.isArray(body) ? body : (body?.data ?? []));
      })
      .catch(() => {
        if (!cancelled) setBranches([]);
      });
    return () => { cancelled = true; };
  }, []);

  const branchOptions = useMemo(() => branches
    .map((branch) => {
      const value = branch.value ?? branch.id ?? branch.branchId ?? branch.branch_id;
      const nameKm = branch.labelKm ?? branch.nameKm ?? branch.name_km;
      const nameEn = branch.labelEn ?? branch.nameEn ?? branch.name_en;
      return {
        value: value == null ? "" : String(value),
        label: (isEnglish ? nameEn ?? nameKm : nameKm ?? nameEn) ?? branch.code ?? "",
      };
    })
    .filter((option) => option.value && option.label), [branches, isEnglish]);

  // What the table's own branch filter actually uses -- a branch-scoped
  // secretary/branch_leader always follows the sidebar's global branch;
  // everyone else (admin/viewer) picks freely from their own local filter.
  const effectiveSelectedBranch = isBranchScoped
    ? selectedBranch
    : localBranchFilter;

  // The branch filter dropdown shown in the toolbar: the full list for a
  // free pick, or just the one currently-active branch (and disabled) when
  // branch-scoped -- same pattern as the company documents tab.
  const branchFilterOptions = isBranchScoped
    ? branchOptions.filter(
        (option) => String(option.value) === String(selectedBranch),
      )
    : branchOptions;

  const filteredDocuments = documents.filter((item) => {
    const searchValue = search.trim().toLowerCase();

    const matchSearch =
      item.title?.toLowerCase().includes(searchValue) ||
      item.memberName?.toLowerCase().includes(searchValue);

    const matchType = !typeFilter || item.type === typeFilter;

    const matchDate = !dateFilter || item.dateValue === dateFilter;

    // A document with no branch on record stays visible no matter which
    // branch is selected, rather than disappearing under every branch
    // filter — see the company-tab page for the same rule.
    //
    // The cross-branch tab's entire point is showing certificates whose
    // RECIPIENT belongs to some branch other than the one selected in the
    // sidebar (a co-hosting branch's member) — item.branchId there is
    // always that recipient's own branch, never the viewer's, so this
    // filter would exclude every row on that tab if applied. It only
    // makes sense on the "own branch" tab.
    const matchBranch =
      activeSubTab === "cross-branch" ||
      !effectiveSelectedBranch ||
      effectiveSelectedBranch === "all" ||
      item.branchId == null ||
      String(item.branchId) === String(effectiveSelectedBranch);

    return matchSearch && matchType && matchDate && matchBranch;
  });

  const columns = [
    {
      header: t("documentPage.no"),
      width: "w-[6%]",
      align: "center",
      render: (_, index) => index,
    },
    {
      header: t("documentPage.document"),
      width: "w-[8%]",
      render: (item) =>
        item.isImage ? (
          <img
            src={item.image || "/document.jpg"}
            alt={item.title || t("documentPage.document")}
            className="h-8 w-6 rounded border border-border object-cover"
          />
        ) : (
          <span className="inline-flex h-8 w-7 items-center justify-center rounded border border-border bg-bg-page-gray">
            <FileText size={18} className="text-text-secondary" />
          </span>
        ),
    },
    {
      header: t("documentPage.documentName"),
      accessor: "title",
      width: "w-[27%]",
    },
    {
      header: t("documentPage.member"),
      accessor: "memberName",
      width: "w-[15%]",
    },
    {
      header: t("documentPage.branch"),
      accessor: "branch",
      width: "w-[14%]",
    },
    {
      header: t("documentPage.date"),
      accessor: "date",
      width: "w-[12%]",
    },
    {
      header: t("documentPage.size"),
      accessor: "size",
      width: "w-[8%]",
    },
    {
      header: t("documentPage.documentType"),
      accessor: "type",
      width: "w-[10%]",
      align: "center",
      render: (item) => {
        const normalizedType = String(item.type || "").trim();

        const badgeStyle =
          DOCUMENT_TYPE_BADGE_STYLES[normalizedType] ||
          DEFAULT_DOCUMENT_TYPE_STYLE;

        return (
          <span
            className={`
              inline-flex
          max-w-full
          items-center
          justify-center
          rounded-full
          px-2
          py-1
          text-[11px]
          truncate whitespace-nowrap
              ${badgeStyle}
            `}
          >
            {normalizedType || "-"}
          </span>
        );
      },
    },
    {
      header: t("documentPage.actions"),
      width: "w-[8%]",
      align: "center",
      render: (item) => (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setSelectedCertificate(item)}
            className="
              inline-flex
              h-8
              w-8
              items-center
              justify-center
              rounded-md
              transition
              hover:bg-blue-50
            "
            aria-label={t("documentPage.viewDocument")}
          >
            <Eye size={18} className="text-blue-500" />
          </button>
        </div>
      ),
    },
  ];

  const filters = [
    {
      name: "branch",
      placeholder: t("documentPage.branch"),
      value: isBranchScoped ? String(selectedBranch) : localBranchFilter,
      options: branchFilterOptions,
      onChange: isBranchScoped ? () => {} : setLocalBranchFilter,
      disabled: isBranchScoped,
    },
    {
      name: "type",
      placeholder: t("documentPage.documentType"),
      value: typeFilter,
      options: [
        ...new Set(documents.map((item) => item.type).filter(Boolean)),
      ].map((type) => ({
        label: type,
        value: type,
      })),
      onChange: setTypeFilter,
    },
    {
      name: "date",
      type: "date",
      placeholder: t("documentPage.datePlaceholder"),
      value: dateFilter,
      onChange: setDateFilter,
    },
  ];

  const addButton = (
    <button
      type="button"
      onClick={() => router.push("/document/create")}
      className="
        inline-flex
        items-center
        gap-2
        whitespace-nowrap
        rounded-lg
        bg-success
        px-18
        py-2
        text-sm
        font-medium
        text-white
        transition
        hover:opacity-90
      "
    >
      <RiAddCircleLine className="h-4 w-4 shrink-0" />

      <span>{t("documentPage.createDocument")}</span>
    </button>
  );

  return (
    <>
      {showCrossBranchTab ? (
        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab("own")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeSubTab === "own"
                ? "bg-primary text-white"
                : "bg-bg-page-white text-text-secondary hover:bg-bg-page-gray"
            }`}
          >
            {t("documentPage.ownBranchDocumentsTab")}
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("received")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeSubTab === "received"
                ? "bg-primary text-white"
                : "bg-bg-page-white text-text-secondary hover:bg-bg-page-gray"
            }`}
          >
            {t("documentPage.receivedFromOtherBranchesTab")}
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("cross-branch")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeSubTab === "cross-branch"
                ? "bg-primary text-white"
                : "bg-bg-page-white text-text-secondary hover:bg-bg-page-gray"
            }`}
          >
            {t("documentPage.crossBranchCertificatesTab")}
          </button>
        </div>
      ) : null}
      {error ? (
        <div className="mb-3 flex items-center justify-between rounded-md border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">
          <span>{error}</span>
          <button type="button" className="font-semibold underline" onClick={loadDocuments}>{t("documentPage.retry")}</button>
        </div>
      ) : null}
      <DataTable
        data={filteredDocuments}
        loading={loading}
        columns={columns}
        filters={filters}
        searchQuery={search}
        onSearchChange={setSearch}
        actionButton={canManageDocuments ? addButton : null}
        pageSize={15}
        onDownload={() =>
          downloadTableAsExcel({
            data: filteredDocuments,
            columns,
            fileName: t("documentPage.memberFileName"),
          })
        }
        searchPlaceholder={t("documentPage.searchPlaceholder")}
        emptyMessage={t("documentPage.emptyMessage")}
      />

      {selectedCertificate && (
        <CompanyDocumentPreview
          document={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}
    </>
  );
}

function mapMemberDocument(row, isEnglish) {
  const extension = row.file?.originalName?.split(".").pop()?.toUpperCase();
  const normalizedType = extension || row.type?.code || "FILE";
  return {
    id: row.id,
    title: row.title,
    memberName: isEnglish
      ? row.member?.fullNameEn || row.member?.full_name_en || row.member?.fullNameKm || row.member?.full_name_km || "-"
      : row.member?.fullNameKm || row.member?.full_name_km || row.member?.fullNameEn || row.member?.full_name_en || "-",
    branch: isEnglish
      ? row.branch?.nameEn || row.branch?.name_en || row.branch?.nameKm || row.branch?.name_km || "-"
      : row.branch?.nameKm || row.branch?.name_km || row.branch?.nameEn || row.branch?.name_en || "-",
    branchId: row.branch?.id ?? row.branch?.branchId ?? row.branch?.branch_id ?? null,
    date: formatDateWithMonth(row.created_at, isEnglish ? "en" : "km"),
    dateValue: row.created_at ? row.created_at.slice(0, 10) : "",
    size: formatSize(row.file?.sizeBytes),
    type: normalizedType,
    isImage: ["PNG", "JPG", "JPEG", "WEBP", "GIF"].includes(normalizedType),
    image: row.file?.id ? `/api/backend/files/${row.file.id}/content` : "/document.jpg",
  };
}

function formatSize(bytes) {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
