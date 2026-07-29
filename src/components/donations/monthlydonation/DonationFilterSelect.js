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
  const normalizedOptions = options.map((option) => {
    if (
      option !== null &&
      typeof option === "object"
    ) {
      return {
        label: option.label ?? option.value,
        value: option.value ?? option.label,
      };
    }

    return {
      label: option,
      value: option,
    };
  });

  const select = (
    <select
      className={`h-[34px] ${className} rounded-lg border border-border bg-white px-3 text-[12px] font-medium text-text-secondary shadow-sm outline-none transition focus:border-secondary disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-text-secondary`}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      aria-label={!showLabel ? label : undefined}
    >
      <option value="all">{allLabel}</option>
      {normalizedOptions.map((option) => (
        <option
          key={String(option.value)}
          value={option.value}
        >
          {option.label}
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
