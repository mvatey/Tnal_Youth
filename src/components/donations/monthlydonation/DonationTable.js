"use client";

import { useEffect, useMemo, useState } from "react";
import FilterBar from "../../forms/FilterBar";
import AddAlert from "../../forms/addalert";
import SaveButton from "../../forms/save";
import Pagination from "../../navigation/Pagination";
import TableRow from "./TableRow";
import donationData from "@/data/donation/donationData.json";

const { donationRows } = donationData;

const SAVED_DONATION_ROWS_KEY = "tnal-youth:saved-donation-rows";
const memberSampleMonths = [
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

const normalizeBranchName = (branch = "") =>
  branch
    .replaceAll("សាខា", "")
    .replaceAll("ខេត្ត", "")
    .replaceAll("ក្រុង", "")
    .replace(/\s/g, "");

const getBranchDisplayName = (branch = "") =>
  branch
    .replaceAll("សាខា", "")
    .replaceAll("ខេត្ត", "")
    .replaceAll("ក្រុង", "")
    .trim();

const branchesMatch = (rowBranch, scopedBranch) => {
  if (!scopedBranch) return true;

  const normalizedRowBranch = normalizeBranchName(rowBranch);
  const normalizedScopedBranch = normalizeBranchName(scopedBranch);

  return (
    normalizedRowBranch === normalizedScopedBranch ||
    normalizedScopedBranch.includes(normalizedRowBranch) ||
    normalizedRowBranch.includes(normalizedScopedBranch)
  );
};

const rowHasSavedMoney = (row, savedRows) =>
  Object.entries(savedRows).some(([key, value]) => {
    const [branch, month, year] = key.split("|");
    const matchesDonation =
      branch === row.branch && month === row.month && year === row.year;

    return (
      matchesDonation &&
      (Number(value?.realAmount) > 0 || Number(value?.dollarAmount) > 0)
    );
  });

const createMemberMonthlySampleRows = (scopedBranch, rows) => {
  if (!scopedBranch) return [];

  const existingMonths = new Set(
    rows
      .filter((row) => branchesMatch(row.branch, scopedBranch))
      .map((row) => row.month),
  );

  return memberSampleMonths
    .filter((month) => !existingMonths.has(month))
    .map((month, index) => ({
      id: `member-month-${index + 1}`,
      month,
      year: "២០២៦",
      branch: getBranchDisplayName(scopedBranch),
      monthlyRiel: `៛ ${(240000 + index * 20000).toLocaleString()}`,
      monthlyUsd: `$${20 + index * 5}`,
      total: `$${80 + index * 8}`,
    }));
};

export default function DonationTable({ showActions = true, scopedBranch = "" }) {
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
  const visibleHeaders = showActions ? headers : headers.slice(0, -1);
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [rows, setRows] = useState(donationRows);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDownloadAlert, setShowDownloadAlert] = useState(false);
  const [savedRows, setSavedRows] = useState({});

  const displayRows = useMemo(
    () => [...rows, ...createMemberMonthlySampleRows(scopedBranch, rows)],
    [rows, scopedBranch],
  );
  const years = useMemo(() => [...new Set(displayRows.map((row) => row.year))], [displayRows]);
  const months = useMemo(() => [...new Set(displayRows.map((row) => row.month))], [displayRows]);
  const branches = useMemo(() => [...new Set(rows.map((row) => row.branch))], [rows]);
  const handleDelete = (rowId) => {
    setRows((currentRows) => currentRows.filter((row) => row.id !== rowId));
  };
  const filteredRows = useMemo(
    () =>
      displayRows.filter((row) => {
        const matchesYear = selectedYear === "all" || row.year === selectedYear;
        const matchesMonth = selectedMonth === "all" || row.month === selectedMonth;
        const matchesBranch = scopedBranch
          ? branchesMatch(row.branch, scopedBranch)
          : selectedBranch === "all" || row.branch === selectedBranch;

        return matchesYear && matchesMonth && matchesBranch;
      }),
    [displayRows, selectedYear, selectedMonth, selectedBranch, scopedBranch],
  );
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage,
  );

  const updateFilter = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  useEffect(() => {
    const loadSavedRows = () => {
      const savedValue = window.localStorage.getItem(SAVED_DONATION_ROWS_KEY);

      if (!savedValue) {
        setSavedRows({});
        return;
      }

      try {
        setSavedRows(JSON.parse(savedValue));
      } catch {
        setSavedRows({});
      }
    };

    loadSavedRows();
    window.addEventListener("focus", loadSavedRows);
    window.addEventListener("pageshow", loadSavedRows);

    return () => {
      window.removeEventListener("focus", loadSavedRows);
      window.removeEventListener("pageshow", loadSavedRows);
    };
  }, []);

  useEffect(() => {
    if (!showDownloadAlert) return undefined;

    const timeoutId = window.setTimeout(() => {
      setShowDownloadAlert(false);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [showDownloadAlert]);

  return (
    <section className="rounded-md border border-border bg-white px-7 py-4 shadow-sm">
      {showDownloadAlert && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/25 pt-10">
          <AddAlert />
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
        showBranchFilter={showActions}
        showAddDonation={showActions}
      />

      <div className="mt-[17px] overflow-x-auto">
        <table className="w-full min-w-[840px] border-collapse border border-border">
          <thead>
            <tr className="h-12 border-b border-border bg-white text-center text-xs font-medium text-text-secondary">
              {visibleHeaders.map((header) => (
                <th key={header} className="px-4">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {pagedRows.map((row, index) => (
              <TableRow
                key={row.id}
                row={row}
                rowNumber={(safePage - 1) * rowsPerPage + index + 1}
                onDelete={handleDelete}
                hasMoney={rowHasSavedMoney(row, savedRows)}
                showActions={showActions}
              />
            ))}
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={visibleHeaders.length} className="px-4 py-8 text-center text-xs font-medium text-text-secondary">
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
      {showActions && (
        <div className="mt-10 flex justify-end">
          <SaveButton onClick={() => setShowDownloadAlert(true)} />
        </div>
      )}
    </section>

  );
}
