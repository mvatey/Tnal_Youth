"use client";

import { CalendarDays, PlusCircle, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import DonationFilterSelect from "../monthlydonation/DonationFilterSelect";

function EventDateInput({ label, value, onChange, min }) {
  return (
    <label className="relative block h-[34px] w-[192px] shrink-0 cursor-pointer">
      <input
        type="date"
        value={value}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        aria-label={label}
      />
      <span className="flex h-full w-full items-center justify-between rounded-lg border border-border bg-white px-3 text-[16px] font-Semibold leading-none text-text-secondary shadow-sm transition hover:border-secondary">
        <span className="truncate">{value || label}</span>
        <CalendarDays size={16} strokeWidth={2.2} />
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
}) {
  const router = useRouter();

  return (
    <div className="flex w-full flex-nowrap items-center justify-end gap-[5px] overflow-x-auto pb-1">
      <label className="block h-[34px] w-[202px] shrink-0">
        <span className="flex h-full items-center rounded-lg border border-border bg-white px-3 shadow-sm">
          <input
            className="w-full flex-1 bg-transparent pr-2 text-[12px] font-medium text-text-secondary outline-none placeholder:text-text-secondary"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="ស្វែងរកតាមឈ្មោះកម្មវិធី ..."
          />
          <Search size={16} className="text-text-secondary" />
        </span>
      </label>

      <DonationFilterSelect
        label="សាខា"
        value={selectedBranch}
        onChange={onBranchChange}
        options={branches}
        allLabel="ជ្រើសរើសសាខា"
        showLabel={false}
      />

      <EventDateInput
        label="កាលបរិច្ឆេទចាប់ផ្តើម"
        value={startDate}
        onChange={onStartDateChange}
      />
      <EventDateInput
        label="កាលបរិច្ឆេទបញ្ចប់"
        value={endDate}
        min={startDate}
        onChange={onEndDateChange}
      />
    </div>
  );
}
