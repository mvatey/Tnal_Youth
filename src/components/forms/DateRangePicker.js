"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

import calendarData from "@/data/calendar.json";

const KHMER_MONTHS = Object.keys(calendarData.months);
const KHMER_WEEKDAYS = ["អា", "ច", "អ", "ព", "ព្រ", "សុ", "ស"];

function parseIsoDate(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(isoValue) {
  const date = parseIsoDate(isoValue);

  if (!date) {
    return "";
  }

  return `${date.getDate()} ${KHMER_MONTHS[date.getMonth()]}, ${date.getFullYear()}`;
}

function buildMonthGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);

    return date;
  });
}

/*
 * A range-selecting equivalent of FormDate: pick a start day, then an end
 * day, and both are handed back as { from, to } ISO strings. Picking just
 * one day and clicking away leaves `to` equal to `from` -- a single-day
 * selection -- so this can also stand in wherever only one date is needed.
 */
export default function DateRangePicker({
  name,
  value,
  onChange,
  placeholder = "ថ្ងៃ/ខែ/ឆ្នាំ",
  disabled = false,
}) {
  const from = value?.from || "";
  const to = value?.to || "";

  const [open, setOpen] = useState(false);
  const [pendingFrom, setPendingFrom] = useState(from);
  const [viewDate, setViewDate] = useState(() => parseIsoDate(from) || new Date());

  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleOutsideClick(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const monthGrid = useMemo(
    () => buildMonthGrid(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate],
  );

  const displayText =
    from && to
      ? from === to
        ? formatDisplayDate(from)
        : `${formatDisplayDate(from)} - ${formatDisplayDate(to)}`
      : from
        ? formatDisplayDate(from)
        : "";

  function openPicker() {
    if (disabled) {
      return;
    }

    setPendingFrom(from);
    setViewDate(parseIsoDate(from) || new Date());
    setOpen(true);
  }

  function goToMonth(offset) {
    setViewDate((previous) => new Date(previous.getFullYear(), previous.getMonth() + offset, 1));
  }

  function handleDayClick(date) {
    const iso = toIsoDate(date);

    // No range started yet, or a full range was already picked -- either
    // way this click starts fresh, matching how most range pickers behave.
    if (!pendingFrom || (from && to)) {
      setPendingFrom(iso);
      onChange?.({ from: iso, to: "" });
      return;
    }

    // Second click completes the range -- reordered if picked backwards.
    const rangeFrom = iso < pendingFrom ? iso : pendingFrom;
    const rangeTo = iso < pendingFrom ? pendingFrom : iso;

    setPendingFrom(rangeFrom);
    onChange?.({ from: rangeFrom, to: rangeTo });
    setOpen(false);
  }

  function handleClear(event) {
    event.stopPropagation();
    setPendingFrom("");
    onChange?.({ from: "", to: "" });
  }

  const activeFrom = from || pendingFrom;
  const activeTo = to;

  return (
    <div ref={containerRef} className="relative min-w-0">
      <div
        className={`
          relative flex h-[34px] w-full min-w-0 items-center gap-2 rounded-lg
          border border-border bg-bg-page-white px-3 text-sm text-text-secondary
          outline-none transition focus:border-primary
          ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-primary"}
        `}
        onClick={openPicker}
      >
        <Calendar size={16} className="shrink-0 text-text-secondary" />

        <span className={`truncate ${displayText ? "text-text-primary" : "text-text-mute"}`}>
          {displayText || placeholder}
        </span>

        {displayText && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="សម្អាតកាលបរិច្ឆេទ"
            className="ml-auto shrink-0 text-text-mute transition hover:text-text-primary"
          >
            ×
          </button>
        )}
      </div>

      {open && (
        <div
          className="
            absolute left-0 top-[calc(100%+6px)] z-30 w-[280px] rounded-xl
            border border-border bg-bg-page-white p-3 shadow-lg
          "
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => goToMonth(-1)}
              aria-label="ខែមុន"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-text-secondary transition hover:bg-bg-page-gray"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-sm font-semibold text-text-primary">
              {KHMER_MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>

            <button
              type="button"
              onClick={() => goToMonth(1)}
              aria-label="ខែក្រោយ"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-text-secondary transition hover:bg-bg-page-gray"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-y-1 text-center text-xs text-text-mute">
            {KHMER_WEEKDAYS.map((weekday) => (
              <div key={weekday} className="py-1 font-medium">
                {weekday}
              </div>
            ))}

            {monthGrid.map((date) => {
              const iso = toIsoDate(date);
              const inCurrentMonth = date.getMonth() === viewDate.getMonth();

              const isRangeStart = iso === activeFrom;
              const isRangeEnd = iso === activeTo;
              const isInRange =
                activeFrom &&
                activeTo &&
                iso > activeFrom &&
                iso < activeTo;

              const isEndpoint = isRangeStart || isRangeEnd;

              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => handleDayClick(date)}
                  className={`
                    flex h-8 w-8 items-center justify-center rounded-full text-xs transition
                    ${!inCurrentMonth ? "text-text-mute" : "text-text-primary"}
                    ${isInRange ? "rounded-none bg-primary-light" : ""}
                    ${isEndpoint ? "bg-primary font-semibold text-white hover:bg-primary" : "hover:bg-bg-page-gray"}
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Hidden field so this control participates in a <form> like any
          other named input, even though selection happens via the popover
          above rather than typing. */}
      <input type="hidden" name={name} value={from && to ? `${from}_${to}` : ""} readOnly />
    </div>
  );
}
