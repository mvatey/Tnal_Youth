"use client";

export default function FormSelect({
  label,
  value,
  onChange,
  placeholder = "ជ្រើសរើស",
  options = [],
  required = false,
  disabled = false,
  className = "",
}) {
  const handleChange = (event) => {
    onChange?.(event.target.value);
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-text-secondary">
          {label}
          {required && <span className="ml-1 text-error">*</span>}
        </label>
      )}

      <select
        value={value ?? ""}
        onChange={handleChange}
        disabled={disabled}
        className="h-11 w-full rounded-lg border border-border bg-white px-4 text-sm text-text-primary outline-none transition focus:border-secondary disabled:cursor-not-allowed disabled:bg-gray-100"
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {options.map((option) => {
          const optionIsObject =
            typeof option === "object" &&
            option !== null;

          const optionLabel = optionIsObject
            ? option.label
            : option;

          const optionValue = optionIsObject
            ? option.value
            : option;

          return (
            <option
              key={String(optionValue)}
              value={optionValue}
            >
              {optionLabel}
            </option>
          );
        })}
      </select>
    </div>
  );
}