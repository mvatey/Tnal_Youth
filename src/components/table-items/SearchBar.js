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

      <span className="flex h-[34px] items-center gap-2 rounded-lg border border-border bg-bg-page-white px-3">
        <Search size={16} className="shrink-0 text-text-secondary" />

        <input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={value ? "" : placeholder}
          className="w-full min-w-0 flex-1 bg-transparent text-[12px] font-medium outline-none"
        />
      </span>
    </label>
  );
}
