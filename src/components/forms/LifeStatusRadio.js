"use client";

import { useLanguage } from "@/context/LanguageContext";

/*
 * Alive / deceased choice for a member. Values are the API's own
 * ("ALIVE" / "DECEASED"), unlike the older RadioGroup used for relatives on
 * the family pages, which stores the Khmer words themselves. onChange
 * receives the new value directly, not an event.
 */
export default function LifeStatusRadio({
  label,
  name = "life_status",
  value = "ALIVE",
  onChange,
  disabled = false,
}) {
  const { t } = useLanguage();

  const options = [
    { value: "ALIVE", label: t("memberPage.lifeAlive") },
    { value: "DECEASED", label: t("memberPage.lifeDeceased") },
  ];

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-text-primary">
        {label}
      </label>

      <div className="flex gap-8 pt-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex items-center gap-3 text-sm text-text-primary ${
              disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              disabled={disabled}
              onChange={() => onChange?.(option.value)}
              className="h-5 w-5 accent-primary"
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
}
