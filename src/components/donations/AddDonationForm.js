"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { addDonationRows } from "@/data/donationData";
import AddDonationFilters from "./AddDonationFilters";
import Table from "../tables/table";
import SaveAlert from "../forms/savealert";

const SAVED_DONATION_ROWS_KEY = "tnal-youth:saved-donation-rows";

const getSavedRowKey = (row) =>
  [row.branch, row.month, row.year, row.id].join("|");

export default function AddDonationForm() {
  const searchParams = useSearchParams();
  const initialBranch = searchParams.get("branch") || "all";
  const initialMonth = searchParams.get("month") || "all";
  const initialYear = searchParams.get("year") || "all";
  const [selectedBranch, setSelectedBranch] = useState(initialBranch);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [showSaveAlert, setShowSaveAlert] = useState(false);
  const [savedRows, setSavedRows] = useState({});
  const branchSelected = selectedBranch !== "all";

  const branches = useMemo(
    () => [...new Set(addDonationRows.map((row) => row.branch))],
    [],
  );
  const months = useMemo(
    () => [...new Set(addDonationRows.map((row) => row.month))],
    [],
  );
  const years = useMemo(
    () => [...new Set(addDonationRows.map((row) => row.year))],
    [],
  );
  const members = useMemo(
    () =>
      addDonationRows
        .filter(
          (row) =>
            (selectedMonth === "all" || row.month === selectedMonth) &&
            (selectedYear === "all" || row.year === selectedYear),
        )
        .map((row) => ({
          ...row,
          ...savedRows[getSavedRowKey(row)],
        })),
    [savedRows, selectedMonth, selectedYear],
  );

  useEffect(() => {
    const savedValue = window.localStorage.getItem(SAVED_DONATION_ROWS_KEY);

    if (!savedValue) return;

    try {
      setSavedRows(JSON.parse(savedValue));
    } catch {
      setSavedRows({});
    }
  }, []);

  useEffect(() => {
    setSelectedBranch(initialBranch);
    setSelectedMonth(initialMonth);
    setSelectedYear(initialYear);
  }, [initialBranch, initialMonth, initialYear]);

  useEffect(() => {
    if (!showSaveAlert) return undefined;

    const timeoutId = window.setTimeout(() => {
      setShowSaveAlert(false);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [showSaveAlert]);

  const handleSave = (rows) => {
    const completed = rows.filter(
      (row) => Number(row.realAmount) > 0 || Number(row.dollarAmount) > 0,
    );

    setSavedRows((currentRows) => {
      const nextRows = { ...currentRows };

      rows.forEach((row) => {
        nextRows[getSavedRowKey(row)] = {
          realAmount: row.realAmount ?? "",
          dollarAmount: row.dollarAmount ?? "",
          paymentMethod: row.paymentMethod || "Cash",
        };
      });

      window.localStorage.setItem(
        SAVED_DONATION_ROWS_KEY,
        JSON.stringify(nextRows),
      );

      return nextRows;
    });

    setSavedMessage(
      completed.length > 0
        ? `បានរក្សាទុកវិភាគទាន ${completed.length} នាក់`
        : "សូមបញ្ចូលចំនួនទឹកប្រាក់យ៉ាងហោចណាស់ម្នាក់",
    );
    setShowSaveAlert(true);
  };

  const handleReceiptSave = () => {
    setSavedMessage("បានរក្សាទុកវិក្ក័យបត្រដោយជោគជ័យ");
    setShowSaveAlert(true);
  };

  return (
    <>
      {showSaveAlert && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/25 pt-10">
          <SaveAlert />
        </div>
      )}

      <section className="min-h-[545px] rounded-md border border-border bg-[#fbfbfd] p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-base font-semibold text-secondary">ការកត់ត្រាវិភាគទានប្រចាំខែ</h1>
          {savedMessage && (
            <p className="text-sm font-medium text-success" role="status">
              {savedMessage}
            </p>
          )}
        </div>

        <AddDonationFilters
          branches={branches}
          months={months}
          years={years}
          selectedBranch={selectedBranch}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          searchQuery={searchQuery}
          onBranchChange={setSelectedBranch}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
          onSearchChange={setSearchQuery}
        />

        {branchSelected && (
          <Table
            members={members}
            selectedBranch={selectedBranch}
            searchQuery={searchQuery}
            onSave={handleSave}
            onReceiptSave={handleReceiptSave}
          />
        )}
      </section>
    </>
  );
}
