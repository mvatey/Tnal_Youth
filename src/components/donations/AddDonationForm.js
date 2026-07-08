"use client";

import { useMemo, useState } from "react";
import { addDonationRows } from "@/data/donationData";
import AddDonationFilters from "./AddDonationFilters";
import Table from "../tables/table";

export default function AddDonationForm() {
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const branchSelected = selectedDepartment !== "all";

  const departments = useMemo(
    () => [...new Set(addDonationRows.map((row) => row.department))],
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
    const completed = rows.filter((row) => Number(row.newAmount) > 0);
    setSavedMessage(
      completed.length > 0
        ? `បានរក្សាទុកវិភាគទាន ${completed.length} នាក់`
        : "សូមបញ្ចូលចំនួនទឹកប្រាក់យ៉ាងហោចណាស់ម្នាក់",
    );
  };

  return (
    <section className="min-h-[545px] rounded-md border border-border bg-[#fbfbfd] p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-base font-semibold text-secondary">កត់ត្រាវិភាគទានប្រចាំខែ</h1>
        {savedMessage && (
          <p className="text-sm font-medium text-success" role="status">
            {savedMessage}
          </p>
        )}
      </div>

      <AddDonationFilters
        departments={departments}
        months={months}
        years={years}
        selectedDepartment={selectedDepartment}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        searchQuery={searchQuery}
        onDepartmentChange={setSelectedDepartment}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        onSearchChange={setSearchQuery}
      />

      {branchSelected && (
        <Table
          members={members}
          selectedBranch={selectedDepartment}
          searchQuery={searchQuery}
          onSave={handleSave}
        />
      )}
    </section>
  );
}
