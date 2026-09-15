import AddDonationLink from "../donations/AddDonationLink";
import DonationFilterSelect from "../donations/monthlydonation/DonationFilterSelect";
import { useLanguage } from "@/context/LanguageContext";

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
  branchScoped = false,
  // A member only ever has one branch, so the branch filter is a pointless
  // control on their own "my donations" view — hidden outright there
  // instead of shown locked/disabled like the branchScoped staff case.
  showBranch = true,
}) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-secondary">{t("donationPage.monthlyDonation")}</h3>

      <div
        className={`grid grid-cols-1 gap-3 sm:grid-cols-2 lg:items-center lg:justify-end ${
          showBranch ? "lg:grid-cols-[repeat(3,158px)_auto]" : "lg:grid-cols-[repeat(2,158px)_auto]"
        }`}
      >
        {showBranch && (
          <DonationFilterSelect
            label={t("memberPage.branch")}
            value={selectedBranch}
            onChange={onBranchChange}
            options={branches}
            allLabel={t("branchPage.allBranches")}
            showLabel={false}
            disabled={branchScoped}
            includeAllOption={!branchScoped}
          />
        )}
        <DonationFilterSelect
          label={t("donationPage.month")}
          value={selectedMonth}
          onChange={onMonthChange}
          options={months}
          allLabel={t("donationPage.allMonths")}
          showLabel={false}
        />
        <DonationFilterSelect
          label={t("donationPage.year")}
          value={selectedYear}
          onChange={onYearChange}
          options={years}
          allLabel={t("donationPage.allYears")}
          showLabel={false}
        />
        <AddDonationLink />
      </div>
    </div>
  );
}
