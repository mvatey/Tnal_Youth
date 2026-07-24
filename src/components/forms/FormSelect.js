"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FormSelect({ label, placeholder = "ជ្រើសរើស", options = [], value = "", onChange, name, disabled = false }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const getOptionValue = (option) => {
    return typeof option === "object" ? option.value : option;
  };

  const getOptionLabel = (option) => {
    return typeof option === "object" ? option.label : option;
  };

  const selectedOption = options.find((option) => String(getOptionValue(option)) === String(value));
  const selectedLabel = selectedOption ? getOptionLabel(selectedOption) : "";

  const handleSelect = (option) => {
    const selectedValue = getOptionValue(option);

    onChange?.({
      target: {
        name,
        value: selectedValue,
      },
    });

    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {label && <label className="mb-2 block text-sm font-semibold text-text-primary">{label}</label>}

      <button type="button" disabled={disabled} onClick={() => setOpen((previous) => !previous)} className={`flex py-2 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 text-left text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-gray-100 ${selectedLabel ? "text-text-primary" : "text-gray-500"}`}>
        <span className="truncate">{selectedLabel || placeholder}</span>
        <ChevronDown size={17} className={`ml-3 shrink-0 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && !disabled && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="max-h-[120px] overflow-y-auto py-1">
            {options.length > 0 ? (
              options.map((option) => {
                const optionValue = getOptionValue(option);
                const optionLabel = getOptionLabel(option);
                const active = String(optionValue) === String(value);

                return (
                  <button key={optionValue} type="button" onClick={() => handleSelect(option)} className={`flex h-10 w-full items-center px-3 text-left text-sm transition hover:bg-primary-lighter hover:text-primary ${active ? "bg-primary-lighter font-semibold text-primary" : "text-text-primary"}`}>
                    <span className="truncate">{optionLabel}</span>
                  </button>
                );
              })
            ) : (
              <div className="flex h-10 items-center px-3 text-sm text-gray-400">មិនមានទិន្នន័យ</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}