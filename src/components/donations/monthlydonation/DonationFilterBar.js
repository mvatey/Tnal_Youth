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
      <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:justify-end lg:gap-5 [&>*]:w-full lg:[&>*]:w-auto">
        <DonationFilterSelect
          label="សាខា"
          value={selectedBranch}
          onChange={onBranchChange}
          options={branches}
          allLabel="សាខាទាំងអស់"
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
