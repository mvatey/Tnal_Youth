"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, CalendarDays, ChevronsUpDown, FileText, PencilLineIcon, PencilRulerIcon, PenSquareIcon, PlusCircle, Search, SquarePen, SquarePenIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import SponsorTypeSelect from "@/components/forms/sponsorTypeSelect";
import Pagination from "@/components/navigation/Pagination";
import SaveButton from "@/components/forms/save";
import AddAlert from "@/components/forms/addalert";
import SaveAlert from "@/components/forms/savealert";
import tableHeaders from "@/data/donation/tableHeaders.json";
import { MdEditSquare } from "react-icons/md";
import { HiPencilSquare } from "react-icons/hi2";
import { BsPencilSquare } from "react-icons/bs";
import { PiPencilSlash } from "react-icons/pi";
import { VscEditSparkle } from "react-icons/vsc";
import { downloadTableAsExcel } from "@/utils/downloadExcel";
import DonationFilterSelect from "@/components/donations/monthlydonation/DonationFilterSelect";
import DonationTotalsCard from "@/components/donations/DonationTotalsCard";
import useCurrentMember from "@/hooks/useCurrentMember";
import { fetchMyAccountCollection } from "@/lib/myAccountCollections";
import useUsdKhrExchangeRate from "@/lib/useUsdKhrExchangeRate";
import { useLanguage } from "@/context/LanguageContext";
import { localizedValue } from "@/lib/i18n";

const { sponsorHeaders: fallbackHeaders } = tableHeaders;
const rowsPerPage = 12;
const parseMoney = (value) => Number(String(value || "").replace(/[^\d.-]/g, "")) || 0;


function SponsorReceiptPreview({ receipt }) {
  if (!receipt) {
    return null;
  }

  return (
    <span
      className="inline-flex h-8 w-11 items-center justify-center overflow-hidden rounded-md border border-secondary/20 bg-bg-page-white text-secondary shadow-sm"
      title={receipt.name || "Receipt"}
    >
      {receipt.type?.startsWith("image/") ? (
        <img
          src={receipt.dataUrl}
          alt={receipt.name || "Receipt"}
          className="h-full w-full object-cover"
        />
      ) : (
        <FileText size={17} strokeWidth={2.2} />
      )}
    </span>
  );
}

function DateFilter({ value, onChange }) {
  const { t } = useLanguage();

  return (
    <label className="relative block h-[34px] w-full cursor-pointer">
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        aria-label={t("documentPage.date")}
       
      />
      <span className="flex h-full w-full items-center justify-between rounded-lg border border-border bg-bg-page-white px-3 text-[16px] font-Semibold text-text-secondary shadow-sm transition hover:border-secondary">
        <span className="truncate">{value || t("documentPage.date")}</span>
        <CalendarDays size={16} strokeWidth={2.2} />
      </span>
    </label>
  );
}

