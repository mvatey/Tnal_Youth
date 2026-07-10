"use client";

import { useEffect, useMemo, useState } from "react";
import FilterBar from "../../forms/FilterBar";
import AddAlert from "../../forms/addalert";
import SaveAlert from "../../forms/savealert";
import SaveButton from "../../forms/save";
import Pagination from "../../navigation/Pagination";
import TableRow from "./TableRow";
import { donationRows } from "@/data/donationData";

const SAVED_DONATION_ROWS_KEY = "tnal-youth:saved-donation-rows";
const DONATION_SAVE_ALERT_KEY = "tnal-youth:donation-save-alert";

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

export default function DonationTable() {
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
  const [rows, setRows] = useState(donationRows);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDownloadAlert, setShowDownloadAlert] = useState(false);
  const [showSaveAlert, setShowSaveAlert] = useState(false);
  const [savedRows, setSavedRows] = useState({});

  const years = useMemo(() => [...new Set(rows.map((row) => row.year))], [rows]);
  const months = useMemo(() => [...new Set(rows.map((row) => row.month))], [rows]);
  const branches = useMemo(() => [...new Set(rows.map((row) => row.branch))], [rows]);
  const handleDelete = (rowId) => {
    setRows((currentRows) => currentRows.filter((row) => row.id !== rowId));
  };
  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const matchesYear = selectedYear === "all" || row.year === selectedYear;
        const matchesMonth = selectedMonth === "all" || row.month === selectedMonth;
        const matchesBranch = selectedBranch === "all" || row.branch === selectedBranch;

        return matchesYear && matchesMonth && matchesBranch;
      }),
    [rows, selectedYear, selectedMonth, selectedBranch],
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
      const shouldShowSaveAlert = window.localStorage.getItem(
        DONATION_SAVE_ALERT_KEY,
      );
      const savedValue = window.localStorage.getItem(SAVED_DONATION_ROWS_KEY);

      if (shouldShowSaveAlert === "true") {
        window.localStorage.removeItem(DONATION_SAVE_ALERT_KEY);
        setShowSaveAlert(true);
      }

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
    if (!showDownloadAlert && !showSaveAlert) return undefined;

    const timeoutId = window.setTimeout(() => {
      setShowDownloadAlert(false);
      setShowSaveAlert(false);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [showDownloadAlert, showSaveAlert]);

  return (
    <section className="rounded-md border border-border bg-white px-7 py-4 shadow-sm">
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
      />

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[840px] border-collapse border border-border">
          <thead>
            <tr className="h-12 border-b border-border bg-white text-center text-xs font-medium text-text-secondary">
              {headers.map((header) => (
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
        <SaveButton onClick={() => setShowDownloadAlert(true)} />
      </div>
    </section>

  );
}
