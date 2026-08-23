"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import { CalendarDays, ChevronDown } from "lucide-react";

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
      <div className="relative w-full sm:w-[140px]">
        <DatePicker
          selected={value}
          onChange={(date) => onChange?.(date)}
          placeholderText={value ? "" : "ថ្ងៃ/ខែ/ឆ្នាំ"}
          dateFormat="dd/MM/yyyy"
          isClearable
          className="h-[34px] w-full rounded-lg border border-border bg-bg-page-white px-3 pr-14 text-[12px] text-text-primary outline-none"
          wrapperClassName="w-full"
          popperClassName="small-calendar"
        />

        <CalendarDays size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" />
      </div>
    );
  }

  // Picking just a start date and clicking away leaves endDate null,
  // which reads as an open-ended (one-sided) range -- so this same
  // control also covers what the single "date" type above is for.
  if (type === "daterange") {
    const [startDate, endDate] = value || [null, null];

    return (
      <div className="relative w-full sm:w-[190px]">
        <DatePicker
          selectsRange
          startDate={startDate}
          endDate={endDate}
          onChange={(dates) => onChange?.(dates)}
          placeholderText="ថ្ងៃ/ខែ/ឆ្នាំ"
          dateFormat="dd/MM/yyyy"
          isClearable
          className="h-[34px] w-full rounded-lg border border-border bg-bg-page-white px-3 pr-14 text-[12px] text-text-primary outline-none"
          wrapperClassName="w-full"
          popperClassName="small-calendar"
        />

        <CalendarDays size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" />
      </div>
    );
  }


  return (
    <div className="relative w-full sm:w-auto">

      <select value={value} onChange={(e) => onChange?.(e.target.value)} className="h-[34px] w-full min-w-0 appearance-none rounded-lg border border-border bg-bg-page-white px-3 pr-9 text-[12px] font-medium text-text-primary outline-none sm:min-w-[130px]">

        <option value="all">
          {placeholder}
        </option>


        {options.map((item)=>(
          <option 
            key={item}
            value={item}
          >
            {item}
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



export default function FilterBar({ filters = [], className = "" }) {
  return (
    <div className={`grid w-full grid-cols-1 items-center gap-3 sm:flex sm:flex-wrap ${className}`}>
      {filters.map(({ key, ...filter }) => (
        <FilterInput
          key={key}
          {...filter}
        />
      ))}
    </div>
  );
}
