import AddDonationLink from "@/components/donations/AddDonationLink";
import DonationFilterSelect from "@/components/donations/monthlydonation/DonationFilterSelect";

export default function DonationFilterBar({
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
      <h3 className="text-base font-semibold text-secondary">
        វិភាគទានប្រចាំខែ
      </h3>
      <div className="grid grid-cols-1 gap-3">
        <DonationFilterSelect
          label="សាខា"
          value={selectedBranch}
          onChange={onBranchChange}
          options={branches}
          allLabel="សាខាទាំងអស់"
          className="w-full"
          showLabel={false}
        />
        <DonationFilterSelect
          label="ខែ"
          value={selectedMonth}
          onChange={onMonthChange}
          options={months}
          allLabel="ខែទាំងអស់"
          className="w-full"
          showLabel={false}
        />
        <DonationFilterSelect
          label="ឆ្នាំ"
          value={selectedYear}
          onChange={onYearChange}
          options={years}
          allLabel="ឆ្នាំទាំងអស់"
          className="w-full"
          showLabel={false}
        />
        <div>
          <AddDonationLink />
        </div>
      </div>
    </div>
  );
}
