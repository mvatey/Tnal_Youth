"use client";

import { Search } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  placeholder = "ស្វែងរក...",
  showLabel = false,
  label = "ស្វែងរក",
  width = "w-[260px]",
}) {
  return (
    <label className={`block ${width}`}>
      {showLabel && (
        <span className="mb-1 block text-[12px] font-medium text-text-secondary">
          {label}
        </span>
      )}

      <span className="flex h-[34px] items-center rounded-lg border border-border bg-white px-3">
        <input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={value ? "" : placeholder}
          className="w-full flex-1 bg-transparent pr-2 text-[12px] font-medium outline-none"
        />

        <Search size={16} className="text-text-secondary" />
      </span>
    </label>
  );
}
