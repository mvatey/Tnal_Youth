"use client";

import DatePicker from "react-datepicker";
import { CalendarDays, Minus, Plus } from "lucide-react";

import "react-datepicker/dist/react-datepicker.css";

export default function DateInput({
  label,
  value,
  onChange,
  placeholder = "ថ្ងៃ/ខែ/ឆ្នាំ",
  variant = "default",
  min,
  max,
}) {
  const isStart = variant === "start";
  const isEnd = variant === "end";

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-text-secondary">
        {label}
      </label>

      <div className="relative">
        <DatePicker
          selected={value}
          onChange={onChange}
          minDate={min ? new Date(min) : undefined}
          maxDate={max ? new Date(max) : undefined}
          placeholderText={value ? "" : placeholder}
          dateFormat="dd/MM/yyyy"
          className="h-11 w-full rounded-lg border border-border bg-white px-4 pr-12 text-sm outline-none transition focus:border-secondary"
          wrapperClassName="w-full"
          popperClassName="small-calendar"
        />

        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary">
          <CalendarDays size={19} />

          {(isStart || isEnd) && (
            <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-secondary text-white ring-2 ring-white">
              {isStart ? <Plus size={10} strokeWidth={3} /> : <Minus size={10} strokeWidth={3} />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}