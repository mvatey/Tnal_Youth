"use client";

import { ChevronDown } from "lucide-react";
import sponsorOptions from "@/data/donation/sponsorOptions.json";

const { sponsorTypes } = sponsorOptions;

export default function SponsorTypeSelect({
  value = "",
  onChange,
  options = sponsorTypes,
  placeholder = "ជ្រើសរើសប្រភេទអ្នកឧបត្ថម្ភ",
  className = "w-[430px]",
  size = "large",
}) {
  const isCompact = size === "compact";

  return (
    <label
      className={`relative block shrink-0 ${isCompact ? "h-[34px]" : "h-[92px]"} ${className}`}
    >
      <select
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className={`h-full w-full appearance-none bg-white text-text-secondary shadow-sm outline-none transition hover:border-secondary focus:border-secondary ${
          isCompact
            ? "rounded-lg border border-border px-3 pr-8 text-[12px] font-medium"
            : "rounded-[24px] border-2 border-[#E3E5EA] px-8 pr-14 text-[28px] font-semibold"
        }`}
        aria-label={placeholder}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={isCompact ? 16 : 30}
        strokeWidth={isCompact ? 2.4 : 3}
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-black ${
          isCompact ? "right-3" : "right-7"
        }`}
      />
    </label>
  );
}
