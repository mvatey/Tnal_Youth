"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, Search, X } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

const LEVEL_ORDER = { PROVINCE: 0, DISTRICT: 1, COMMUNE: 2 };

const EMPTY = { mode: "", level: "", branchId: "" };

/*
 * A whole "filter by branch / by branch level" picker in ONE control, for a
 * toolbar that is already crowded: the dropdown walks through its own steps
 * instead of showing several selects side by side.
 *
 *   1. Branch  |  Branch level
 *   2. (level only) Province | District | Commune
 *   3. a searchable list of branches -- every branch (provinces, then
 *      districts, then communes) when filtering by branch, or only the
 *      branches of the chosen level
 *
 * It only reports what was picked -- value is { mode, level, branchId } --
 * and what that means (exact branch vs. branch plus everything under it) is
 * the caller's job.
 *
 * areas: [{ id, level: "PROVINCE" | "DISTRICT" | "COMMUNE", name }]
 */
export default function BranchAreaFilter({
  areas = [],
  value = EMPTY,
  onChange,
  placeholder,
  disabled = false,
}) {
  const { t } = useLanguage();
  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);
  const searchRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("mode");
  const [pendingMode, setPendingMode] = useState("");
  const [pendingLevel, setPendingLevel] = useState("");
  const [query, setQuery] = useState("");
  const [rect, setRect] = useState(null);

  const levelLabels = useMemo(
    () => ({
      PROVINCE: t("memberPage.areaLevelProvince"),
      DISTRICT: t("memberPage.areaLevelDistrict"),
      COMMUNE: t("memberPage.areaLevelCommune"),
    }),
    [t],
  );

  const selectedArea = areas.find(
    (area) => String(area.id) === String(value.branchId),
  );

  const triggerText = selectedArea ? selectedArea.name : placeholder;

  const hasSelection = Boolean(value.branchId);

  const openPanel = () => {
    // Reopening with something already picked lands on its branch list,
    // so the current choice is visible; "back" walks up to change it.
    if (value.mode === "branch" || value.mode === "level") {
      setPendingMode(value.mode);
      setPendingLevel(value.level || "");
      setStep("branch");
    } else {
      setPendingMode("");
      setPendingLevel("");
      setStep("mode");
    }

    setQuery("");
    setOpen(true);
  };

  const closePanel = () => {
    setOpen(false);
    setQuery("");
  };

  useEffect(() => {
    if (!open) return undefined;

    const handleOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        closePanel();
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  useEffect(() => {
    if (open && step === "branch") {
      window.setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [open, step]);

  // Fixed to the viewport (measured from the trigger) rather than absolute:
  // the toolbar scrolls horizontally on narrow screens, which would clip an
  // absolutely positioned panel. Same approach as SearchableSelect.
  useEffect(() => {
    if (!open) return undefined;

    const PREFERRED_HEIGHT = 300;
    const MARGIN = 8;

    const update = () => {
      const box = triggerRef.current?.getBoundingClientRect();
      if (!box) return;

      const below = window.innerHeight - box.bottom;
      const above = box.top;
      const upward = below < PREFERRED_HEIGHT && above > below;

      setRect({
        left: box.left,
        width: box.width,
        top: upward ? null : box.bottom,
        bottom: upward ? window.innerHeight - box.top : null,
        maxHeight: Math.max(160, (upward ? above : below) - MARGIN),
      });
    };

    update();

    const closeOnScroll = (event) => {
      if (wrapperRef.current?.contains(event.target)) return;
      closePanel();
    };

    window.addEventListener("scroll", closeOnScroll, true);
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", closeOnScroll, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  const branchRows = useMemo(() => {
    const rows = areas
      .filter(
        (area) => pendingMode !== "level" || area.level === pendingLevel,
      )
      .sort(
        (a, b) =>
          (LEVEL_ORDER[a.level] ?? 9) - (LEVEL_ORDER[b.level] ?? 9) ||
          a.name.localeCompare(b.name),
      );

    const needle = query.trim().toLowerCase();

    return needle
      ? rows.filter((area) => area.name.toLowerCase().includes(needle))
      : rows;
  }, [areas, pendingMode, pendingLevel, query]);

  const pick = (area) => {
    onChange?.({
      mode: pendingMode,
      level: pendingMode === "level" ? pendingLevel : "",
      branchId: String(area.id),
    });
    closePanel();
  };

  const clear = () => {
    onChange?.(EMPTY);
    closePanel();
  };

  const goBack = () => {
    if (step === "branch") {
      setQuery("");
      setStep(pendingMode === "level" ? "level" : "mode");
    } else {
      setStep("mode");
    }
  };

  const rowClass =
    "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition hover:bg-bg-page-gray";

  return (
    <div ref={wrapperRef} className="relative min-w-0">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => (open ? closePanel() : openPanel())}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-[34px] w-full items-center justify-between gap-2 rounded-lg border border-border bg-bg-page-white px-3 text-left text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="min-w-0 flex-1 truncate text-text-secondary">
          {triggerText}
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 text-text-secondary transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && rect && (
        <div
          className="fixed z-[100] flex flex-col overflow-hidden rounded-lg border border-border bg-bg-page-white shadow-xl"
          style={{
            left: rect.left,
            width: rect.width,
            top: rect.top ?? undefined,
            bottom: rect.bottom ?? undefined,
            maxHeight: rect.maxHeight,
          }}
        >
          {step !== "mode" && (
            <div className="flex shrink-0 items-center gap-1 border-b border-border p-2">
              <button
                type="button"
                onClick={goBack}
                aria-label={t("common.back", "Back")}
                className="rounded p-1 text-text-secondary transition hover:bg-bg-page-gray hover:text-text-primary"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="truncate text-xs font-semibold text-text-secondary">
                {pendingMode === "level"
                  ? t("memberPage.areaModeLevel")
                  : t("memberPage.areaModeBranch")}
                {step === "branch" && pendingMode === "level" && pendingLevel
                  ? ` · ${levelLabels[pendingLevel]}`
                  : ""}
              </span>
            </div>
          )}

          {step === "branch" && (
            <div className="shrink-0 border-b border-border p-2">
              <div className="flex h-9 items-center gap-2 rounded-md border border-border px-3 focus-within:border-primary">
                <Search size={15} className="shrink-0 text-text-secondary" />

                <input
                  ref={searchRef}
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
          )}

          <div className="no-scrollbar overflow-y-auto p-1">
            {step === "mode" && (
              <>
                <button
                  type="button"
                  className={rowClass}
                  onClick={() => {
                    setPendingMode("branch");
                    setStep("branch");
                  }}
                >
                  <span>{t("memberPage.areaModeBranch")}</span>
                </button>

                <button
                  type="button"
                  className={rowClass}
                  onClick={() => {
                    setPendingMode("level");
                    setStep("level");
                  }}
                >
                  <span>{t("memberPage.areaModeLevel")}</span>
                </button>
              </>
            )}

            {step === "level" &&
              ["PROVINCE", "DISTRICT", "COMMUNE"].map((level) => (
                <button
                  key={level}
                  type="button"
                  className={rowClass}
                  onClick={() => {
                    setPendingLevel(level);
                    setStep("branch");
                  }}
                >
                  <span>{levelLabels[level]}</span>
                </button>
              ))}

            {step === "branch" &&
              (branchRows.length === 0 ? (
                <p className="px-3 py-4 text-center text-sm text-text-mute">
                  {t("common.noOptionsAvailable")}
                </p>
              ) : (
                branchRows.map((area) => {
                  const active = String(area.id) === String(value.branchId);

                  return (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => pick(area)}
                      className={`${rowClass} ${
                        active
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-text-primary"
                      }`}
                    >
                      <span className="truncate">{area.name}</span>
                    </button>
                  );
                })
              ))}
          </div>

          {hasSelection && (
            <button
              type="button"
              onClick={clear}
              className="shrink-0 border-t border-border px-3 py-2.5 text-left text-sm font-medium text-error transition hover:bg-bg-page-gray"
            >
              {t("memberPage.areaClear")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
