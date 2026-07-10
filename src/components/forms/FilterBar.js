import AddDonationLink from "../donations/AddDonationLink";
import DonationFilterSelect from "../donations/monthlydonation/DonationFilterSelect";

export default function FilterBar({
  years = [],
  months = [],
  branches = [],
  selectedYear,
  selectedMonth,
  selectedBranch,
  onYearChange,
  onMonthChange,
  onBranchChange,
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-secondary">វិភាគទានប្រចាំខែ</h3>

      <div className="flex flex-wrap items-center justify-end gap-[5px]">
        <DonationFilterSelect
          label="សាខា"
          value={selectedBranch}
          onChange={onBranchChange}
          options={branches}
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
