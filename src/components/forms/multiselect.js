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
  required = false,
  error = "",
  selectAllLabel,
  emptyLabel,
}) {
  const { t } = useLanguage();

  const resolvedPlaceholder = placeholder ?? t("common.select");
  const resolvedSelectAllLabel = selectAllLabel ?? t("common.selectAll");
  const resolvedEmptyLabel = emptyLabel ?? t("common.noOptionsAvailable");

  const wrapperRef =
    useRef(null);

  const [
    open,
    setOpen,
  ] = useState(false);

  const normalizedOptions =
    useMemo(() => {
      return Array.isArray(options)
        ? options.map(
            normalizeOption,
          )
        : [];
    }, [options]);

  const selectedValues =
    useMemo(() => {
      return Array.isArray(value)
        ? value.map(String)
        : [];
    }, [value]);

  const selectableOptions =
    normalizedOptions.filter(
      (option) =>
        !option.disabled &&
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
      }
    }

    function handleEscape(
      event,
    ) {
      if (
        event.key === "Escape"
      ) {
        setOpen(false);
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

  const toggleOption = (
    optionValue,
  ) => {
    if (disabled) {
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
    if (disabled) {
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
          role="listbox"
          aria-multiselectable="true"
          className="
            absolute
            left-0
            right-0
            z-[100]
            mt-1
            max-h-72
            overflow-y-auto
            rounded-lg
            border
            border-border
            bg-bg-page-white
            py-1
            shadow-xl
          "
        >
          {selectableOptions.length >
          0 ? (
            <>
              {/* Select all */}

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

              {/* Options */}

              {normalizedOptions.map(
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
                      className="
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
                        hover:bg-bg-page-gray
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
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