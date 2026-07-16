"use client";

import { useEffect, useMemo, useState } from "react";
import AddAlert from "../../forms/addalert";
import SaveButton from "../../forms/save";
import Pagination from "../../navigation/Pagination";
import DonationFilterSelect from "./DonationFilterSelect";
import MonthlyDonationMemberRow from "./MonthlyDonationMemberRow";
import { addDonationRows } from "@/data/donationData";

const SAVED_DONATION_ROWS_KEY = "tnal-youth:saved-donation-rows";

const DEFAULT_AMOUNTS = [
  "$200",
  "$150",
  "$70",
  "$80",
  "$45",
  "$40",
  "$100",
  "$150",
  "$180",
  "$25",
  "$60",
  "$70",
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
      amount: savedAmount || DEFAULT_AMOUNTS[index % DEFAULT_AMOUNTS.length],
      paymentMethod: savedRow.paymentMethod || row.paymentMethod || "Cash",
    };
  });

export default function DonationTable() {
  const rowsPerPage = 12;
  const headers = [
    "ល.រ",
    "សមាជិក",
    "ភេទ",
    "តួនាទី",
    "ឆ្នាំ",
    "ចំនួនទឹកប្រាក់(ដុល្លា)",
    "វិធីសាស្ត្រទូទាត់",
    "សកម្មភាព",
  ];
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDownloadAlert, setShowDownloadAlert] = useState(false);
  const [savedRows, setSavedRows] = useState({});

  const rows = useMemo(() => buildDisplayRows(savedRows), [savedRows]);
  const branches = useMemo(() => [...new Set(rows.map((row) => row.branch))], [rows]);
  const months = useMemo(() => [...new Set(rows.map((row) => row.month))], [rows]);
  const years = useMemo(() => [...new Set(rows.map((row) => row.year))], [rows]);
  const paymentMethods = useMemo(
    () => [...new Set(rows.map((row) => row.paymentMethod))],
    [rows],
  );

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const matchesBranch = selectedBranch === "all" || row.branch === selectedBranch;
        const matchesMonth = selectedMonth === "all" || row.month === selectedMonth;
        const matchesYear = selectedYear === "all" || row.year === selectedYear;
        const matchesPaymentMethod =
          selectedPaymentMethod === "all" || row.paymentMethod === selectedPaymentMethod;

        return matchesBranch && matchesMonth && matchesYear && matchesPaymentMethod;
      }),
    [rows, selectedBranch, selectedMonth, selectedYear, selectedPaymentMethod],
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
    <section className="min-h-[605px] rounded-md border border-border bg-white px-7 py-4 shadow-sm">
      {showDownloadAlert && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/25 pt-10">
          <AddAlert />
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-base font-semibold text-secondary">វិភាគទានប្រចាំខែ</h3>

        <div className="flex flex-wrap items-center justify-end gap-4">
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
          <DonationFilterSelect
            label="វិធីបង់ប្រាក់"
            value={selectedPaymentMethod}
            onChange={updateFilter(setSelectedPaymentMethod)}
            options={paymentMethods}
            allLabel="វិធីបង់ប្រាក់ទាំងអស់"
            className="w-[178px]"
            showLabel={false}
          />
        </div>
      </div>

      <div className="mt-[17px] overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse">
          <thead>
            <tr className="h-11 border-b border-border bg-white text-center text-[12px] font-semibold text-text-secondary">
              {headers.map((header) => (
                <th key={header} className="px-3">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {pagedRows.map((row, index) => (
              <MonthlyDonationMemberRow
                key={row.id}
                row={row}
                rowNumber={(safePage - 1) * rowsPerPage + index + 1}
              />
            ))}
            {filteredRows.length === 0 && (
              <tr>
                <td
                  colSpan={headers.length}
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
