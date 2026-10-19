"use client";

/*
 * A single labelled checkbox laid out like the other form fields (label
 * above-left style spacing), for yes/no facts such as "registered voter".
 * onChange receives the new boolean directly, not an event.
 */
export default function CheckboxField({
  label,
  name,
  checked = false,
  onChange,
  disabled = false,
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className={`flex items-center gap-3 text-sm font-semibold text-text-primary ${
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        }`}
      >
        <input
          id={name}
          name={name}
          type="checkbox"
          checked={Boolean(checked)}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.checked)}
          className="h-5 w-5 accent-primary"
        />

        <span>
          {label}
          {required && <span className="ml-1 text-error">*</span>}
        </span>
      </label>
    </div>
  );
}
