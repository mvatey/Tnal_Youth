"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Check,
  ChevronDown,
  Search,
  X,
} from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

function normalizeOption(
  option,
  index,
) {
  if (
    typeof option === "object" &&
    option !== null
  ) {
    const value =
      option.value ??
      option.id ??
      option.code ??
      "";

    const label =
      option.label ??
      option.nameKm ??
      option.name_kh ??
      option.name ??
      String(value);

    return {
      value: String(value),
      label: String(label),
      disabled: Boolean(
        option.disabled,
      ),
      key:
        option.key ??
        option.id ??
        option.code ??
        `${String(value)}-${index}`,
    };
  }

  return {
    value: String(
      option ?? "",
    ),
    label: String(
      option ?? "",
    ),
    disabled: false,
    key: `${String(option)}-${index}`,
  };
}

export default function MultiSelect({
  label,
  name,
  placeholder,
  options = [],
  value = [],
  onChange,
  disabled = false,
  // Like disabled, except the list can still be opened and scrolled/searched
  // -- selection just can't be changed. For a value computed elsewhere that
  // the user should be able to inspect (e.g. a regional secretary's branches).
  readOnly = false,
  required = false,
  error = "",
  selectAllLabel,
  emptyLabel,
  // Values that can only ever be chosen on their own: once one is selected
  // every other option is locked, and while anything else is selected they
  // are locked themselves (e.g. the country-level branch, which a secretary
  // can hold only as their single branch). "Select all" never includes them.
  exclusiveValues = [],
}) {
  const { t } = useLanguage();

  const resolvedPlaceholder = placeholder ?? t("common.select");
  const resolvedSelectAllLabel = selectAllLabel ?? t("common.selectAll");
  const resolvedEmptyLabel = emptyLabel ?? t("common.noOptionsAvailable");

  const wrapperRef =
    useRef(null);
  const searchInputRef =
    useRef(null);

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    query,
    setQuery,
  ] = useState("");

  const selectedValues =
    useMemo(() => {
      return Array.isArray(value)
        ? value.map(String)
        : [];
    }, [value]);

  const exclusiveSet =
    useMemo(
      () => new Set(exclusiveValues.map(String)),
      [exclusiveValues],
    );

  const exclusiveSelected =
    selectedValues.some((item) =>
      exclusiveSet.has(item),
    );

  const othersSelected =
    selectedValues.some(
      (item) => !exclusiveSet.has(item),
    );

  const normalizedOptions =
    useMemo(() => {
      if (!Array.isArray(options)) {
        return [];
      }

      return options
        .map(normalizeOption)
        .map((option) => {
          const isExclusive =
            exclusiveSet.has(option.value);
          const isSelected =
            selectedValues.includes(option.value);
          const blocked =
            isExclusive
              ? othersSelected
              : exclusiveSelected;

          // Never lock an option that is already ticked, so it can still
          // be unticked.
          return blocked && !isSelected
            ? { ...option, disabled: true }
            : option;
        });
    }, [
      options,
      exclusiveSet,
      exclusiveSelected,
      othersSelected,
      selectedValues,
    ]);

  const visibleOptions =
    useMemo(() => {
      const normalizedQuery =
        query.trim().toLowerCase();

      if (!normalizedQuery) {
        return normalizedOptions;
      }

      return normalizedOptions.filter(
        (option) =>
          option.label
            .toLowerCase()
            .includes(
              normalizedQuery,
            ),
      );
    }, [normalizedOptions, query]);

  const selectableOptions =
    normalizedOptions.filter(
      (option) =>
        !option.disabled &&
        !exclusiveSet.has(option.value) &&
        option.value !== "",
    );

  const selectableValues =
    selectableOptions.map(
      (option) =>
        option.value,
    );

  const selectedLabels =
    normalizedOptions
      .filter((option) =>
        selectedValues.includes(
          option.value,
        ),
      )
      .map(
        (option) =>
          option.label,
      );

  const allSelected =
    selectableValues.length > 0 &&
    selectableValues.every(
      (optionValue) =>
        selectedValues.includes(
          optionValue,
        ),
    );

  const someSelected =
    selectableValues.some(
      (optionValue) =>
        selectedValues.includes(
          optionValue,
        ),
    );

  useEffect(() => {
    function handleOutsideClick(
      event,
    ) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target,
        )
      ) {
        setOpen(false);
        setQuery("");
      }
    }

    function handleEscape(
      event,
    ) {
      if (
        event.key === "Escape"
      ) {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    window.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );

      window.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  }, [open]);

  const toggleOption = (
    optionValue,
  ) => {
    if (disabled || readOnly) {
      return;
    }

    const stringValue =
      String(optionValue);

    const isSelected =
      selectedValues.includes(
        stringValue,
      );

    const nextValues =
      isSelected
        ? selectedValues.filter(
            (item) =>
              item !==
              stringValue,
          )
        : [
            ...selectedValues,
            stringValue,
          ];

    onChange?.(
      nextValues,
    );
  };

  const toggleSelectAll = () => {
    if (disabled || readOnly || exclusiveSelected) {
      return;
    }

    if (allSelected) {
      /*
       * Clear only values that belong
       * to the current option list.
       */
      const nextValues =
        selectedValues.filter(
          (selectedValue) =>
            !selectableValues.includes(
              selectedValue,
            ),
        );

      onChange?.(
        nextValues,
      );

      return;
    }

    /*
     * Preserve any selected values
     * not currently included in options.
     */
    const extraValues =
      selectedValues.filter(
        (selectedValue) =>
          !selectableValues.includes(
            selectedValue,
          ),
      );

    onChange?.([
      ...extraValues,
      ...selectableValues,
    ]);
  };

  const displayText = () => {
    if (
      selectedLabels.length === 0
    ) {
      return resolvedPlaceholder;
    }

    /*
     * A small handful of selections should always read as their
     * actual names — "select all" wording only earns its keep once
     * there are too many names to comfortably show at once (e.g. a
     * secretary picked up 1-3 branches; that's just as easy to read
     * as "branch1, branch2, branch3" as it is to read "select all
     * (3)", and the real names are more useful).
     */
    if (
      selectedLabels.length <= 3
    ) {
      return selectedLabels.join(
        ", ",
      );
    }

    if (allSelected) {
      return `${resolvedSelectAllLabel} (${selectedLabels.length})`;
    }

    return `${selectedLabels
      .slice(0, 2)
      .join(", ")} +${
      selectedLabels.length - 2
    }`;
  };

  return (
    <div
      ref={wrapperRef}
      className="relative min-w-0"
    >
      {label && (
        <label
          htmlFor={name}
          className="
            mb-2
            block
            text-sm
            font-semibold
            text-text-primary
          "
        >
          {label}

          {required && (
            <span className="ml-1 text-error">
              *
            </span>
          )}
        </label>
      )}

      <button
        id={name}
        type="button"
        disabled={disabled}
        onClick={() =>
          setOpen(
            (previous) =>
              !previous,
          )
        }
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`
          flex
          h-[34px]
          w-full
          items-center
          justify-between
          gap-3
          rounded-lg
          border
          bg-bg-page-white
          px-3
          text-left
          text-sm
          outline-none
          transition
          ${
            error
              ? "border-error"
              : "border-border focus:border-primary"
          }
          ${readOnly ? "bg-bg-page-gray" : ""}
          disabled:cursor-not-allowed
          disabled:bg-bg-page-gray
          disabled:opacity-60
        `}
      >
        <span
          className={`
            min-w-0
            flex-1
            truncate
            ${
              selectedLabels.length >
              0
                ? "text-text-primary"
                : "text-text-mute"
            }
          `}
        >
          {displayText()}
        </span>

        <ChevronDown
          size={16}
          className={`
            shrink-0
            text-text-secondary
            transition-transform
            ${
              open
                ? "rotate-180"
                : ""
            }
          `}
        />
      </button>

      {open && !disabled && (
        <div
          className="
            absolute
            left-0
            right-0
            z-[100]
            mt-1
            overflow-hidden
            rounded-lg
            border
            border-border
            bg-bg-page-white
            shadow-xl
          "
        >
          <div className="border-b border-border p-2">
            <div className="flex h-9 items-center gap-2 rounded-md border border-border px-3 focus-within:border-primary">
              <Search size={15} className="shrink-0 text-text-secondary" />

              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("common.search")}
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

          <div
            role="listbox"
            aria-multiselectable="true"
            className="max-h-60 overflow-y-auto py-1"
          >
          {normalizedOptions.some(
            (option) => option.value !== "",
          ) ? (
            <>
              {/* Select all -- always targets the full option list, not
                  just what the search currently filters to. */}

              {!readOnly &&
                !exclusiveSelected &&
                selectableOptions.length > 0 && (
              <button
                type="button"
                onClick={
                  toggleSelectAll
                }
                className="
                  flex
                  w-full
                  items-center
                  justify-between
                  gap-3
                  border-b
                  border-border
                  px-3
                  py-2.5
                  text-left
                  text-sm
                  font-semibold
                  text-primary
                  transition
                  hover:bg-bg-page-gray
                "
              >
                <span className="min-w-0 flex-1 truncate">
                  {resolvedSelectAllLabel}
                </span>

                <CheckboxIndicator
                  checked={
                    allSelected
                  }
                  indeterminate={
                    someSelected &&
                    !allSelected
                  }
                />
              </button>
              )}

              {/* Options */}

              {visibleOptions.length === 0 ? (
                <p className="px-3 py-4 text-center text-sm text-text-mute">
                  {t("common.noOptionsAvailable")}
                </p>
              ) : visibleOptions.map(
                (option) => {
                  const checked =
                    selectedValues.includes(
                      option.value,
                    );

                  return (
                    <button
                      key={
                        option.key
                      }
                      type="button"
                      disabled={
                        option.disabled
                      }
                      onClick={() =>
                        toggleOption(
                          option.value,
                        )
                      }
                      role="option"
                      aria-selected={
                        checked
                      }
                      className={`
                        flex
                        w-full
                        items-center
                        justify-between
                        gap-3
                        px-3
                        py-2.5
                        text-left
                        text-sm
                        text-text-primary
                        transition
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                        ${readOnly ? "cursor-default" : "hover:bg-bg-page-gray"}
                      `}
                    >
                      <span className="min-w-0 flex-1 truncate">
                        {
                          option.label
                        }
                      </span>

                      <CheckboxIndicator
                        checked={
                          checked
                        }
                        muted={readOnly}
                      />
                    </button>
                  );
                },
              )}
            </>
          ) : (
            <p className="px-3 py-4 text-center text-sm text-text-mute">
              {resolvedEmptyLabel}
            </p>
          )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}

function CheckboxIndicator({
  checked,
  indeterminate = false,
  // Paled out so a locked (readOnly) list reads as unclickable.
  muted = false,
}) {
  return (
    <span
      aria-hidden="true"
      className={`
        flex
        h-4
        w-4
        shrink-0
        items-center
        justify-center
        rounded
        border
        transition
        ${muted ? "opacity-40" : ""}
        ${
          checked ||
          indeterminate
            ? `
              border-primary
              bg-primary
              text-white
            `
            : `
              border-border
              bg-bg-page-white
            `
        }
      `}
    >
      {indeterminate ? (
        <span className="h-[2px] w-2 rounded-full bg-bg-page-white" />
      ) : checked ? (
        <Check
          size={12}
          strokeWidth={3}
        />
      ) : null}
    </span>
  );
}