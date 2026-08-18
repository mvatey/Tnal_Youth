"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import FilterBar from "../../forms/FilterBar";
import AddAlert from "../../forms/addalert";
import SaveAlert from "../../forms/savealert";
import SaveButton from "../../forms/save";
import Pagination from "../../navigation/Pagination";
import TableRow from "./TableRow";
import { downloadCsv } from "@/utils/downloadCsv";
import useCurrentMember from "@/hooks/useCurrentMember";
import { useBranch } from "@/context/BranchContext";
import { fetchMyAccountCollection } from "@/lib/myAccountCollections";

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

const getKhmerMonth = (month) =>
  KHMER_MONTHS[Number(month) - 1] || month;

export default function DonationTable() {
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
  const { branches: accessibleBranches = [] } = useBranch();
  const isBranchScoped = ["secretary", "branch_leader"].includes(
    currentMember?.role,
  );
  const isMemberScoped = currentMember?.role === "member";
  const scopedBranchIds = useMemo(() => {
    if (!isBranchScoped) return [];
    if (accessibleBranches.length > 0) {
      return accessibleBranches.map((branch) => String(branch.id));
    }
    return currentMember?.branchId ? [String(currentMember.branchId)] : [];
  }, [isBranchScoped, accessibleBranches, currentMember?.branchId]);
  const rowsPerPage = 12;
  const headers = [
    "ល.រ",
    "ខែ",
    "ឆ្នាំ",
    "សាខា",
    "ចំនួនប្រាក់រៀល",
    "ចំនួនប្រាក់ដុល្លារ",
    "ប្រាក់សរុប(ដុល្លារ)",
    "សកម្មភាព",
  ];
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

  const years = useMemo(() => [...new Set(rows.map((row) => row.year))], [rows]);
  const months = useMemo(
    () =>
      [...new Set(rows.map((row) => row.month))]
        .sort((left, right) => Number(left) - Number(right))
        .map((month) => ({
          value: month,
          label: getKhmerMonth(month),
        })),
    [rows],
  );
  const branches = useMemo(() => {
    if (isBranchScoped && accessibleBranches.length > 0) {
      // Every branch this account can access — not just the ones that
      // happen to already have a donation row loaded — so the dropdown
      // lets a secretary managing multiple branches pick a branch with
      // zero donations so far too.
      return accessibleBranches.map((branch) => ({
        value: String(branch.id),
        label: branch.nameKm || branch.nameEn || `សាខា ${branch.id}`,
      }));
    }

    const unique = new Map();
    rows.forEach((row) => unique.set(String(row.branchId), row.branch));
    const options = [...unique].map(([value, label]) => ({ value, label }));

    if (!isBranchScoped) return options;

    // Fallback for the brief window before useBranch() resolves.
    return options.length > 0
      ? options
      : scopedBranchIds.map((value) => ({
          value,
          label: currentMember?.branch || "-",
        }));
  }, [rows, isBranchScoped, accessibleBranches, scopedBranchIds, currentMember?.branch]);
  const handleDelete = () => setError("Open the monthly detail to delete an individual donation record.");
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

  const handleDownload = () => {
    if (downloadCsv(sortedRows, "monthly-donations.csv")) {
      setShowDownloadAlert(true);
    }
  };

  useEffect(() => {
    if (currentMemberLoading) return undefined;

    let cancelled = false;
    async function loadRows() {
      setLoading(true);
      setError("");
      try {
        if (isBranchScoped && scopedBranchIds.length === 0) {
          throw new Error("គណនីនេះមិនទាន់បានកំណត់សាខា។");
        }

        if (isMemberScoped) {
          const myRows = await fetchMyAccountCollection("donations/monthly");
          if (!cancelled) setRows(myRows.map(mapMyMonthlyRow));
          return;
        }

        if (isBranchScoped) {
          // The backend's monthly-donations endpoint is scoped to a single
          // branchId per call — a secretary/branch_leader assigned to more
          // than one branch previously only ever got the first one, with
          // no way to pick the other from the dropdown. Fetch each
          // accessible branch separately and merge the results instead.
          const responses = await Promise.all(
            scopedBranchIds.map((branchId) =>
              fetch(
                `/api/backend/donations/monthly?${new URLSearchParams({
                  page: "0",
                  size: "100",
                  branchId,
                })}`,
                { cache: "no-store", credentials: "include" },
              ),
            ),
          );
          const bodies = await Promise.all(
            responses.map((response) => response.json().catch(() => null)),
          );

          const failedIndex = responses.findIndex((response) => !response.ok);
          if (failedIndex !== -1) {
            throw new Error(
              bodies[failedIndex]?.message || "Unable to load monthly donations.",
            );
          }

          const merged = bodies.flatMap((body) => {
            const page = body?.data ?? body;
            return Array.isArray(page?.items) ? page.items : [];
          });

          // Dedupe by (branchId, period) before mapping to rows — if the
          // same branch/period ever comes back from more than one of the
          // per-branch calls above (e.g. scopedBranchIds briefly containing
          // a repeat while useBranch() is still settling), TableRow's
          // `key={row.id}` would otherwise collide, which React logs as a
          // console error and can drop/duplicate rows on screen.
          const seen = new Set();
          const deduped = merged.filter((item) => {
            const dedupeKey = `${item.branchId}-${item.donationPeriod}`;
            if (seen.has(dedupeKey)) return false;
            seen.add(dedupeKey);
            return true;
          });

          if (!cancelled) setRows(deduped.map(mapMonthlyRow));
          return;
        }

        const query = new URLSearchParams({ page: "0", size: "100" });
        const response = await fetch(`/api/backend/donations/monthly?${query}`, {
          cache: "no-store",
          credentials: "include",
        });
        const body = await response.json().catch(() => null);
        if (!response.ok || body?.success === false) throw new Error(body?.message || "Unable to load monthly donations.");
        const page = body?.data ?? body;
        if (!cancelled) {
          setRows((Array.isArray(page?.items) ? page.items : []).map(mapMonthlyRow));
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "Unable to load monthly donations.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadRows();
    return () => { cancelled = true; };
  }, [currentMemberLoading, isBranchScoped, isMemberScoped, scopedBranchIds]);

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
         * branchScoped is true — correct for a secretary/branch_leader with
         * exactly one branch (nothing to choose between), but it used to be
         * passed isBranchScoped directly, which locked the dropdown for
         * EVERY branch-scoped role even when scopedBranchIds held more than
         * one branch. Only lock it when there's truly nothing to pick from.
         */
        branchScoped={isBranchScoped && scopedBranchIds.length <= 1}
      />

      <div className="mt-[17px] overflow-x-auto">
        <table className="w-full min-w-[840px] border-collapse border border-border">
          <thead>
            <tr className="h-12 border-b border-border bg-bg-page-gray text-center text-xs font-medium text-text-secondary">
              {headers.map((header, index) => (
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
                canManage={isBranchScoped}
              />
            ))}
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={headers.length} className="px-4 py-8 text-center text-xs font-medium text-text-secondary">
                  មិនមានទិន្នន័យ
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
        <SaveButton onClick={handleDownload} />
      </div>
    </section>
    

  );
}

function mapMonthlyRow(row) {
  const period = row.donationPeriod ? new Date(`${row.donationPeriod}T00:00:00`) : null;
  return {
    id: `${row.branchId}-${row.donationPeriod}`,
    branchId: row.branchId,
    branch: row.branchNameKm || row.branchNameEn || row.branchCode || "-",
    month: period ? String(period.getMonth() + 1).padStart(2, "0") : "-",
    monthLabel: period ? getKhmerMonth(period.getMonth() + 1) : "-",
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
function mapMyMonthlyRow(row) {
  const period = row.donationPeriod ? new Date(`${row.donationPeriod}T00:00:00`) : null;
  return {
    id: row.id,
    branchId: row.branch?.id ?? null,
    branch: row.branch?.nameKm || row.branch?.nameEn || "-",
    month: period ? String(period.getMonth() + 1).padStart(2, "0") : "-",
    monthLabel: period ? getKhmerMonth(period.getMonth() + 1) : "-",
    year: period ? String(period.getFullYear()) : "-",
    monthlyRiel: Number(row.amountKhr || 0).toLocaleString(),
    monthlyUsd: Number(row.amountUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
    total: Number(row.totalAmountUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
    donorCount: 1,
  };
}
