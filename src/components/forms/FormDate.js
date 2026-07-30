"use client";

import { useRef } from "react";
import { Calendar } from "lucide-react";

import calendarData from "@/data/calendar.json";

function getTodayLocalDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function convertKhmerDateToInputDate(date) {
  if (!date) {
    return "";
  }

  // Already formatted as yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  const parts = date.trim().split(/\s+/);

  if (parts.length < 3) {
    return "";
  }

  const day = parts[0];
  const monthKh = parts[1].replace(",", "");
  const year = parts[2];

  const month = calendarData.months[monthKh];

  if (!month) {
    return "";
  }

  return `${year}-${month}-${String(day).padStart(2, "0")}`;
}

function formatKhmerDisplayDate(date) {
  if (!date) {
    return "";
  }

  const [year, month, day] = date.split("-");

  if (!year || !month || !day) {
    return "";
  }

  const monthName =
    Object.keys(calendarData.months).find(
      (key) => calendarData.months[key] === month,
    ) || "";

  return `${Number(day)} ${monthName}, ${year}`;
}

export default function FormDate({
  label,
  name,
  value,
  onChange,
  required = false,
  maxDate = getTodayLocalDate(),
  minDate,
  disabled = false,
}) {
  const inputRef = useRef(null);

  const formattedValue =
    convertKhmerDateToInputDate(value);

  const openPicker = () => {
    if (disabled) {
      return;
    }

    if (inputRef.current?.showPicker) {
      inputRef.current.showPicker();
      return;
    }

    inputRef.current?.click();
  };

  const handleDateChange = (event) => {
    const selectedDate = event.target.value;

    if (
      maxDate &&
      selectedDate &&
      selectedDate > maxDate
    ) {
      return;
    }

    onChange?.(event);
  };

  return (
    <div>
      {label && (
        <label
          htmlFor={`${name}-display`}
          className="mb-2 block text-sm font-semibold text-text-primary"
        >
          {label}

          {required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </label>
      )}

      <div
        className={`
          relative
          ${disabled
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer"}
        `}
        onClick={openPicker}
      >
        {/* Visible display input */}

        <input
          id={`${name}-display`}
          type="text"
          readOnly
          disabled={disabled}
          value={formatKhmerDisplayDate(
            formattedValue,
          )}
          placeholder="ថ្ងៃ/ខែ/ឆ្នាំ"
          className="
            h-11
            w-full
            cursor-pointer
            rounded-lg
            border
            border-gray-200
            bg-white
            px-3
            pr-10
            text-sm
            text-gray-600
            outline-none
            transition
            placeholder:text-gray-400
            focus:border-primary
            disabled:cursor-not-allowed
          "
        />

        {/* Hidden native date picker */}

        <input
          ref={inputRef}
          type="date"
          name={name}
          value={formattedValue}
          onChange={handleDateChange}
          required={required}
          max={maxDate}
          min={minDate}
          disabled={disabled}
          tabIndex={-1}
          className="
            pointer-events-none
            absolute
            inset-0
            h-full
            w-full
            opacity-0
          "
          aria-hidden="true"
        />

        <Calendar
          size={18}
          className="
            pointer-events-none
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            text-gray-400
          "
        />
      </div>
    </div>
  );
}