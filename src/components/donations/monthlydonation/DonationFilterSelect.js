export default function DonationFilterSelect({
  label,
  value,
  onChange,
  options = [],
  allLabel,
  className = "w-[158px]",
  showLabel = true,
  required = false,
  disabled = false,
}) {
  const select = (
    <select
      className={`h-[34px] ${className} rounded-lg border border-border bg-white px-3 text-[12px] font-medium text-text-secondary shadow-sm outline-none transition focus:border-secondary disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-text-secondary`}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      aria-label={!showLabel ? label : undefined}
    >
      <option value="all">{allLabel}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  if (!showLabel) return select;

  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-text-secondary">
        {label}
        {required && <span className="ml-1 text-error">*</span>}
      </span>
      {select}
    </label>
  );
}
