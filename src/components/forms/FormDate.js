"use client";

import { useRef } from "react";
import { Calendar, X } from "lucide-react";

import calendarData from "@/data/calendar.json";
import { useLanguage } from "@/context/LanguageContext";

const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getTodayLocalDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(
    now.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(
    now.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function convertKhmerDateToInputDate(
  date,
) {
  if (!date) {
    return "";
  }

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      date,
    )
  ) {
    return date;
  }

  const parts = date
    .trim()
    .split(/\s+/);

  if (parts.length < 3) {
    return "";
  }

  const day = parts[0];

  const monthKh =
    parts[1].replace(",", "");

  const year = parts[2];

  const month =
    calendarData.months[
      monthKh
    ];

  if (!month) {
    return "";
  }

  return `${year}-${month}-${String(
    day,
  ).padStart(2, "0")}`;
}

function formatDisplayDate(
  date,
  locale = "km",
) {
  if (!date) {
    return "";
  }

  const [year, month, day] =
    date.split("-");

  if (
    !year ||
    !month ||
    !day
  ) {
    return "";
  }

  const monthName =
    locale === "en"
      ? EN_MONTHS[Number(month) - 1]
      :
    Object.keys(
      calendarData.months,
    ).find(
      (key) =>
        calendarData.months[
          key
        ] === month,
    ) || "";

  return `${Number(
    day,
  )} ${monthName}, ${year}`;
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
  const { locale, t } = useLanguage();
  const inputRef = useRef(null);

  const formattedValue =
    convertKhmerDateToInputDate(
      value,
    );

  const openPicker = () => {
    if (disabled) {
      return;
    }

    if (
      inputRef.current?.showPicker
    ) {
      inputRef.current.showPicker();
      return;
    }

    inputRef.current?.click();
  };

  const handleDateChange = (
    event,
  ) => {
    const selectedDate =
      event.target.value;

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
    <div className={`min-w-0 ${disabled ? "[&_label]:text-text-mute" : ""}`}>
      {label && (
        <label
          htmlFor={`${name}-display`}
          className="
            mb-2
            block
            text-sm
            font-semibold
            text-text-primary
          "
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
          ${
            disabled
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer"
          }
        `}
        onClick={openPicker}
      >
        {/* Visible display input */}

        <input
          id={`${name}-display`}
          type="text"
          readOnly
          disabled={disabled}
          value={formatDisplayDate(
            formattedValue,
            locale,
          )}
          placeholder={t("common.datePlaceholder", "ថ្ងៃ/ខែ/ឆ្នាំ")}
          className="
            box-border
            h-[34px]
            w-full
            cursor-pointer
            rounded-lg
            border
            border-border
            bg-bg-page-white
            px-3
            pr-14
            text-sm
            leading-none
            text-text-secondary
            outline-none
            transition
            placeholder:text-text-mute
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
          onChange={
            handleDateChange
          }
          required={required}
          max={maxDate}
          min={minDate}
          disabled={disabled}
          tabIndex={-1}
          className="
            pointer-events-none
            absolute
            inset-0
            h-[34px]
            w-full
            opacity-0
          "
          aria-hidden="true"
        />

        {!disabled && formattedValue && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleDateChange({ target: { value: "" } });
            }}
            className="
              absolute
              right-8
              top-1/2
              -translate-y-1/2
              rounded-full
              p-0.5
              text-text-secondary
              transition
              hover:text-text-primary
            "
            aria-label={locale === "en" ? "Clear date" : "សម្អាតកាលបរិច្ឆេទ"}
          >
            <X size={14} />
          </button>
        )}

        <Calendar
          size={16}
          className="
            pointer-events-none
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            text-text-secondary
          "
        />
      </div>
    </div>
  );
}
