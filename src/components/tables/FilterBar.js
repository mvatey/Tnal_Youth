"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import { km, enUS } from "date-fns/locale";
import { CalendarDays } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import SearchableSelect from "@/components/forms/SearchableSelect.js";
import FormSelect from "@/components/forms/FormSelect.js";

import "react-datepicker/dist/react-datepicker.css";


function FilterInput({
  filterKey,
  value,
  onChange,
  options = [],
  placeholder = "ជ្រើសរើស",
  type = "select",
}) {
  const { locale } = useLanguage();
  const datePickerLocale = locale === "en" ? enUS : km;

  if (type === "date") {
    return (
      <div className="date-filter-input relative w-full sm:w-[190px]">
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
      <div className="date-filter-input relative w-full sm:w-[240px]">
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


  const mergedOptions = [
    { value: "all", label: placeholder },
    ...options.map((item) => ({ value: item, label: item })),
  ];

  // Only the branch select realistically grows long enough (many branches)
  // to need a search box -- other filters (type, status, ...) are short,
  // fixed lists where a search box is just an extra click for no benefit.
  if (filterKey === "branch") {
    return (
      <div className="relative w-full sm:w-auto sm:min-w-[150px]">
        <SearchableSelect
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          options={mergedOptions}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full sm:w-auto sm:min-w-[150px]">
      <FormSelect
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        options={mergedOptions}
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
          filterKey={key}
          {...filter}
        />
      ))}
    </div>
  );
}
