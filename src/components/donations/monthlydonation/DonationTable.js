"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import FilterBar from "../../forms/FilterBar";
import AddAlert from "../../forms/addalert";
import SaveAlert from "../../forms/savealert";
import SaveButton from "../../forms/save";
import Pagination from "../../navigation/Pagination";
import TableRow from "./TableRow";
import { downloadTableAsExcel } from "@/utils/downloadExcel";
import useCurrentMember from "@/hooks/useCurrentMember";
import { useBranch } from "@/context/BranchContext";
import { fetchMyAccountCollection } from "@/lib/myAccountCollections";
import { useLanguage } from "@/context/LanguageContext";
import { localizedValue } from "@/lib/i18n";

const parseMoney = (value) => Number(String(value || "").replace(/[^\d.-]/g, "")) || 0;

const KHMER_MONTHS = [
  "មករា",
  "កុម្ភៈ",
  "មីនា",
  "មេសា",
  "ឧសភា",
  "មិថុនា",
  "កក្កដា",
  "សីហា",
  "កញ្ញា",
  "តុលា",
  "វិច្ឆិកា",
  "ធ្នូ",
];
const EN_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const getMonthLabel = (month, locale = "km") =>
  (locale === "en" ? EN_MONTHS : KHMER_MONTHS)[Number(month) - 1] || month;

