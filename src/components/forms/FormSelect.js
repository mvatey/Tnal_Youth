"use client";

import { ChevronDown } from "lucide-react";

export default function FormSelect({
  name,
  value,
  onChange,
  options = [],
  placeholder,
  disabled = false,
}) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
    >
      {placeholder && !options.some((option) => {
        const optionValue =
          typeof option === "object" && option !== null
            ? option.value
            : option;

        return optionValue === "";
      }) && (
        <option value="">
          {placeholder}
        </option>
      )}

      {options.map((option, index) => {
        const isObject =
          typeof option === "object" &&
          option !== null;

        const optionValue = isObject
          ? option.value
          : option;

        const optionLabel = isObject
          ? option.label
          : option;

        return (
          <option
            key={`${name}-${String(optionValue)}-${index}`}
            value={optionValue}
          >
            {optionLabel}
          </option>
        );
      })}
    </select>
  );
}