"use client";

import DatePicker from "react-datepicker";
import {
  CalendarDays,
  ChevronDown,
} from "lucide-react";

import "react-datepicker/dist/react-datepicker.css";

function FilterInput({
  value,
  onChange,
  options = [],
  placeholder = "ជ្រើសរើស",
  type = "select",
}) {
  if (type === "date") {
    return (
      <div className="relative w-[150px]">
        <DatePicker
          selected={value || null}
          onChange={(date) => onChange?.(date)}
          placeholderText="ថ្ងៃ/ខែ/ឆ្នាំ"
          dateFormat="dd/MM/yyyy"
          isClearable
          className="h-[34px] w-full rounded-lg border border-border bg-white px-3 pr-10 text-[12px] text-text-primary outline-none"
          wrapperClassName="w-full"
          popperClassName="small-calendar"
        />

        <CalendarDays
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        value={value ?? "all"}
        onChange={(event) =>
          onChange?.(event.target.value)
        }
        className="h-[34px] min-w-[150px] appearance-none rounded-lg border border-border bg-white px-3 pr-9 text-[12px] font-medium text-text-primary outline-none"
      >
        <option value="all">{placeholder}</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
      />
    </div>
  );
}

export default function FilterBar({ filters = [] }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {filters.map((filter, index) => {
        const {
          key,
          ...filterProps
        } = filter;

        return (
          <FilterInput
            key={key || index}
            {...filterProps}
          />
        );
      })}
    </div>
  );
}