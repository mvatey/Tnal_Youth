import DonationFilterSelect from "./DonationFilterSelect";
import DonationSearchInput from "../../forms/searchBar";
import { useLanguage } from "@/context/LanguageContext";

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
  const { t } = useLanguage();

  return (
    <div className="mb-6 flex flex-wrap items-end gap-4">
      <DonationFilterSelect
        label={t("donationPage.branch")}
        value={selectedBranch}
        onChange={onBranchChange}
        options={branches}
        allLabel={t("donationPage.selectBranch")}
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
        label={t("donationPage.year")}
        value={selectedYear}
        onChange={onYearChange}
        options={years}
        allLabel={t("donationPage.selectYear")}
        className="w-[160px]"
        required
      />
      <DonationFilterSelect
        label={t("donationPage.month")}
        value={selectedMonth}
        onChange={onMonthChange}
        options={months}
        allLabel={
          !selectedYear || selectedYear === "all"
            ? t("donationPage.selectYearFirst")
            : months.length === 0
              ? t("donationPage.noAvailableMonth")
              : t("donationPage.selectMonth")
        }
        className="w-[160px]"
        required
        disabled={!selectedYear || selectedYear === "all"}
      />
      <DonationSearchInput value={searchQuery} onChange={onSearchChange} showLabel={false} />
    </div>
  );
}
