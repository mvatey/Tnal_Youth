"use client";

import DatePicker from "react-datepicker";
import { CalendarDays, Minus, Plus } from "lucide-react";

import "react-datepicker/dist/react-datepicker.css";

// `new Date("YYYY-MM-DD")` is parsed as UTC. In Cambodia it becomes 7:00 AM,
// so a same-day end date at 00:00 is incorrectly considered earlier than the
// minimum and react-datepicker moves it to the following day. Parse plain
// calendar dates locally so opening Edit never changes an untouched date.
function parseLocalCalendarDate(value) {
  if (!value) return undefined;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }

  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, year, month, day] = match;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export default function DatePickerField({
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
      <label className="mb-2 block text-sm font-semibold text-text-primary">
        {label}
      </label>

      <div className="relative">
        <DatePicker
          selected={value}
          onChange={onChange}
          minDate={parseLocalCalendarDate(min)}
          maxDate={parseLocalCalendarDate(max)}
          placeholderText={value ? "" : placeholder}
          dateFormat="dd/MM/yyyy"
          className="h-[34px] w-full rounded-lg border border-border bg-bg-page-white px-4 pr-12 text-sm text-text-primary outline-none transition placeholder:text-text-mute focus:border-secondary"
          wrapperClassName="w-full"
          popperClassName="small-calendar"
        />

        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary">
          <CalendarDays size={19} />

          {(isStart || isEnd) && (
            <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-secondary text-white ring-2 ring-bg-page-white">
              {isStart ? <Plus size={10} strokeWidth={3} /> : <Minus size={10} strokeWidth={3} />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
