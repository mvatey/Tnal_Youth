"use client";

import donationOptions from "@/data/donation/donationOptions.json";

const { monthlyDonationViews } = donationOptions;

export default function MonthlyDonationViewSwitch({ value, onChange }) {
  return (
    <select
      className="h-[34px] w-[158px] rounded-lg border border-border bg-white px-3 text-[12px] font-medium text-text-secondary shadow-sm outline-none transition hover:border-secondary focus:border-secondary"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label="បង្ហាញវិភាគទានតាម"
    >
      {monthlyDonationViews.map((view) => (
        <option key={view.id} value={view.id}>
          {view.label}
        </option>
      ))}
    </select>
  );
}
