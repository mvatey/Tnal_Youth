"use client";

import DatePicker from "react-datepicker";
import { CalendarDays } from "lucide-react";

import "react-datepicker/dist/react-datepicker.css";

export default function DateInput({
  label,
  value,
  onChange,
  placeholder = "ថ្ងៃ/ខែ/ឆ្នាំ",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-text-secondary">
        {label}
      </label>

      <div className="relative">
        <DatePicker
          selected={value}
          onChange={onChange}
          placeholderText={value ? "" : placeholder}
          dateFormat="dd/MM/yyyy"
          className="
            h-11 w-full rounded-lg border border-border
            bg-white px-4 pr-11 text-sm
            outline-none transition
            focus:border-secondary
          "
          wrapperClassName="w-full"
          popperClassName="small-calendar"
        />

        <CalendarDays
          size={18}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary"
        />
      </div>
    </div>
  );
}
