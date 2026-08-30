"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, FileText, Pencil, Trash2 } from "lucide-react";
import { RiAddCircleLine } from "react-icons/ri";

import DataTable from "@/components/table/DataTable";
import { downloadTableAsExcel } from "@/utils/downloadExcel";
import AddDocumentForm from "@/components/document/AddDocumentForm";
import EditDocumentForm from "@/components/document/EditDocumentForm";
import CompanyDocumentPreview from "@/components/document/CompanyDocumentPreview";
import DeleteConfirmModal from "@/components/popup/Confirmdeletemodal";
import { useAuth } from "@/context/AuthContext";
import { useBranch } from "@/context/BranchContext";
import { useLanguage } from "@/context/LanguageContext";
import { normalizeRole } from "@/lib/navigation";

const EMPTY_FORM = {
  title: "",
  branch: "",
  description: "",
  date: "",
  files: [],
};
const DOCUMENT_TYPE_BADGE_STYLES = {
  PDF: "bg-error-bg text-error",
  Excel: "bg-success-bg text-success",
  Word: "bg-primary-light text-primary",
  PowerPoint: "bg-warning-bg text-warning",
  PNG: "bg-secondary-light text-secondary",
  JPG: "bg-warning-bg text-warning",
  JPEG: "bg-warning-bg text-warning",
};

const DEFAULT_DOCUMENT_TYPE_STYLE =
  "bg-bg-page-gray text-text-secondary";

