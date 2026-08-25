import AddDonationLink from "@/components/donations/AddDonationLink";
import DonationFilterSelect from "@/components/donations/monthlydonation/DonationFilterSelect";
import { useLanguage } from "@/context/LanguageContext";

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
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-secondary">
        {t("donationPage.monthlyDonationTitle")}
      </h3>
      <div className="grid grid-cols-1 gap-3">
        <DonationFilterSelect
          label={t("donationPage.branch")}
          value={selectedBranch}
          onChange={onBranchChange}
          options={branches}
          allLabel={t("donationPage.allBranches")}
          className="w-full"
          showLabel={false}
        />
        <DonationFilterSelect
          label={t("donationPage.month")}
          value={selectedMonth}
          onChange={onMonthChange}
          options={months}
          allLabel={t("donationPage.allMonths")}
          className="w-full"
          showLabel={false}
        />
        <DonationFilterSelect
          label={t("donationPage.year")}
          value={selectedYear}
          onChange={onYearChange}
          options={years}
          allLabel={t("donationPage.allYears")}
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
