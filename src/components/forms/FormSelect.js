"use client";

import { ChevronDown } from "lucide-react";

export default function FormSelect({ label, value, onChange, options = [], placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-text-secondary">{label}</span>
      <span className="relative block">
        <select value={value} onChange={(e) => onChange?.(e.target.value)} className="h-11 w-full appearance-none rounded-lg border border-border bg-white px-4 pr-10 text-sm outline-none focus:border-secondary">
          <option value="" disabled hidden>{placeholder}</option>
          {options.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary" />
      </span>
    </label>
  );
}
