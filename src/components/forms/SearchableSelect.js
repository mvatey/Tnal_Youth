"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { localizedValue } from "@/lib/i18n";

function normalizeOption(option, index, locale) {
  if (typeof option === "object" && option !== null) {
    const value = option.value ?? option.id ?? option.code ?? "";
    const label = localizedValue(option, locale, "") || String(value);

    return {
      value: String(value),
      label: String(label),
      disabled: Boolean(option.disabled),
      key: option.key ?? option.id ?? option.code ?? `${String(value)}-${index}`,
    };
  }

  return {
    value: String(option ?? ""),
    label: String(option ?? ""),
    disabled: false,
    key: `${String(option ?? "")}-${index}`,
  };
}

/*
 * Single-value select with a search box, for pickers (member, activity...)
 * whose option list is too long to scan by scrolling alone. Same option
 * shape and onChange(event)-with-target.value contract as FormSelect, so
 * it drops in wherever a plain FormSelect gets too long a list to browse.
 */
export default function SearchableSelect({
  label,
  name,
  value = "",
  onChange,
  options = [],
  placeholder = "ជ្រើសរើស",
  disabled = false,
  required = false,
  loading = false,
  error = "",
  searchPlaceholder,
}) {
  const { locale, t } = useLanguage();
  const wrapperRef = useRef(null);
  const searchInputRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const normalizedOptions = useMemo(
    () =>
      Array.isArray(options)
        ? options.map((option, index) => normalizeOption(option, index, locale))
        : [],
    [options, locale],
  );

  const selectedOption = normalizedOptions.find(
    (option) => option.value === String(value ?? ""),
  );

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return normalizedOptions;
    return normalizedOptions.filter((option) =>
      option.label.toLowerCase().includes(normalizedQuery),
    );
  }, [normalizedOptions, query]);

  const isDisabled = disabled || loading;

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    window.setTimeout(() => searchInputRef.current?.focus(), 0);
  }, [open]);

  const selectOption = (option) => {
    onChange?.({ target: { name, value: option.value } });
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={wrapperRef} className="relative min-w-0">
      {label && (
        <label htmlFor={name} className="mb-2 block text-sm font-semibold text-text-primary">
          {label}
          {required && <span className="ml-1 text-error">*</span>}
        </label>
      )}

      <button
        id={name}
        type="button"
        disabled={isDisabled}
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex h-[34px] w-full items-center justify-between gap-2 rounded-lg border bg-bg-page-white px-3 text-left text-sm outline-none transition ${
          error ? "border-error" : "border-border focus:border-primary"
        } disabled:cursor-not-allowed disabled:bg-bg-page-gray disabled:opacity-60`}
      >
        <span className={`min-w-0 flex-1 truncate ${selectedOption ? "text-text-primary" : "text-text-mute"}`}>
          {loading ? t("common.loading") : selectedOption?.label || placeholder}
        </span>

        <ChevronDown
          size={15}
          className={`shrink-0 text-text-secondary transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && !isDisabled && (
        <div className="absolute left-0 right-0 z-[100] mt-1 overflow-hidden rounded-lg border border-border bg-bg-page-white shadow-xl">
          <div className="border-b border-border p-2">
            <div className="flex h-9 items-center gap-2 rounded-md border border-border px-3 focus-within:border-primary">
              <Search size={15} className="shrink-0 text-text-secondary" />

              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder || t("common.search")}
                className="min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="rounded p-0.5 text-text-secondary transition hover:bg-bg-page-gray hover:text-text-primary"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const selected = option.value === selectedOption?.value;

                return (
                  <button
                    key={option.key}
                    type="button"
                    disabled={option.disabled}
                    onClick={() => selectOption(option)}
                    role="option"
                    aria-selected={selected}
                    className={`flex w-full items-center rounded-md px-3 py-2.5 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      selected ? "bg-secondary-light text-secondary" : "text-text-primary hover:bg-bg-page-gray"
                    }`}
                  >
                    <span className="truncate">{option.label}</span>
                  </button>
                );
              })
            ) : (
              <p className="px-3 py-4 text-center text-sm text-text-mute">
                {t("common.noOptionsAvailable")}
              </p>
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
    </div>
  );
}
