"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import SelectArrow from "@/components/forms/SelectArrow.js";

export default function BoxFill({ label, type = "text", placeholder = "", options = [], value, defaultValue = "", onChange, name, readOnly = false, disabled = false }) {
  const [focused, setFocused] = useState(false);
  const isControlled = value !== undefined;
  const sharedValueProps = isControlled ? { value, onChange } : { defaultValue, onChange };

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-text-primary">{label}</label>

      {type === "select" ? (
        <div className="relative">
          <select name={name} {...sharedValueProps} disabled={disabled} className="py-2 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 pr-10 text-sm text-gray-600 outline-none focus:border-primary disabled:cursor-not-allowed disabled:bg-gray-100">
            <option value="" disabled>{placeholder}</option>

            {options.map((option) => {
              const optionValue = typeof option === "object" ? option.value : option;
              const optionLabel = typeof option === "object" ? option.label : option;

              return (
                <option key={optionValue} value={optionValue}>{optionLabel}</option>
              );
            })}
          </select>

          <SelectArrow />
        </div>
      ) : type === "date" ? (
        <div className="relative">
          <input type="date" name={name} {...sharedValueProps} readOnly={readOnly} disabled={disabled} className="py-2 w-full rounded-lg border border-gray-200 px-3 pr-10 text-sm text-gray-600 outline-none focus:border-primary disabled:cursor-not-allowed disabled:bg-gray-100" />

          <Calendar size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      ) : (
        <input type={type} name={name} {...sharedValueProps} readOnly={readOnly} disabled={disabled} placeholder={focused ? "" : placeholder} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} className="py-2 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-600 outline-none focus:border-primary disabled:cursor-not-allowed disabled:bg-gray-100" />
      )}
    </div>
  );
}