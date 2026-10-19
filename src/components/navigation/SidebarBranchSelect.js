"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Search } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

/*
 * The sidebar's branch switcher for someone who covers many branches (a
 * multi-branch or regional secretary) -- a native <select> with dozens of
 * options has no way to find one, so past a handful this swaps in a
 * dropdown with a search box. Styled for the sidebar's dark surface; the
 * caller still owns the icon on the left and decides when to use this
 * instead of the plain select.
 */
export default function SidebarBranchSelect({
  branches,
  value,
  onChange,
  getValue,
  getLabel,
}) {
  const { t } = useLanguage();
  const wrapperRef = useRef(null);
  const searchRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const options = useMemo(
    () =>
      branches.map((branch) => ({
        value: String(getValue(branch)),
        label: getLabel(branch),
      })),
    [branches, getValue, getLabel],
  );

  const selected = options.find((option) => option.value === String(value));

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return needle
      ? options.filter((option) => option.label.toLowerCase().includes(needle))
      : options;
  }, [options, query]);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      window.setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="
          h-[40px]
          w-full
          rounded-xl
          border
          border-white/10
          bg-white/10
          pl-11
          pr-8
          text-left
          text-sm
          font-medium
          text-white
          outline-none
          transition-all
          hover:bg-white/20
          focus:border-white/30
          focus:bg-white/15
        "
      >
        <span className="block truncate">{selected?.label ?? ""}</span>
      </button>

      <FaChevronDown
        size={12}
        className={`
          pointer-events-none
          absolute
          right-4
          top-1/2
          -translate-y-1/2
          text-white/60
          transition-transform
          ${open ? "rotate-180" : ""}
        `}
      />

      {open && (
        <div
          className="
            absolute
            left-0
            right-0
            z-50
            mt-1
            overflow-hidden
            rounded-xl
            border
            border-border
            bg-bg-page-white
            text-text-primary
            shadow-xl
          "
        >
          <div className="border-b border-border p-2">
            <div className="flex h-9 items-center gap-2 rounded-md border border-border px-3 focus-within:border-primary">
              <Search size={15} className="shrink-0 text-text-secondary" />

              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("common.search")}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-text-secondary"
              />
            </div>
          </div>

          <div role="listbox" className="max-h-60 overflow-y-auto py-1">
            {visible.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-text-mute">
                {t("common.noOptionsAvailable")}
              </p>
            ) : (
              visible.map((option) => {
                const active = option.value === String(value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={`
                      block
                      w-full
                      truncate
                      px-3
                      py-2.5
                      text-left
                      text-sm
                      transition
                      hover:bg-bg-page-gray
                      ${active ? "font-semibold text-primary" : ""}
                    `}
                  >
                    {option.label}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
