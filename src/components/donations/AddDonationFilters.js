import DonationFilterSelect from "./DonationFilterSelect";
import DonationSearchInput from "./DonationSearchInput";

export default function AddDonationFilters({
  departments,
  months,
  years,
  selectedDepartment,
  selectedMonth,
  selectedYear,
  searchQuery,
  onDepartmentChange,
  onMonthChange,
  onYearChange,
  onSearchChange,
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end gap-4">
      <DonationFilterSelect
        label="សាខា"
        value={selectedDepartment}
        onChange={onDepartmentChange}
        options={departments}
        allLabel="ជ្រើសរើសសាខា"
        className="w-[158px]"
        required
      />
      <DonationFilterSelect
        label="ខែ"
        value={selectedMonth}
        onChange={onMonthChange}
        options={months}
        allLabel="ខែទាំងអស់"
        className="w-[160px]"
        required
      />
      <DonationFilterSelect
        label="ឆ្នាំ"
        value={selectedYear}
        onChange={onYearChange}
        options={years}
        allLabel="ឆ្នាំទាំងអស់"
        className="w-[160px]"
        required
      />
      <DonationSearchInput value={searchQuery} onChange={onSearchChange} showLabel={false} />
    </div>
  );
}
