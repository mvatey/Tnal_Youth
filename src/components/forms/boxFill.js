"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";

import SelectArrow from "@/components/forms/SelectArrow";

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
  list,
  suggestions = [],
  className = "",
}) {
  const [focused, setFocused] = useState(false);

  const isControlled = value !== undefined;

  const sharedValueProps = isControlled
    ? {
        value,
        onChange,
      }
    : {
        defaultValue,
        onChange,
      };

  /*
   * `disabled:` Tailwind variants only fire off the real HTML `disabled`
   * attribute — a `readOnly` <input> never matches `:disabled`, so it kept
   * showing the ordinary text I-beam cursor even though it can't be typed
   * into. Compute the "locked" look in JS so readOnly fields get the same
   * not-allowed cursor/greyed-out treatment as disabled ones.
   */
  const isLocked = disabled || readOnly;

  const baseFieldClass = `
    box-border
    h-[34px]
    w-full
    rounded-lg
    border
    border-border
    bg-bg-page-white
    text-sm
    leading-none
    text-text-secondary
    outline-none
    transition
    focus:border-primary
    ${
      isLocked
        ? "cursor-not-allowed bg-bg-page-gray opacity-60"
        : ""
    }
  `;

  return (
    <div className={`min-w-0 ${isLocked ? "[&_label]:text-text-mute" : ""} ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="
            mb-2
            block
            text-sm
            font-semibold
            text-text-primary
          "
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
            /* <select> has no native readOnly — a "read-only" dropdown
             * has to be locked via disabled so it's both non-interactive
             * and gets the not-allowed cursor. */
            disabled={isLocked}
            className={`
              ${baseFieldClass}
              appearance-none
              pl-3
              pr-9
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
              pl-3
              pr-9
            `}
          />

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
      ) : (
        <div className="relative">
          {leadingIcon && (
            <div
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-text-secondary
              "
            >
              {leadingIcon}
            </div>
          )}

          <input
            id={name}
            type={type}
            name={name}
            list={list}
            {...sharedValueProps}
            readOnly={readOnly}
            disabled={disabled}
            placeholder={focused ? "" : placeholder}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`
              ${baseFieldClass}
              ${
                leadingIcon
                  ? "pl-10 pr-3"
                  : "px-3"
              }
            `}
          />

          {list && suggestions.length > 0 && (
            <datalist id={list}>
              {suggestions.map((suggestion, index) => (
                <option
                  key={`${list}-${suggestion.value ?? suggestion.label ?? index}`}
                  value={suggestion.label ?? suggestion.value ?? suggestion}
                />
              ))}
            </datalist>
          )}
        </div>
      )}
    </div>
  );
}
