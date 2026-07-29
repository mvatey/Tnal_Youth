"use client";

function Radio({ name, label, value, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-text-primary">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="h-5 w-5 accent-primary"
      />
      {label}
    </label>
  );
}

export default function RadioGroup({ label, name, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-text-primary">
        {label}
      </label>

      <div className="flex gap-8 pt-2">
        <Radio
          name={name}
          label="នៅរស់"
          value="នៅរស់"
          checked={value === "នៅរស់"}
          onChange={onChange}
        />
        <Radio
          name={name}
          label="ស្លាប់"
          value="ស្លាប់"
          checked={value === "ស្លាប់"}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
