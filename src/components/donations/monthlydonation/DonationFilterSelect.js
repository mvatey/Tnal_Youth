import SearchableSelect from "@/components/forms/SearchableSelect";

export default function DonationFilterSelect({
  label,
  value,
  onChange,
  options = [],
  allLabel,
  className = "w-full lg:w-[158px]",
  showLabel = true,
  required = false,
  disabled = false,
  includeAllOption = true,
}) {
  const mergedOptions = includeAllOption
    ? [{ value: "all", label: allLabel }, ...options]
    : options;

  return (
    <div className={className}>
      <SearchableSelect
        label={showLabel ? label : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        options={mergedOptions}
        placeholder={allLabel}
        required={required}
        disabled={disabled}
      />
    </div>
  );
}
