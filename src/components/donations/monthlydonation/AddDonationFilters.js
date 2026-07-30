import DonationFilterSelect from "./DonationFilterSelect";
import DonationSearchInput from "@/components/donations/DonationSearchInput";

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
    <div className="mb-6 grid grid-cols-1 items-end gap-4 sm:grid-cols-2 xl:flex xl:flex-wrap [&>*]:w-full xl:[&>*]:w-auto">
      <DonationFilterSelect
        label="សាខា"
        value={selectedBranch}
        onChange={onBranchChange}
        options={branches}
        allLabel="ជ្រើសរើសសាខា"
        className="w-full xl:w-[158px]"
        required
      />
      <DonationFilterSelect
        label="ខែ"
        value={selectedMonth}
        onChange={onMonthChange}
        options={months}
        allLabel="ជ្រើសរើសខែ"
        className="w-full xl:w-[160px]"
        required
      />
      <DonationFilterSelect
        label="ឆ្នាំ"
        value={selectedYear}
        onChange={onYearChange}
        options={years}
        allLabel="ជ្រើសរើសឆ្នាំ"
        className="w-full xl:w-[160px]"
        required
      />
      <DonationSearchInput value={searchQuery} onChange={onSearchChange} showLabel={false} />
    </div>
  );
}
