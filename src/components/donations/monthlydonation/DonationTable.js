"use client";

import { useEffect, useMemo, useState } from "react";
import AddAlert from "../../forms/addalert";
import SaveButton from "../../forms/save";
import Pagination from "../../navigation/Pagination";
import DonationFilterSelect from "./DonationFilterSelect";
import MonthlyDonationMemberRow from "./MonthlyDonationMemberRow";
import MonthlyDonationViewSwitch from "./MonthlyDonationViewSwitch";
import TableRow from "./TableRow";
import donationData from "@/data/donation/donationData.json";
import donationOptions from "@/data/donation/donationOptions.json";

const SAVED_DONATION_ROWS_KEY = "tnal-youth:saved-donation-rows";
const { addDonationRows, donationRows } = donationData;
const { monthlyDonationDefaultAmounts } = donationOptions;

const memberHeaders = [
  "ល.រ",
  "សមាជិក",
  "សាខា",
  "ខែ",
  "ឆ្នាំ",
  "ចំនួនទឹកប្រាក់(ដុល្លារ)",
  "វិធីសាស្ត្រទូទាត់",
  "សកម្មភាព",
];

const branchHeaders = [
  "ល.រ",
  "សាខា",
  "ខែ",
  "ឆ្នាំ",
  "ចំនួនទឹកប្រាក់(ដុល្លារ)",
  "សកម្មភាព",
];

const getSavedRowKey = (row) => [row.branch, row.month, row.year, row.id].join("|");

const formatDollarAmount = (value) => {
  const amount = Number(value);

  if (!amount) return null;

  return `$${amount.toLocaleString("en-US")}`;
};

const buildDisplayRows = (savedRows) =>
  addDonationRows.map((row, index) => {
    const savedRow = savedRows[getSavedRowKey(row)] || {};
    const savedAmount = formatDollarAmount(savedRow.dollarAmount);

    return {
      ...row,
      role: "យុវជន",
      amount:
        savedAmount ||
        monthlyDonationDefaultAmounts[index % monthlyDonationDefaultAmounts.length],
      paymentMethod: savedRow.paymentMethod || row.paymentMethod || "Cash",
    };
  });

export default function DonationTable() {
  const rowsPerPage = 12;
  const [viewMode, setViewMode] = useState("member");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDownloadAlert, setShowDownloadAlert] = useState(false);
  const [savedRows, setSavedRows] = useState({});
  const branchRows = donationRows;

  const memberRows = useMemo(() => buildDisplayRows(savedRows), [savedRows]);
  const activeRows = viewMode === "member" ? memberRows : branchRows;
  const branches = useMemo(
    () => [...new Set(activeRows.map((row) => row.branch))],
    [activeRows],
  );
  const months = useMemo(() => [...new Set(activeRows.map((row) => row.month))], [activeRows]);
  const years = useMemo(() => [...new Set(activeRows.map((row) => row.year))], [activeRows]);

  const filteredRows = useMemo(
    () =>
      activeRows.filter((row) => {
        const matchesBranch = selectedBranch === "all" || row.branch === selectedBranch;
        const matchesMonth = selectedMonth === "all" || row.month === selectedMonth;
        const matchesYear = selectedYear === "all" || row.year === selectedYear;

        return matchesBranch && matchesMonth && matchesYear;
      }),
    [activeRows, selectedBranch, selectedMonth, selectedYear],
  );

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage,
  );
  const activeHeaders = viewMode === "member" ? memberHeaders : branchHeaders;

  const updateFilter = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  const updateViewMode = (nextViewMode) => {
    setViewMode(nextViewMode);
    setCurrentPage(1);
    setSelectedBranch("all");
    setSelectedMonth("all");
    setSelectedYear("all");
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
    <section className="min-h-[605px] rounded-md border border-border bg-[#fbfcfe] px-7 py-4 shadow-sm">
      {showDownloadAlert && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/25 pt-10">
          <AddAlert />
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-secondary">វិភាគទានប្រចាំខែ</h3>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-4">
            <MonthlyDonationViewSwitch value={viewMode} onChange={updateViewMode} />
            <DonationFilterSelect
              label="សាខា"
              value={selectedBranch}
              onChange={updateFilter(setSelectedBranch)}
              options={branches}
              allLabel="សាខាទាំងអស់"
              showLabel={false}
            />
            <DonationFilterSelect
              label="ខែ"
              value={selectedMonth}
              onChange={updateFilter(setSelectedMonth)}
              options={months}
              allLabel="ខែទាំងអស់"
              showLabel={false}
            />
            <DonationFilterSelect
              label="ឆ្នាំ"
              value={selectedYear}
              onChange={updateFilter(setSelectedYear)}
              options={years}
              allLabel="ឆ្នាំទាំងអស់"
              showLabel={false}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse border border-border">
          <thead>
            <tr className="h-12 border-b border-border bg-white text-center text-xs font-medium text-text-secondary">
              {activeHeaders.map((header) => (
                <th key={header} className="px-4">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {pagedRows.map((row, index) =>
              viewMode === "member" ? (
                <MonthlyDonationMemberRow
                  key={row.id}
                  row={row}
                  rowNumber={(safePage - 1) * rowsPerPage + index + 1}
                />
              ) : (
                <TableRow
                  key={row.id}
                  row={row}
                  rowNumber={(safePage - 1) * rowsPerPage + index + 1}
                />
              ),
            )}
            {filteredRows.length === 0 && (
              <tr>
                <td
                  colSpan={activeHeaders.length}
                  className="px-4 py-8 text-center text-xs font-medium text-text-secondary"
                >
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
        className="mt-3"
      />

      <div className="mt-10 flex justify-end">
        <SaveButton onClick={() => setShowDownloadAlert(true)} />
      </div>
    </section>
  );
}
