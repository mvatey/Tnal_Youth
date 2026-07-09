"use client";

import { useMemo, useState } from "react";
import { addDonationRows } from "@/data/donationData";
import AddDonationFilters from "./AddDonationFilters";
import Table from "../tables/table";

export default function AddDonationForm() {
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
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
      addDonationRows.filter(
        (row) =>
          (selectedMonth === "all" || row.month === selectedMonth) &&
          (selectedYear === "all" || row.year === selectedYear),
      ),
    [selectedMonth, selectedYear],
  );

  const handleSave = (rows) => {
    const completed = rows.filter(
      (row) => Number(row.realAmount) > 0 || Number(row.dollarAmount) > 0,
    );
    setSavedMessage(
      completed.length > 0
        ? `បានរក្សាទុកវិភាគទាន ${completed.length} នាក់`
        : "សូមបញ្ចូលចំនួនទឹកប្រាក់យ៉ាងហោចណាស់ម្នាក់",
    );
  };

  return (
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
        />
      )}
    </section>
  );
}
