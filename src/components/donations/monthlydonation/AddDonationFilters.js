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
      />
      <DonationFilterSelect
        label="ខែ"
        value={selectedMonth}
        onChange={onMonthChange}
        options={months}
        allLabel="ជ្រើសរើសខែ"
        className="w-[160px]"
        required
      />
      <DonationFilterSelect
        label="ឆ្នាំ"
        value={selectedYear}
        onChange={onYearChange}
        options={years}
        allLabel="ជ្រើសរើសឆ្នាំ"
        className="w-[160px]"
        required
      />
      <DonationSearchInput value={searchQuery} onChange={onSearchChange} showLabel={false} />
    </div>
  );
}
