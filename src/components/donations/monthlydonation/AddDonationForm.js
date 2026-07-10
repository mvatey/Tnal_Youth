"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { addDonationRows } from "@/data/donationData";
import AddDonationFilters from "./AddDonationFilters";
import Table from "../../tables/table";
import SaveAlert from "../../forms/savealert";

const SAVED_DONATION_ROWS_KEY = "tnal-youth:saved-donation-rows";

const getSavedRowKey = (row) =>
  [row.branch, row.month, row.year, row.id].join("|");

export default function AddDonationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const initialFilters = useMemo(() => {
    const params = new URLSearchParams(queryString);

    return {
      branch: params.get("branch") || "all",
      month: params.get("month") || "all",
      year: params.get("year") || "all",
    };
  }, [queryString]);
  const [selectedBranch, setSelectedBranch] = useState(initialFilters.branch);
  const [selectedMonth, setSelectedMonth] = useState(initialFilters.month);
  const [selectedYear, setSelectedYear] = useState(initialFilters.year);
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
    setSelectedBranch((currentBranch) =>
      currentBranch === initialFilters.branch
        ? currentBranch
        : initialFilters.branch,
    );
    setSelectedMonth((currentMonth) =>
      currentMonth === initialFilters.month ? currentMonth : initialFilters.month,
    );
    setSelectedYear((currentYear) =>
      currentYear === initialFilters.year ? currentYear : initialFilters.year,
    );
  }, [initialFilters]);

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
    const nextRows = { ...savedRows };

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
    setSavedRows(nextRows);

    setSavedMessage(
      completed.length > 0
        ? `បានរក្សាទុកវិភាគទាន ${completed.length} នាក់`
        : "សូមបញ្ចូលចំនួនទឹកប្រាក់យ៉ាងហោចណាស់ម្នាក់",
    );
    router.push("/donation");
  };

  const handleReset = (rows) => {
    setSavedRows((currentRows) => {
      const nextRows = { ...currentRows };

      rows.forEach((row) => {
        nextRows[getSavedRowKey(row)] = {
          realAmount: "0",
          dollarAmount: "0",
          paymentMethod: row.paymentMethod || "Cash",
        };
      });

      window.localStorage.setItem(
        SAVED_DONATION_ROWS_KEY,
        JSON.stringify(nextRows),
      );

      return nextRows;
    });
  };

  const handleReceiptSave = () => {
    setSavedMessage("បានរក្សាទុកវិក្ក័យបត្រដោយជោគជ័យ");
    setShowSaveAlert(true);
  };

  const handleCancel = () => {
    router.push("/donation");
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
            onReset={handleReset}
            onCancel={handleCancel}
            onSave={handleSave}
            onReceiptSave={handleReceiptSave}
          />
        )}
      </section>
    </>
  );
}
