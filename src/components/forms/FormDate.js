"use client";

import { Calendar } from "lucide-react";
import { useRef } from "react";
import calendarData from "@/data/calendar.json";


function convertKhmerDateToInputDate(date) {
  if (!date) return "";


  // already yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }


  const parts = date.split(" ");


  if (parts.length < 3) return "";


  const day = parts[0];

  const monthKh = parts[1].replace(",", "");

  const year = parts[2];


  const month = calendarData.months[monthKh];


  if (!month) return "";


  return `${year}-${month}-${day.padStart(2, "0")}`;
}




function formatKhmerDisplayDate(date) {
  if (!date) return "";


  const [year, month, day] = date.split("-");


  if (!year || !month || !day) return "";


  const monthName =
    Object.keys(calendarData.months).find(
      (key) => calendarData.months[key] === month
    ) || "";


  return `${Number(day)} ${monthName}, ${year}`;
}




export default function FormDate({
  label,
  name,
  value,
  onChange,
  required = false,
}) {

  const inputRef = useRef(null);


  const formattedValue = convertKhmerDateToInputDate(value);



  const openPicker = () => {

    if (inputRef.current?.showPicker) {
      inputRef.current.showPicker();
    }

  };



  return (
    <div>

      {label && (
        <label className="mb-2 block text-sm font-semibold text-text-primary">
          {label}
        </label>
      )}



      <div
        className="relative cursor-pointer"
        onClick={openPicker}
      >


        {/* Display */}
        <input
          type="text"
          readOnly
          value={formatKhmerDisplayDate(formattedValue)}
          placeholder="ថ្ងៃ/ខែ/ឆ្នាំ"
          className="
            h-11
            w-full
            cursor-pointer
            rounded-lg
            border
            border-gray-200
            px-4
            pr-10
            text-sm
            text-gray-600
            outline-none
            focus:border-primary
          "
        />



        {/* Real picker */}
        <input
          ref={inputRef}
          type="date"
          name={name}
          value={formattedValue}
          onChange={onChange}
          required={required}
          className="
            absolute
            opacity-0
            pointer-events-none
          "
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