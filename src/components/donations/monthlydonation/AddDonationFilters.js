import DonationFilterSelect from "./DonationFilterSelect";
import DonationSearchInput from "../../forms/searchBar";

export default function AddDonationFilters({
  branches,
  months,
  years,
  selectedBranch,
  selectedMonth,
  selectedYear,
  searchQuery,
  onBranchChange,
  onMonthChange,
  onYearChange,
  onSearchChange,
  branchScoped = false,
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end gap-4">
      <DonationFilterSelect
        label="សាខា"
        value={selectedBranch}
        onChange={onBranchChange}
        options={branches}
        allLabel="ជ្រើសរើសសាខា"
        className="w-[158px]"
        required
        disabled={branchScoped}
        includeAllOption={!branchScoped}
      />
      {/*
        Year before month — the month list depends on which year is
        selected (capped at the current month for the current year, and
        with already-recorded months excluded), so picking a year first
        makes that dependency visible instead of showing all 12 months
        up front and then narrowing them after the fact.
      */}
      <DonationFilterSelect
        label="ឆ្នាំ"
        value={selectedYear}
        onChange={onYearChange}
        options={years}
        allLabel="ជ្រើសរើសឆ្នាំ"
        className="w-[160px]"
        required
      />
      <DonationFilterSelect
        label="ខែ"
        value={selectedMonth}
        onChange={onMonthChange}
        options={months}
        allLabel={
          !selectedYear || selectedYear === "all"
            ? "ជ្រើសរើសឆ្នាំសិន"
            : months.length === 0
              ? "គ្មានខែទំនេរ"
              : "ជ្រើសរើសខែ"
        }
        className="w-[160px]"
        required
        disabled={!selectedYear || selectedYear === "all"}
      />
      <DonationSearchInput value={searchQuery} onChange={onSearchChange} showLabel={false} />
    </div>
  );
}