export default function DonationTable() {
  const { t, label, locale } = useLanguage();
  const {
    member: currentMember,
    loading: currentMemberLoading,
    error: currentMemberError,
  } = useCurrentMember();
  // useCurrentMember() only ever carries ONE branchId (the member profile's
  // home branch). A secretary/branch_leader can be assigned to more than
  // one branch though, so the authoritative list of branches this viewer
  // may see is /api/lookups/branches via useBranch() — the same
  // server-scoped source ActivityPage's branch filter already relies on.
  // currentMember.branchId is kept only as a fallback for the brief window
  // before that context resolves.
  const {
    branches: accessibleBranches = [],
    selectedBranch: globalSelectedBranch = "all",
  } = useBranch();
  const effectiveRole = currentMember?.effectiveRole || currentMember?.role;
  const isBranchScoped = ["secretary", "branch_leader"].includes(
    effectiveRole,
  );
  const isMemberScoped = effectiveRole === "member";
  const isReadOnlyViewer = Boolean(currentMember?.isViewer);
  // A secretary/branch_leader is always scoped to exactly ONE branch — the
  // one currently active in the sidebar's global branch dropdown (see
  // BranchContext, which never lets this role's selection settle on the
  // combined "all" view) — never a merged multi-branch view. The
  // accessibleBranches[0]/currentMember.branchId fallbacks only cover the
  // brief window before BranchContext's own fetch resolves.
  const effectiveBranchId = useMemo(() => {
    if (!isBranchScoped) return null;

    if (globalSelectedBranch && globalSelectedBranch !== "all") {
      return String(globalSelectedBranch);
    }

    if (accessibleBranches.length > 0) {
      return String(accessibleBranches[0].id);
    }

    return currentMember?.branchId ? String(currentMember.branchId) : null;
  }, [
    isBranchScoped,
    globalSelectedBranch,
    accessibleBranches,
    currentMember?.branchId,
  ]);
  const rowsPerPage = 12;
  const headers = [
    t("donationPage.no"),
    t("donationPage.month"),
    t("donationPage.year"),
    t("memberPage.branch"),
    t("donationPage.amountKhrPlain"),
    t("donationPage.amountUsdPlain"),
    t("donationPage.totalAllUsd"),
    t("donationPage.action"),
  ];
  const isAdmin = effectiveRole === "admin";
  // Real secretary/branch_leader (never a viewer) get full manage
  // (edit+delete). Everyone else who still sees this column — real admin,
  // and every viewer variant (viewer/admin, viewer/secretary,
  // viewer/branch_leader all resolve to one of those effectiveRoles above)
  // — gets a working Detail-only button instead of a disabled one: they can
  // always at least look, scoped the same way the row data itself already
  // is (their one branch for a scoped viewer, every branch for viewer/admin).
  const showActionColumn = isBranchScoped || isAdmin;
  const canManage = isBranchScoped && !isReadOnlyViewer;
  const showDetailOnly = showActionColumn && !canManage;
  const visibleHeaders = showActionColumn ? headers : headers.slice(0, -1);
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDownloadAlert, setShowDownloadAlert] = useState(false);
  const [showSaveAlert, setShowSaveAlert] = useState(false);
  const [moneySort, setMoneySort] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const refresh = () => setRefreshKey((value) => value + 1);
    window.addEventListener("tnal-youth:donations-updated", refresh);
    return () => window.removeEventListener("tnal-youth:donations-updated", refresh);
  }, []);

  const years = useMemo(() => [...new Set(rows.map((row) => row.year))], [rows]);
  const months = useMemo(
    () =>
      [...new Set(rows.map((row) => row.month))]
        .sort((left, right) => Number(left) - Number(right))
        .map((month) => ({
          value: month,
          label: getMonthLabel(month, locale),
        })),
    [rows, locale],
  );
  const branches = useMemo(() => {
    if (isBranchScoped) {
      // Only the ONE currently-active branch — the sidebar's global
      // dropdown is now the sole place a secretary/branch_leader switches
      // branches, so this (disabled — see branchScoped on FilterBar below)
      // dropdown just displays which one is active, never a pick list.
      const match = accessibleBranches.find(
        (branch) => String(branch.id) === effectiveBranchId,
      );

      if (match) {
        return [
          {
            value: String(match.id),
            label: label(match, `Branch ${match.id}`),
          },
        ];
      }

      // Fallback for the brief window before useBranch() resolves.
      return effectiveBranchId
        ? [{ value: effectiveBranchId, label: currentMember?.branch || "-" }]
        : [];
    }

    const unique = new Map();
    rows.forEach((row) => unique.set(String(row.branchId), row.branch));
    return [...unique].map(([value, label]) => ({ value, label }));
  }, [rows, isBranchScoped, accessibleBranches, effectiveBranchId, currentMember?.branch, label]);
  const handleDelete = () => setError(t("donationPage.openMonthlyDetailToDelete"));
  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const matchesYear = selectedYear === "all" || row.year === selectedYear;
        const matchesMonth = selectedMonth === "all" || row.month === selectedMonth;
        const matchesBranch = selectedBranch === "all" || String(row.branchId) === String(selectedBranch);

        return matchesYear && matchesMonth && matchesBranch;
      }),
    [rows, selectedYear, selectedMonth, selectedBranch],
  );
  const sortedRows = useMemo(() => {
    if (!moneySort) return filteredRows;

    return [...filteredRows].sort((a, b) => {
      const difference = parseMoney(a[moneySort.field]) - parseMoney(b[moneySort.field]);
      return moneySort.direction === "asc" ? difference : -difference;
    });
  }, [filteredRows, moneySort]);

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

  // Keep the (disabled, for this role — see branchScoped below) branch
  // filter's value in lockstep with whichever single branch is currently
  // active, so filteredRows' matchesBranch check (and the FilterBar
  // display) always reflect it instead of a stale earlier selection.
  useEffect(() => {
    if (isBranchScoped && effectiveBranchId) {
      setSelectedBranch(effectiveBranchId);
    }
  }, [isBranchScoped, effectiveBranchId]);

  const handleDownload = () => {
    const rows = sortedRows.map((row, index) => ({
      [t("donationPage.no")]: index + 1,
      [t("donationPage.month")]: row.monthLabel,
      [t("donationPage.year")]: row.year,
      [t("memberPage.branch")]: row.branch,
      [t("donationPage.amountKhrPlain")]: row.monthlyRiel,
      [t("donationPage.amountUsdPlain")]: row.monthlyUsd,
      [t("donationPage.totalAllUsd")]: row.total,
    }));

    const branchLabel =
      selectedBranch !== "all"
        ? branches.find((option) => String(option.value) === String(selectedBranch))?.label
        : null;

    if (
      downloadTableAsExcel({
        data: rows,
        fileName: branchLabel ? `${t("donationPage.monthlyDonationFile")}-${branchLabel}` : t("donationPage.monthlyDonationFile"),
      })
    ) {
      setShowDownloadAlert(true);
    }
  };

  useEffect(() => {
    // A branch switch must never leave the previous branch visible while the
    // new request is in flight. Reset both data and branch-local filters.
    if (isBranchScoped) {
      setRows([]);
      setCurrentPage(1);
      setSelectedYear("all");
      setSelectedMonth("all");
      setSelectedBranch(effectiveBranchId || "all");
    }
  }, [isBranchScoped, effectiveBranchId]);

  useEffect(() => {
    if (currentMemberLoading) return undefined;

    let cancelled = false;
    async function loadRows() {
      setLoading(true);
      setError("");
      try {
        if (isBranchScoped && !effectiveBranchId) {
          throw new Error(t("donationPage.accountBranchNotSet"));
        }

        if (isMemberScoped) {
          const myRows = await fetchMyAccountCollection("donations/monthly");
          if (!cancelled) setRows(myRows.map((row) => mapMyMonthlyRow(row, locale)));
          return;
        }

        if (isBranchScoped) {
          // Scoped to exactly the one currently-active branch (see
          // effectiveBranchId above) — switching branches happens only via
          // the sidebar's global dropdown now, which re-runs this effect.
          const response = await fetch(
            `/api/backend/donations/monthly?${new URLSearchParams({
              page: "0",
              size: "100",
              branchId: effectiveBranchId,
            })}`,
            { cache: "no-store", credentials: "include" },
          );
          const body = await response.json().catch(() => null);

          if (!response.ok) {
            throw new Error(t("donationPage.loadMonthlyDonationsFailed"));
          }

          const page = body?.data ?? body;
          if (!cancelled) {
            setRows((Array.isArray(page?.items) ? page.items : []).map((row) => mapMonthlyRow(row, locale)));
          }
          return;
        }

        const query = new URLSearchParams({ page: "0", size: "100" });
        const response = await fetch(`/api/backend/donations/monthly?${query}`, {
          cache: "no-store",
          credentials: "include",
        });
        const body = await response.json().catch(() => null);
        if (!response.ok || body?.success === false) throw new Error(t("donationPage.loadMonthlyDonationsFailed"));
        const page = body?.data ?? body;
        if (!cancelled) {
          setRows((Array.isArray(page?.items) ? page.items : []).map((row) => mapMonthlyRow(row, locale)));
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || t("donationPage.loadMonthlyDonationsFailed"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadRows();
    return () => { cancelled = true; };
  }, [currentMemberLoading, isBranchScoped, isMemberScoped, effectiveBranchId, locale, t, refreshKey]);

  useEffect(() => {
    if (!showDownloadAlert && !showSaveAlert) return undefined;

    const timeoutId = window.setTimeout(() => {
      setShowDownloadAlert(false);
      setShowSaveAlert(false);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [showDownloadAlert, showSaveAlert]);

  return (
    <section className="rounded-md border border-border bg-bg-page-white px-7 py-4 shadow-sm">
      {error || currentMemberError ? <div className="mb-4 rounded-md border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">{error || currentMemberError}</div> : null}
      {showDownloadAlert && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/25 pt-10">
          <AddAlert />
        </div>
      )}

      {showSaveAlert && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/25 pt-10">
          <SaveAlert />
        </div>
      )}

      <FilterBar
        years={years}
        months={months}
        branches={branches}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        selectedBranch={selectedBranch}
        onYearChange={updateFilter(setSelectedYear)}
        onMonthChange={updateFilter(setSelectedMonth)}
        onBranchChange={updateFilter(setSelectedBranch)}
        /*
         * FilterBar locks the branch dropdown to a single value whenever
         * branchScoped is true. A secretary/branch_leader is now always
         * scoped to exactly one branch (switched only via the sidebar's
         * global dropdown — see effectiveBranchId above), so this lock
         * applies unconditionally for that role, not just when they
         * happen to be staff of only one branch.
         */
        branchScoped={isBranchScoped}
      />

      <div className="mt-[17px] overflow-x-auto">
        <table className="w-full min-w-[840px] border-collapse border border-border">
          <thead>
            <tr className="h-12 border-b border-border bg-bg-page-gray text-center text-xs font-medium text-text-secondary">
              {visibleHeaders.map((header, index) => (
                <th key={header} className="px-4">
                  {index >= 4 && index <= 6 ? (
                    <button
                      type="button"
                      onClick={() => {
                        const field = ["monthlyRiel", "monthlyUsd", "total"][index - 4];
                        setMoneySort((current) => ({
                          field,
                          direction: current?.field === field && current.direction === "asc" ? "desc" : "asc",
                        }));
                        setCurrentPage(1);
                      }}
                      className="mx-auto inline-flex items-center justify-center gap-1.5 font-medium transition hover:text-primary"
                      aria-label={`Sort ${header}`}
                    >
                      {header}
                      {moneySort?.field === ["monthlyRiel", "monthlyUsd", "total"][index - 4] && moneySort.direction === "asc" ? (
                        <ArrowUp size={14} />
                      ) : moneySort?.field === ["monthlyRiel", "monthlyUsd", "total"][index - 4] && moneySort.direction === "desc" ? (
                        <ArrowDown size={14} />
                      ) : (
                        <ChevronsUpDown size={14} />
                      )}
                    </button>
                  ) : (
                    header
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {!loading && pagedRows.map((row, index) => (
              <TableRow
                key={row.id}
                row={row}
                rowNumber={(safePage - 1) * rowsPerPage + index + 1}
                onDelete={handleDelete}
                hasMoney={row.donorCount > 0}
                canManage={canManage}
                showAction={showActionColumn}
                showDetailOnly={showDetailOnly}
              />
            ))}
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={visibleHeaders.length} className="px-4 py-8 text-center text-xs font-medium text-text-secondary">
                  {t("donationPage.noData")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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

function mapMonthlyRow(row, locale = "km") {
  const period = row.donationPeriod ? new Date(`${row.donationPeriod}T00:00:00`) : null;
  return {
    id: `${row.branchId}-${row.donationPeriod}`,
    branchId: row.branchId,
    branch: localizedValue({
      nameKm: row.branchNameKm,
      nameEn: row.branchNameEn,
      code: row.branchCode,
    }, locale, "-"),
    month: period ? String(period.getMonth() + 1).padStart(2, "0") : "-",
    monthLabel: period ? getMonthLabel(period.getMonth() + 1, locale) : "-",
    year: period ? String(period.getFullYear()) : "-",
    monthlyRiel: Number(row.totalKhr || 0).toLocaleString(),
    monthlyUsd: Number(row.totalUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
    total: Number(row.overallTotalUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
    donorCount: Number(row.donorCount || 0),
  };
}

// Maps a single MyDonationResponse (member's own monthly donation record)
// into the same row shape mapMonthlyRow produces, so the table/columns are
// reused as-is for the member's read-only "my donations" view.
function mapMyMonthlyRow(row, locale = "km") {
  const period = row.donationPeriod ? new Date(`${row.donationPeriod}T00:00:00`) : null;
  return {
    id: row.id,
    branchId: row.branch?.id ?? null,
    branch: localizedValue(row.branch, locale, "-"),
    month: period ? String(period.getMonth() + 1).padStart(2, "0") : "-",
    monthLabel: period ? getMonthLabel(period.getMonth() + 1, locale) : "-",
    year: period ? String(period.getFullYear()) : "-",
    monthlyRiel: Number(row.amountKhr || 0).toLocaleString(),
    monthlyUsd: Number(row.amountUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
    total: Number(row.totalAmountUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
    donorCount: 1,
  };
}