export default function SponsorPanel({
  selectedBranch: controlledSelectedBranch,
  onBranchChange,
  showAddButton = true,
  typeOptions,
  activityId,
  addQuery = "",
  // When true, the branch filter below is locked to whichever single
  // branch the caller already scoped selectedBranch to (see
  // donation/sponsor/page.js and donation/eventdonation/page.js) — a
  // secretary/branch_leader has no "all branches" or manual-pick option
  // here, same lock FilterBar applies on the monthly donation table.
  branchScoped = false,
  // Forces this panel into a plain "GET and display" view regardless of
  // the viewer's role — no Add button, no per-row Edit pencil. Used by
  // EventDonationDetailTabs' Sponsor tab, which is a joined read-only
  // view of this same data scoped to one activity, not a place to manage
  // sponsor donations (that stays in the main "ថវិកាឧបត្ថម្ភ" module).
  readOnly = false,
}) {
  const { t, label, locale } = useLanguage();
  const exchangeRateKhrPerUsd = useUsdKhrExchangeRate();
  const router = useRouter();
  const pathname = usePathname();
  const { member: currentMember } = useCurrentMember();
  // Only entry staff (secretary / branch_leader) may add or edit sponsor
  // donations — admin/viewer are view-only, members see only their own
  // (read-only) sponsor donations. readOnly overrides this outright.
  const canManage =
    !readOnly && ["secretary", "branch_leader"].includes(currentMember?.role);
  const isMemberScoped = currentMember?.role === "member";
  const routePrefix = pathname?.startsWith("/admin/donation")
    ? "/admin/donation/sponsor"
    : "/donation/sponsor";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDownloadAlert, setShowDownloadAlert] = useState(false);
  const [showSaveAlert, setShowSaveAlert] = useState(false);
  const [moneySort, setMoneySort] = useState(null);
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [internalSelectedBranch, setInternalSelectedBranch] = useState("all");
  const [branchOptions, setBranchOptions] = useState([]);
  const selectedBranch = controlledSelectedBranch ?? internalSelectedBranch;
  const setSelectedBranch = onBranchChange ?? setInternalSelectedBranch;
  const selectedBranchLabel =
    branchOptions.find((option) => String(option.value) === String(selectedBranch))?.label ||
    "-";
  const headers = useMemo(
    () => [
      t("donationPage.no"),
      t("donationPage.sponsorName"),
      t("donationPage.sponsorType"),
      t("donationPage.phone"),
      t("donationPage.email"),
      t("documentPage.date"),
      t("donationPage.amountKhrPlain"),
      t("donationPage.amountUsdPlain"),
      t("donationPage.paymentMethod"),
      t("donationPage.action"),
    ],
    [t],
  );

  useEffect(() => {
    let cancelled = false;
    async function loadRows() {
      setLoading(true);
      setError("");
      try {
        if (isMemberScoped) {
          const myRows = await fetchMyAccountCollection("donations/sponsors");
          if (!cancelled) {
            setAllRows(myRows.map((row) => mapMySponsorRow(row, currentMember, locale)));
          }
          return;
        }

        // For SECRETARY / BRANCH_LEADER the selected global branch is
        // mandatory. Never issue an unscoped request: the backend correctly
        // rejects that for a multi-branch Secretary because it cannot guess
        // which assigned branch is currently active.
        if (branchScoped && (!selectedBranch || selectedBranch === "all")) {
          if (!cancelled) setAllRows([]);
          return;
        }

        const params = new URLSearchParams({ page: "0", size: "100" });
        if (selectedBranch && selectedBranch !== "all") {
          params.set("branchId", String(selectedBranch));
        }

        const response = await fetch(`/api/backend/donations/sponsor?${params.toString()}`, {
          cache: "no-store",
          credentials: "include",
        });
        const body = await response.json().catch(() => null);
        if (!response.ok || body?.success === false) throw new Error(t("donationPage.loadSponsorDonationsFailed"));
        const page = body?.data ?? body;
        if (!cancelled) setAllRows((Array.isArray(page?.items) ? page.items : []).map((row) => mapSponsorRow(row, locale)));
      } catch (loadError) {
        if (!cancelled) {
          setAllRows([]);
          setError(loadError.message || t("donationPage.loadSponsorDonationsFailed"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadRows();
    return () => { cancelled = true; };
  }, [branchScoped, currentMember, isMemberScoped, selectedBranch, locale, t]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/lookups/branches", { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) throw new Error(t("donationPage.loadBranchesFailed"));
        if (!cancelled) setBranchOptions((Array.isArray(body) ? body : []).map((branch) => ({
          value: String(branch.value ?? branch.id),
          label: label(branch, branch.code || "-"),
        })));
      })
      .catch(() => { if (!cancelled) setError(t("donationPage.loadBranchesFailed")); });
    return () => { cancelled = true; };
  }, [label, t]);

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return allRows.filter((row) => {
      const matchesSearch =
        !query ||
        row.name.toLowerCase().includes(query) ||
        row.phone.includes(query) ||
        row.email.toLowerCase().includes(query);
      const matchesType = !selectedType || row.type === selectedType || row.donorKind === selectedType;
      const matchesDate = !selectedDate || row.dateValue === selectedDate;
      const matchesBranch =
        selectedBranch === "all" || String(row.branchId) === String(selectedBranch);
      // When scoped to a specific activity (e.g. the event-donation
      // detail page's Sponsor tab), only that activity's sponsor
      // donations belong here — everything else stays hidden, not just
      // filtered out of the count.
      const matchesActivity =
        !activityId || String(row.activityId) === String(activityId);

      return matchesSearch && matchesType && matchesDate && matchesBranch && matchesActivity;
    });
  }, [activityId, allRows, searchQuery, selectedBranch, selectedDate, selectedType]);

  const sortedRows = useMemo(() => {
    if (!moneySort) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const difference = parseMoney(a[moneySort.field]) - parseMoney(b[moneySort.field]);
      return moneySort.direction === "asc" ? difference : -difference;
    });
  }, [filteredRows, moneySort]);

  // Totals across every currently-filtered row (same set the table below
  // shows, not just the current page) — only rendered in readOnly mode
  // (see below), matching the same totals card used on the Members/Branch
  // tabs of the event-donation detail page.
  const totals = useMemo(() => {
    const riel = sortedRows.reduce((sum, row) => sum + parseMoney(row.rielAmount), 0);
    const dollar = sortedRows.reduce((sum, row) => sum + parseMoney(row.dollarAmount), 0);
    return { riel, dollar, total: dollar + riel / (exchangeRateKhrPerUsd || 4000) };
  }, [sortedRows]);

  const showActionColumn = canManage || sortedRows.some((row) => Boolean(row.receipt));
  const visibleHeaders = showActionColumn ? headers : headers.slice(0, -1);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const pagedRows = sortedRows.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage,
  );

  const updateFilter = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleDownload = () => {
    const rows = sortedRows.map((row, index) => ({
      [t("donationPage.no")]: index + 1,
      [t("donationPage.sponsorName")]: row.name,
      [t("donationPage.sponsorType")]: row.type,
      [t("donationPage.phone")]: row.phone,
      [t("donationPage.email")]: row.email,
      [t("memberPage.branch")]: row.branch,
      [t("documentPage.date")]: row.date,
      [t("donationPage.amountKhrPlain")]: row.rielAmount,
      [t("donationPage.amountUsdPlain")]: row.dollarAmount,
    }));

    if (
      downloadTableAsExcel({
        data: rows,
        fileName:
          selectedBranch !== "all" ? `${t("donationPage.sponsorDonationFile")}-${selectedBranchLabel}` : t("donationPage.sponsorDonationFile"),
      })
    ) {
      setShowDownloadAlert(true);
    }
  };

  useEffect(() => {
    if (!showDownloadAlert && !showSaveAlert) return undefined;

    const timeoutId = window.setTimeout(() => {
      setShowDownloadAlert(false);
      setShowSaveAlert(false);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [showDownloadAlert, showSaveAlert]);

  return (
    <section className="min-h-[650px] min-w-0 rounded-md border border-border bg-bg-page-white px-4 py-4 shadow-sm sm:px-7">
      {showDownloadAlert && (
        <div className="fixed right-6 top-6 z-[100]">
          <AddAlert message={t("common.downloadSuccess")} />
        </div>
      )}

      {showSaveAlert && (
        <div className="fixed right-6 top-6 z-[100]">
          <SaveAlert message={t("donationPage.sponsorDonationSaved")} />
        </div>
      )}

      {error ? <div className="mb-4 rounded-md border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">{error}</div> : null}

      <div className="mb-4 flex flex-col gap-4">
        <h1 className="text-base font-semibold text-secondary">
          {t("donationPage.sponsorDonationRecordTitle")}
          {selectedBranch !== "all" && ` — ${selectedBranchLabel}`}
        </h1>

        {!readOnly && (
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-center">
            <label className="block h-[34px] w-full">
              <span className="flex h-full items-center rounded-lg border border-border bg-bg-page-white px-3 shadow-sm">
                <input
                  className=" flex-1 bg-transparent pr-2 text-[12px] font-medium text-text-secondary outline-none placeholder:text-text-secondary focus:placeholder-transparent"
                  value={searchQuery}
                  onChange={(event) => updateFilter(setSearchQuery)(event.target.value)}
                  placeholder={t("donationPage.searchSponsorPlaceholder")}
                />
                <Search size={16} className="text-text-secondary" />
              </span>
            </label>

            <SponsorTypeSelect
              value={selectedType}
              onChange={updateFilter(setSelectedType)}
              options={typeOptions}
              placeholder={t("donationPage.sponsorType")}
              className="w-full"
              size="compact"
            />

            <DonationFilterSelect
              label={t("memberPage.branch")}
              value={selectedBranch}
              onChange={updateFilter(setSelectedBranch)}
              options={branchOptions}
              allLabel={t("branchPage.allBranches")}
              showLabel={false}
              className="w-full"
              disabled={branchScoped}
              includeAllOption={!branchScoped}
            />

            <DateFilter
              value={selectedDate}
              onChange={updateFilter(setSelectedDate)}
            />

            {showAddButton && canManage && (
              <button
                type="button"
                onClick={() => {
                  const scopedQuery =
                    addQuery ||
                    (selectedBranch && selectedBranch !== "all"
                      ? `?branch=${encodeURIComponent(selectedBranch)}`
                      : "");
                  router.push(`${routePrefix}/add${scopedQuery}`);
                }}
                className="inline-flex h-[34px] w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-700 sm:col-span-2 xl:col-span-1 xl:w-auto"
              >
                <PlusCircle size={17} />
                {t("donationPage.addSponsorDonation")}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-bg-page-white shadow-sm">
        <table className="w-full min-w-[980px] border-collapse">
          <thead>
            <tr className="h-12 border-b border-border bg-bg-page-gray text-center text-xs font-medium text-text-secondary">
              {visibleHeaders.map((header, index) => (
                <th
                  key={header}
                  className={`px-4 ${header === "លេខទូរស័ព្ទ" ? "whitespace-nowrap" : ""}`}
                >
                  {index === 6 || index === 7 ? (
                    <button
                      type="button"
                      onClick={() => {
                        const field = index === 6 ? "rielAmount" : "dollarAmount";
                        setMoneySort((current) => ({
                          field,
                          direction: current?.field === field && current.direction === "asc" ? "desc" : "asc",
                        }));
                        setCurrentPage(1);
                      }}
                      className="mx-auto inline-flex items-center justify-center gap-1.5 font-medium transition hover:text-primary"
                    >
                      {header}
                      {moneySort?.field === (index === 6 ? "rielAmount" : "dollarAmount") && moneySort.direction === "asc" ? (
                        <ArrowUp size={14} />
                      ) : moneySort?.field === (index === 6 ? "rielAmount" : "dollarAmount") && moneySort.direction === "desc" ? (
                        <ArrowDown size={14} />
                      ) : (
                        <ChevronsUpDown size={14} />
                      )}
                    </button>
                  ) : header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {!loading && pagedRows.map((row, index) => (
              <tr
                key={row.id}
                className="h-11 border-b border-border text-center text-sm text-text-secondary last:border-b-0"
              >
                <td className="px-4">{(safePage - 1) * rowsPerPage + index + 1}</td>
                <td className="px-4">{row.name}</td>
                <td className="px-4">{row.type}</td>
                <td className="whitespace-nowrap px-4">{row.phone}</td>
                <td className="px-4">{row.email}</td>
                <td className="whitespace-nowrap px-4">{row.date}</td>
                <td className="px-4">
                  {row.rielAmount || "0"}
                </td>
                <td className="px-4">
                  {row.dollarAmount || "0"}
                </td>
                <td className="px-4">{row.method}</td>
                {showActionColumn && (
                  <td className="px-4">
                    <div className="inline-flex items-center justify-center gap-2">
                      {canManage && (
                        <button
                          type="button"
                          onClick={() => router.push(`${routePrefix}/edit?id=${row.id}`)}
                          className="inline-flex h-[20px] w-[24px] items-center justify-center rounded-[8px] text-[#D4AF37] transition hover:text-[#b88f1f]"
                          aria-label={`Edit sponsor ${row.id}`}
                        >
                          <BsPencilSquare size={16} />
                        </button>
                      )}
                      <SponsorReceiptPreview receipt={row.receipt} />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {readOnly && sortedRows.length > 0 && (
        <DonationTotalsCard
          title={t("donationPage.totalSponsorDonation")}
          riel={totals.riel}
          dollar={totals.dollar}
          total={totals.total}
        />
      )}

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <div className="mt-10 flex justify-end">
        <SaveButton onClick={handleDownload} disabled={sortedRows.length === 0} />
      </div>
    </section>
  );
}

function mapSponsorRow(row, locale = "km") {
  const donorKindLabels = {
    km: {
      MEMBER: "សមាជិក",
      INDIVIDUAL: "បុគ្គល",
      ORGANIZATION: "ស្ថាប័ន",
      INSTITUTION: "ស្ថាប័ន",
    },
    en: {
      MEMBER: "Member",
      INDIVIDUAL: "Individual",
      ORGANIZATION: "Organization",
      INSTITUTION: "Institution",
    },
  };
  const labels = locale === "en" ? donorKindLabels.en : donorKindLabels.km;
  return {
    id: row.donationId,
    name: row.name || "-",
    type: labels[row.donorKind] || row.donorKind || "-",
    donorKind: row.donorKind,
    phone: row.phone || "-",
    email: row.email || "-",
    branch: localizedValue({
      nameKm: row.branchNameKm,
      nameEn: row.branchNameEn,
    }, locale, "-"),
    branchId: row.branchId,
    activityId: row.activityId,
    date: row.paidAt ? new Date(row.paidAt).toLocaleDateString("en-GB") : "-",
    dateValue: row.paidAt ? row.paidAt.slice(0, 10) : "",
    rielAmount: Number(row.amountKhr || 0).toLocaleString(),
    dollarAmount: Number(row.amountUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
    method: localizedValue({
      labelKm: row.paymentMethodLabelKm,
      labelEn: row.paymentMethodLabelEn,
      code: row.paymentMethodCode,
    }, locale, "-"),
    receipt: row.receiptFileId ? {
      name: "Receipt",
      dataUrl: `/api/backend/files/${row.receiptFileId}/content`,
      type: "image/unknown",
    } : null,
  };
}

// Maps a single MyDonationResponse (member's own sponsor-type donation)
// into the same row shape mapSponsorRow produces, so this table is reused
// as-is for the member's read-only "my donations" view.
function mapMySponsorRow(row, currentMember, locale = "km") {
  const memberName =
    currentMember?.name_kh ||
    currentMember?.name_en ||
    currentMember?.full_name_km ||
    currentMember?.fullNameKm ||
    currentMember?.full_name_en ||
    currentMember?.fullNameEn ||
    "-";

  return {
    id: row.id,
    // A member sponsor donation is owned through donations.member_id.
    // Older rows may have neither sponsor_id nor donor_name populated,
    // so fall back to the logged-in member identity instead of showing '-'.
    name: row.sponsor?.name || row.donorName || memberName,
    type: locale === "en" ? "Member" : "សមាជិក",
    donorKind: "MEMBER",
    phone: row.sponsor?.phone || "-",
    email: row.sponsor?.email || "-",
    branch: localizedValue(row.branch, locale, "-"),
    branchId: row.branch?.id,
    activityId: row.activity?.id ?? row.activityId,
    date: row.paidAt ? new Date(row.paidAt).toLocaleDateString("en-GB") : "-",
    dateValue: row.paidAt ? row.paidAt.slice(0, 10) : "",
    rielAmount: Number(row.amountKhr || 0).toLocaleString(),
    dollarAmount: Number(row.amountUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
    method: localizedValue(row.paymentMethod, locale, "-"),
    receipt: row.receipt?.id ? {
      name: row.receipt.originalName || "Receipt",
      dataUrl: `/api/backend/files/${row.receipt.id}/content`,
      type: row.receipt.mimeType || "image/unknown",
    } : null,
  };
}
