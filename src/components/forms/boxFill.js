"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import SelectArrow from "@/components/forms/SelectArrow.js";

export default function BoxFill({
  label,
  type = "text",
  placeholder = "",
  options = [],
  value,
  defaultValue = "",
  onChange,
  name,
  readOnly = false,
  disabled = false,
  leadingIcon,
}) {
  const [focused, setFocused] = useState(false);

  const isControlled = value !== undefined;

  const sharedValueProps = isControlled
    ? { value, onChange }
    : { defaultValue, onChange };

  const baseFieldClass = `
    h-11
    w-full
    rounded-lg
    border
    border-gray-200
    bg-white
    text-sm
    leading-6
    text-gray-600
    outline-none
    transition
    focus:border-primary
    disabled:cursor-not-allowed
    disabled:bg-gray-100
    disabled:opacity-60
  `;

  return (
    <div className="min-w-0">
      {label && (
        <label
          htmlFor={name}
          className="mb-2 block text-sm font-semibold leading-6 text-text-primary"
        >
          {label}
        </label>
      )}

      {type === "select" ? (
        <div className="relative">
          <select
            id={name}
            name={name}
            {...sharedValueProps}
            disabled={disabled}
            className={`
              ${baseFieldClass}
              appearance-none
              pl-4
              pr-10
            `}
          >
            {placeholder && (
              <option value="" disabled>
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

          <SelectArrow />
        </div>
      ) : type === "date" ? (
        <div className="relative">
          <input
            id={name}
            type="date"
            name={name}
            {...sharedValueProps}
            readOnly={readOnly}
            disabled={disabled}
            className={`
              ${baseFieldClass}
              px-4
              pr-10
            `}
          />

          <Calendar
            size={18}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      ) : (
        <div className="relative">
          {leadingIcon}

          <input
            id={name}
            type={type}
            name={name}
            {...sharedValueProps}
            readOnly={readOnly}
            disabled={disabled}
            placeholder={
              focused ? "" : placeholder
            }
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`
              ${baseFieldClass}
              py-2.5
              ${
                leadingIcon
                  ? "pl-11 pr-4"
                  : "px-4"
              }
            `}
          />
        </div>
      )}
    </div>
  );
}