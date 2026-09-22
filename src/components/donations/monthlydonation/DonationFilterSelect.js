import SearchableSelect from "@/components/forms/SearchableSelect";
import FormSelect from "@/components/forms/FormSelect";

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
  // Only the branch picker realistically grows long enough (many branches)
  // to need a search box -- month/year/activity/status/etc. lists are
  // short and fixed, so a search box there is just an extra click.
  searchable = false,
}) {
  const mergedOptions = includeAllOption
    ? [{ value: "all", label: allLabel }, ...options]
    : options;

  const Select = searchable ? SearchableSelect : FormSelect;

  return (
    <div className={className}>
      <Select
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
