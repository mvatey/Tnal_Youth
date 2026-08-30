"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import { km, enUS } from "date-fns/locale";
import { CalendarDays, ChevronDown } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

import "react-datepicker/dist/react-datepicker.css";


function FilterInput({
  value,
  onChange,
  options = [],
  placeholder = "ជ្រើសរើស",
  type = "select",
  width,
}) {
  const { locale } = useLanguage();
  const datePickerLocale = locale === "en" ? enUS : km;

  if (type === "date") {
    return (
      <div className={`date-filter-input relative w-full ${width || "sm:w-[190px]"}`}>
        <DatePicker
          selected={value}
          onChange={(date) => onChange?.(date)}
          placeholderText={value ? "" : placeholder}
          dateFormat="dd/MM/yyyy"
          locale={datePickerLocale}
          onChangeRaw={(event) => event.preventDefault()}
          isClearable
          className="h-[34px] w-full cursor-pointer rounded-lg border border-border bg-bg-page-white px-3 pr-16 text-[12px] text-text-primary caret-transparent outline-none"
          wrapperClassName="w-full"
          popperClassName="small-calendar"
          popperPlacement="bottom-start"
          popperProps={{ strategy: "fixed" }}
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
      <div className={`date-filter-input relative w-full ${width || "sm:w-[240px]"}`}>
        <DatePicker
          selectsRange
          startDate={startDate}
          endDate={endDate}
          onChange={(dates) => onChange?.(dates)}
          placeholderText={placeholder}
          dateFormat="dd/MM/yyyy"
          locale={datePickerLocale}
          onChangeRaw={(event) => event.preventDefault()}
          isClearable
          className="h-[34px] w-full cursor-pointer rounded-lg border border-border bg-bg-page-white px-3 pr-16 text-[12px] text-text-primary caret-transparent outline-none"
          wrapperClassName="w-full"
          popperClassName="small-calendar"
          popperPlacement="bottom-start"
          popperProps={{ strategy: "fixed" }}
        />

        <CalendarDays size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" />
      </div>
    );
  }


  return (
    <div className="relative w-full sm:w-auto">

      <select value={value} onChange={(e) => onChange?.(e.target.value)} className={`h-[34px] w-full min-w-0 appearance-none rounded-lg border border-border bg-bg-page-white px-3 pr-9 text-[12px] font-medium text-text-primary outline-none sm:w-auto ${width || "sm:min-w-[130px]"}`}>

        <option value="all" hidden={value !== "all"}>
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
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {filters.map(({ key, ...filter }) => (
        <FilterInput
          key={key}
          {...filter}
        />
      ))}
    </div>
  );
}
