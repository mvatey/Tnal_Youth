"use client";

import { Calendar } from "lucide-react";

export default function FormDate({
  label,
  name,
  value,
  onChange,
  required = false,
}) {
  return (
    <div>
      {label && (
        <label className="mb-2 block text-sm font-semibold text-text-primary">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type="date"
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="h-11 w-full rounded-lg border border-gray-200 px-4 pr-10 text-sm text-gray-600 outline-none focus:border-primary"
        />

        <Calendar
          size={18}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>
    </div>
  );
}