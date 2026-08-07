"use client";

import { Link2 } from "lucide-react";

export default function FormField({ label, type = "text", value, onChange, placeholder, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-text-secondary">{label}</span>
      {children ? children : <input type={type} value={value} onChange={(e) => onChange?.(e.target.value)} placeholder={value ? "" : placeholder} className="h-11 w-full rounded-lg border border-border bg-white px-4 text-sm outline-none focus:border-secondary" />}
    </label>
  );
}
