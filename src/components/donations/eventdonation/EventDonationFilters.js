"use client";

import { CalendarDays, PlusCircle, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import DonationFilterSelect from "../monthlydonation/DonationFilterSelect";
import { useLanguage } from "@/context/LanguageContext";

function EventDateInput({ label, value, onChange, min }) {
  const openDatePicker = (event) => {
    event.currentTarget.showPicker?.();
  };

  return (
    <label className="group relative block h-[34px] w-full cursor-pointer sm:w-[192px] sm:shrink-0">
      <input
        type="date"
        value={value}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        onClick={openDatePicker}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        aria-label={label}
      />
      <span className="flex h-full w-full items-center justify-between rounded-lg border border-border bg-bg-page-white px-3 text-[16px] font-Semibold leading-none text-text-secondary shadow-sm transition-all duration-200 group-hover:border-secondary group-hover:bg-secondary-light/40 group-hover:shadow-md group-focus-within:border-secondary group-focus-within:ring-2 group-focus-within:ring-secondary/20">
        <span className="truncate">{value || label}</span>
        <CalendarDays
          size={16}
          strokeWidth={2.2}
          className="transition-colors duration-200 group-hover:text-secondary group-focus-within:text-secondary"
        />
      </span>
    </label>
  );
}

export default function EventDonationFilters({
  searchQuery,
  onSearchChange,
  selectedBranch,
  onBranchChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  branches = [],
  // When true, locks the branch dropdown to its current single value (no
  // "all" option, not editable) — see EventDonationPanel.
  branchScoped = false,
}) {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="flex w-full flex-col items-stretch justify-end gap-2 pb-1 sm:flex-row sm:flex-nowrap sm:items-center sm:overflow-x-auto">
      <label className="block h-[34px] w-full sm:w-[260px] sm:shrink-0">
        <span className="flex h-full items-center rounded-lg border border-border bg-bg-page-white px-3 shadow-sm">
          <input
            className="w-full flex-1 bg-transparent pr-2 text-[12px] font-medium text-text-secondary outline-none placeholder:text-text-secondary focus:placeholder-transparent"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("donationPage.searchActivityPlaceholder")}
          />
          <Search size={16} className="text-text-secondary" />
        </span>
      </label>

      <DonationFilterSelect
        label={t("donationPage.branch")}
        value={selectedBranch}
        onChange={onBranchChange}
        options={branches}
        allLabel={t("donationPage.selectBranch")}
        showLabel={false}
        disabled={branchScoped}
        includeAllOption={!branchScoped}
      />

      <EventDateInput
        label={t("donationPage.startDate")}
        value={startDate}
        onChange={onStartDateChange}
      />
      <EventDateInput
        label={t("donationPage.endDate")}
        value={endDate}
        min={startDate}
        onChange={onEndDateChange}
      />
    </div>
  );
}
