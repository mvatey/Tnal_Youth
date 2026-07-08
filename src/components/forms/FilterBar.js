import AddDonationLink from "../donations/AddDonationLink";
import DonationFilterSelect from "../donations/DonationFilterSelect";

export default function FilterBar({
  years = [],
  months = [],
  departments = [],
  selectedYear,
  selectedMonth,
  selectedDepartment,
  onYearChange,
  onMonthChange,
  onDepartmentChange,
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-secondary">វិភាគទានប្រចាំខែ</h3>

      <div className="flex flex-wrap items-center justify-end gap-5">
        <DonationFilterSelect
          label="សាខា"
          value={selectedDepartment}
          onChange={onDepartmentChange}
          options={departments}
          allLabel="ជ្រើសរើសសាខា"
          showLabel={false}
        />
        <DonationFilterSelect
          label="ខែ"
          value={selectedMonth}
          onChange={onMonthChange}
          options={months}
          allLabel="ខែទាំងអស់"
          showLabel={false}
        />
        <DonationFilterSelect
          label="ឆ្នាំ"
          value={selectedYear}
          onChange={onYearChange}
          options={years}
          allLabel="ឆ្នាំទាំងអស់"
          showLabel={false}
        />
        <AddDonationLink />
      </div>
    </div>
  );
}