export default function CompanyDocumentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, label, locale } = useLanguage();
  const role = normalizeRole(user?.role);
  const { selectedBranch } = useBranch();

  /*
   * SECRETARY and BRANCH_LEADER may add, edit, or delete documents
   * (matches DocumentController's @PreAuthorize on POST/PUT/DELETE).
   * VIEWER and MEMBER remain read-only. Gating these controls here is a UX
   * courtesy on top of that real enforcement, not a substitute for it.
   */
  const canManageDocuments =
    role === "secretary" || role === "branch_leader";

  /*
   * A MEMBER never has anything to see on this tab (the organizational
   * list is staff/admin/viewer-only — see DocumentServiceImpl.getDocuments),
   * and DocumentTabs already hides the tab itself for them. This is the
   * defense-in-depth redirect for a member who reaches the URL directly.
   */
  useEffect(() => {
    if (role === "member") {
      router.replace("/document/member");
    }
  }, [role, router]);

  const [documents, setDocuments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [editDocument, setEditDocument] = useState(null);
  const [deleteDocument, setDeleteDocument] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const loadPage = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // DataTable paginates client-side over whatever array it's given,
      // so this needs every organizational document, not just the
      // backend's default first page of 10 — loop through every page
      // the same way CertificateForm.js does for activities.
      const documentRows = [];
      let page = 0;
      let totalPages = 1;
      do {
        const response = await fetch(
          `/api/backend/documents?page=${page}&size=100`,
          { cache: "no-store" },
        );
        const body = await response.json().catch(() => null);
        if (!response.ok) throw new Error(body?.message || t("documentPage.loadDocumentsFailed"));
        const rows = body?.data?.content ?? body?.content ?? body?.data ?? body;
        documentRows.push(...(Array.isArray(rows) ? rows : []));
        totalPages = Math.max(1, Number(body?.data?.total_pages ?? body?.total_pages ?? body?.totalPages) || 1);
        page += 1;
      } while (page < totalPages);

      const [branchResponse, typeResponse] = await Promise.all([
        fetch("/api/lookups/branches", { cache: "no-store" }),
        fetch("/api/backend/document-types", { cache: "no-store" }),
      ]);
      if (!branchResponse.ok || !typeResponse.ok) throw new Error(t("documentPage.loadDocumentsFailed"));
      const [branchBody, typeBody] = await Promise.all([branchResponse.json(), typeResponse.json()]);

      setDocuments(
        documentRows
          .filter((row) => row.branch && !row.member)
          .map(mapDocument),
      );
      setBranches(Array.isArray(branchBody) ? branchBody : (branchBody?.data ?? []));
      setDocumentTypes(Array.isArray(typeBody) ? typeBody : (typeBody?.data ?? []));
    } catch (loadError) {
      setError(loadError.message || t("documentPage.loadDocumentsFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { loadPage(); }, [loadPage]);

  const branchOptions = useMemo(() => branches
    .map((branch) => {
      const value =
        branch.value ??
        branch.id ??
        branch.branchId ??
        branch.branch_id;

      return {
        value: value == null ? "" : String(value),
        label: label(branch, ""),
      };
    })
    .filter((option) => option.value && option.label), [branches, label]);
  const documentTypeOptions = useMemo(() => documentTypes.map((type) => ({
    value: String(type.id),
    label: label(type, type.code),
  })), [documentTypes, label]);

  const filteredDocuments = documents.filter((item) => {
    const searchValue = search.trim().toLowerCase();

    const matchSearch = item.title?.toLowerCase().includes(searchValue);
    const matchType = !typeFilter || item.type === typeFilter;
    const matchDate = !dateFilter || item.date === dateFilter;
    // A document with no branch (an org-wide document, not tied to any one
    // branch) stays visible no matter which branch is selected, rather than
    // disappearing under every branch filter.
    const matchBranch =
      selectedBranch === "all" ||
      item.branchId == null ||
      String(item.branchId) === String(selectedBranch);

    return matchSearch && matchType && matchDate && matchBranch;
  });

  const columns = [
    {
      header: t("documentPage.no"),
      width: "w-[6%]",
      align: "center",
      render: (_, index) => index ,
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
      width: "w-[25%]",
    },
    {
      header: t("documentPage.branch"),
      render: (item) =>
        locale === "en"
          ? item.branchNameEn || item.branchNameKm || "-"
          : item.branchNameKm || item.branchNameEn || "-",
      width: "w-[15%]",
    },
    {
      header: t("documentPage.date"),
      accessor: "date",
      width: "w-[15%]",
    },
    {
      header: t("documentPage.size"),
      accessor: "size",
      width: "w-[10%]",
    },
    {
  header: t("documentPage.documentType"),
  accessor: "type",
  width: "w-[10%]",
  align: "center",
  render: (item) => {
    const badgeStyle =
      DOCUMENT_TYPE_BADGE_STYLES[item.type] ||
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
        {item.type}
      </span>
    );
  },
},
    {
      header: t("documentPage.actions"),
      width: "w-[11%]",
      align: "center",
      render: (item) => (
        <div className="flex items-center justify-center ">
          <button
            type="button"
            onClick={() => setSelectedDocument({
              ...item,
              branch: locale === "en"
                ? item.branchNameEn || item.branchNameKm || "-"
                : item.branchNameKm || item.branchNameEn || "-",
            })}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-blue-50"
            aria-label={t("documentPage.viewDocument")}
          >
            <Eye size={18} className="text-blue-500" />
          </button>

          {canManageDocuments && (
            <>
              <button
                type="button"
                onClick={() => setEditDocument({ ...item })}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-yellow-50"
                aria-label={t("documentPage.editDocument")}
              >
                <Pencil size={18} className="text-yellow-500" />
              </button>

              <button
                type="button"
                onClick={() => setDeleteDocument(item)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-error-bg"
                aria-label={t("documentPage.deleteDocument")}
              >
                <Trash2 size={18} className="text-red-500" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const filters = [
    {
      name: "type",
      placeholder: t("documentPage.documentType"),
      value: typeFilter,
      options: [...new Set(documents.map((item) => item.type))].map(
        (type) => ({
          label: type,
          value: type,
        }),
      ),
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
    onClick={() => setShowAddForm(true)}
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

    <span>{t("documentPage.addDocument")}</span>
  </button>
);

  const handleAddSave = async (newDocumentFromForm) => {
    setSaving(true);
    setError("");
    try {
      for (const item of newDocumentFromForm.files) {
        const upload = new FormData();
        upload.append("file", item.file);
        const uploadResponse = await fetch("/api/backend/files/attachments", { method: "POST", body: upload });
        const uploadedFile = await uploadResponse.json().catch(() => null);
        if (!uploadResponse.ok) throw new Error(uploadedFile?.message || t("documentPage.uploadFailed"));
        const createResponse = await fetch("/api/backend/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type_id: Number(newDocumentFromForm.type),
            file_id: uploadedFile.id,
            title: newDocumentFromForm.title,
            description: newDocumentFromForm.description,
            branch_id: Number(newDocumentFromForm.branch),
          }),
        });
        const created = await createResponse.json().catch(() => null);
        if (!createResponse.ok) throw new Error(created?.message || t("documentPage.saveFailed"));
      }
      setForm(EMPTY_FORM);
      setShowAddForm(false);
      await loadPage();
    } catch (saveError) {
      setError(saveError.message || t("documentPage.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleEditSave = async (updatedDocument) => {
    let fileId = updatedDocument.fileId;

    if (updatedDocument.replacementFile) {
      const upload = new FormData();
      upload.append("file", updatedDocument.replacementFile);
      const uploadResponse = await fetch("/api/backend/files/attachments", { method: "POST", body: upload });
      const uploadedFile = await uploadResponse.json().catch(() => null);
      if (!uploadResponse.ok || !uploadedFile?.id) {
        throw new Error(uploadedFile?.message || t("documentPage.uploadFailed"));
      }
      fileId = uploadedFile.id;
    }

    const response = await fetch(`/api/backend/documents/${updatedDocument.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type_id: updatedDocument.typeId,
        file_id: fileId,
        title: updatedDocument.title,
        description: updatedDocument.description || "",
        branch_id: Number(updatedDocument.branch),
      }),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(body?.message || t("documentPage.updateFailed"));
    setEditDocument(null);
    await loadPage();
  };

  const handleDeleteConfirm = async () => {
    const response = await fetch(`/api/backend/documents/${deleteDocument.id}`, { method: "DELETE" });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.message || t("documentPage.deleteFailed"));
      return;
    }
    setDeleteDocument(null);
    await loadPage();
  };

  return (
    <>
      {error ? <div className="mb-3 rounded-md border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">{error}</div> : null}
      <DataTable
        data={loading ? [] : filteredDocuments}
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
            fileName: t("documentPage.companyFileName"),
          })
        }
        searchPlaceholder={t("documentPage.searchPlaceholder")}
        emptyMessage={t("documentPage.emptyMessage")}
      />

      {canManageDocuments && showAddForm && (
        <AddDocumentForm
          form={form}
          setForm={setForm}
          onClose={() => setShowAddForm(false)}
          onSave={handleAddSave}
          branchOptions={branchOptions}
          documentTypeOptions={documentTypeOptions}
          saving={saving}
        />
      )}

      {canManageDocuments && editDocument && (
        <EditDocumentForm
          form={editDocument}
          setForm={setEditDocument}
          onClose={() => setEditDocument(null)}
          onSave={handleEditSave}
          branchOptions={branchOptions}
          documentTypeOptions={documentTypeOptions}
        />
      )}

      {selectedDocument && (
        <CompanyDocumentPreview
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}

      {canManageDocuments && deleteDocument && (
        <DeleteConfirmModal
          open
          onClose={() => setDeleteDocument(null)}
          onConfirm={handleDeleteConfirm}
          title={t("documentPage.deleteDocument")}
          message={`${t("documentPage.confirmDeletePrefix")}${deleteDocument.title}${t("documentPage.confirmDeleteSuffix")}`}
        />
      )}
    </>
  );
}

function mapDocument(row) {
  const extension = row.file?.originalName?.split(".").pop()?.toUpperCase();
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    branch: String(row.branch?.id || ""),
    branchNameKm: row.branch?.nameKm || row.branch?.name_km || "",
    branchNameEn: row.branch?.nameEn || row.branch?.name_en || "",
    branchId: row.branch?.id,
    date: row.created_at ? row.created_at.slice(0, 10) : "-",
    size: formatSize(row.file?.sizeBytes),
    type: extension || row.type?.code || "FILE",
    typeId: row.type?.id,
    fileId: row.file?.id,
    isImage: ["PNG", "JPG", "JPEG", "WEBP", "GIF"].includes(extension),
    image: row.file?.id ? `/api/backend/files/${row.file.id}/content` : "/document.jpg",
    files: row.file ? [{ name: row.file.originalName, size: formatSize(row.file.sizeBytes), type: extension || "FILE" }] : [],
  };
}

function formatSize(bytes) {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
