"use client";

import { ChevronDown } from "lucide-react";

function normalizeOption(option, index) {
  if (
    typeof option === "object" &&
    option !== null
  ) {
    const value =
      option.value ??
      option.id ??
      option.code ??
      "";

    const label =
      option.label ??
      option.nameKm ??
      option.name_km ??
      option.name ??
      option.nameEn ??
      option.name_en ??
      String(value);

    return {
      value: String(value),
      label: String(label),
      disabled: Boolean(option.disabled),
      key:
        option.key ??
        option.id ??
        option.code ??
        `${String(value)}-${index}`,
    };
  }

  return {
    value: String(option ?? ""),
    label: String(option ?? ""),
    disabled: false,
    key: `${String(option)}-${index}`,
  };
}

export default function FormSelect({
  label,
  name,
  value = "",
  onChange,
  options = [],
  placeholder = "ជ្រើសរើស",
  disabled = false,
  required = false,
  loading = false,
  error = "",
  className = "",
  selectClassName = "",
  emptyLabel = "មិនមានទិន្នន័យ",
  ...selectProps
}) {
  const normalizedOptions = Array.isArray(options)
    ? options.map(normalizeOption)
    : [];

  const hasEmptyOption =
    normalizedOptions.some(
      (option) => option.value === "",
    );

  const isDisabled = disabled || loading;

  return (
    <div className={`min-w-0 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="mb-2 block text-sm font-semibold text-text-primary"
        >
          {label}

          {required && (
            <span className="ml-1 text-error">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        <select
          id={name}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          disabled={isDisabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error && name
              ? `${name}-error`
              : undefined
          }
          {...selectProps}
          className={`
            h-10
            w-full
            appearance-none
            rounded-lg
            border
            bg-white
            pl-3
            pr-11
            text-sm
            outline-none
            transition
            ${
              error
                ? "border-error focus:border-error"
                : "border-gray-200 focus:border-primary"
            }
            disabled:cursor-not-allowed
            disabled:bg-gray-50
            disabled:opacity-60
            ${selectClassName}
          `}
        >
          {placeholder && !hasEmptyOption && (
            <option value="">
              {loading
                ? "កំពុងទាញយក..."
                : placeholder}
            </option>
          )}

          {!loading &&
            normalizedOptions.length === 0 &&
            !placeholder && (
              <option value="" disabled>
                {emptyLabel}
              </option>
            )}

          {!loading &&
            normalizedOptions.map((option) => (
              <option
                key={`${name || "select"}-${option.key}`}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
        </select>

        <ChevronDown
          size={16}
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            right-4
            top-1/2
            -translate-y-1/2
            text-text-secondary
          "
        />
      </div>

      {error && (
        <p
          id={
            name
              ? `${name}-error`
              : undefined
          }
          className="mt-1.5 text-xs text-error"
        >
          {error}
        </p>
      )}
    </div>
  );
}