"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import { activityTypeColor } from "@/lib/activityTypeColors";

const MONTHS_KM = [
  { value: "01", label: "ខែមករា" },
  { value: "02", label: "ខែកុម្ភៈ" },
  { value: "03", label: "ខែមីនា" },
  { value: "04", label: "ខែមេសា" },
  { value: "05", label: "ខែឧសភា" },
  { value: "06", label: "ខែមិថុនា" },
  { value: "07", label: "ខែកក្កដា" },
  { value: "08", label: "ខែសីហា" },
  { value: "09", label: "ខែកញ្ញា" },
  { value: "10", label: "ខែតុលា" },
  { value: "11", label: "ខែវិច្ឆិកា" },
  { value: "12", label: "ខែធ្នូ" },
];

const MONTHS_EN = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

// Internal and external keep the colours they have always had (with their
// gradient); every other type takes its colour from the shared per-type
// palette (see lib/activityTypeColors), the same one the activity table and
// the dashboard lists use.
const FIXED_TYPE_COLORS = {
  INTERNAL: { from: "#3B4FC7", to: "#A5B4E8", solid: "#4B5FD9" },
  EXTERNAL: { from: "#22C55E", to: "#6EE0A0", solid: "#22C55E" },
};

// A lighter shade of the same colour for the bottom of each slice's
// gradient, matching how the two fixed colours are drawn.
function lighten(hex, ratio = 0.5) {
  const value = hex.replace("#", "");
  const channel = (offset) => {
    const base = parseInt(value.slice(offset, offset + 2), 16);
    return Math.round(base + (255 - base) * ratio)
      .toString(16)
      .padStart(2, "0");
  };

  return `#${channel(0)}${channel(2)}${channel(4)}`;
}

function colorForType(code) {
  if (FIXED_TYPE_COLORS[code]) {
    return FIXED_TYPE_COLORS[code];
  }

  const solid = activityTypeColor(code);

  return { from: solid, to: lighten(solid), solid };
}

const DONUT_SIZE = 190;
const DONUT_INNER_RADIUS = 60;
const DONUT_OUTER_RADIUS = 90;

/*
 * Generate months starting from January
 * of the current year up to the current month only.
 *
 * Example in August 2026:
 *
 * 2026-01
 * 2026-02
 * ...
 * 2026-08
 *
 * No future months.
 * No previous years.
 */
function getAvailableMonths(locale = "km") {
  const today = new Date();

  const currentYear =
    today.getFullYear();

  const currentMonthIndex =
    today.getMonth();

  const months =
    locale === "en"
      ? MONTHS_EN
      : MONTHS_KM;

  return months
    .slice(
      0,
      currentMonthIndex + 1
    )
    .map((month) => ({
      value:
        `${currentYear}-${month.value}`,

      label:
        `${month.label} ${currentYear}`,
    }));
}

function MonthDropdown({
  value,
  onChange,
  disabled = false,
}) {
  const { locale } =
    useLanguage();

  const monthOptions =
    getAvailableMonths(locale);

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange?.(
            event.target.value
          )
        }
        disabled={disabled}
        className="
          appearance-none
          rounded-lg
          border
          border-border
          bg-bg-page-gray
          py-1.5
          pl-3
          pr-8
          text-[13px]
          text-text-secondary
          outline-none
          transition
          hover:opacity-80
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {monthOptions.map(
          (month) => (
            <option
              key={month.value}
              value={month.value}
            >
              {month.label}
            </option>
          )
        )}
      </select>

      <ChevronDown
        size={14}
        className="
          pointer-events-none
          absolute
          right-2.5
          top-1/2
          -translate-y-1/2
          text-text-secondary
        "
      />
    </div>
  );
}

function LegendRow({
  color,
  label,
  count,
  loading,
}) {
  const { t } =
    useLanguage();

  return (
    <div
      className={`
        mb-3
        flex
        items-center
        gap-2
        text-sm
        text-text-secondary
        transition-opacity
        ${
          loading
            ? "opacity-40"
            : "opacity-100"
        }
      `}
    >
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{
          backgroundColor: color,
        }}
      />

      <span>
        {label}
      </span>

      <span className="font-semibold text-text-primary">
        {t("dashboard.count")}{" "}
        {Number(
          count || 0
        ).toLocaleString()}
      </span>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="flex flex-1 items-center justify-center gap-8">
      <div className="h-[190px] w-[190px] animate-pulse rounded-full border-[30px] border-bg-page-gray" />

      <div className="space-y-4">
        <div className="h-4 w-36 animate-pulse rounded bg-bg-page-gray" />
        <div className="h-4 w-36 animate-pulse rounded bg-bg-page-gray" />
      </div>
    </div>
  );
}

export default function ActivitySummaryChart({
  data,
  month,
  onMonthChange,
  loading = false,
}) {
  const { t, locale } =
    useLanguage();

  // Every active activity type with its count. An older backend only sent
  // internal/external, so fall back to just those two.
  const rawTypes =
    Array.isArray(data?.types) && data.types.length > 0
      ? data.types
      : [
          { code: "INTERNAL", count: Number(data?.internal) || 0 },
          { code: "EXTERNAL", count: Number(data?.external) || 0 },
        ];

  const types = rawTypes.map((type) => {
    const code = String(type.code || "").toUpperCase();
    const isFixed = Boolean(FIXED_TYPE_COLORS[code]);
    const colors = colorForType(code);

    const lookupLabel =
      locale === "en"
        ? type.labelEn || type.labelKm
        : type.labelKm || type.labelEn;

    return {
      key: code,
      // The lookup's own label wins, so a rename on the variable page
      // shows here. The built-in wording is only a fallback for an older
      // backend that sends no labels.
      name:
        lookupLabel ||
        (code === "INTERNAL"
          ? t("dashboard.internalActivity")
          : code === "EXTERNAL"
            ? t("dashboard.externalActivity")
            : code),
      value: Number(type.count) || 0,
      colors,
    };
  });

  const calculatedTotal = types.reduce(
    (sum, type) => sum + type.value,
    0,
  );

  const total =
    Number(data?.total) ||
    calculatedTotal;

  const hasData =
    total > 0;

  // Only types that actually have activities get a slice; with none at all
  // the ring is drawn as a single grey placeholder.
  const chartData =
    hasData
      ? types.filter((type) => type.value > 0)
      : [{ key: "empty", name: "", value: 1, colors: null }];

  return (
    <section
      className="
        flex
        h-full
        min-h-[340px]
        min-w-0
        w-full
        flex-col
        rounded-[14px]
        bg-bg-page-white
        px-[18px]
        py-4
        shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)]
      "
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="m-0 min-w-0 truncate text-[15px] font-semibold text-text-primary">
          {t("dashboard.activitySummary")}
        </h3>

        <MonthDropdown
          value={month}
          onChange={
            onMonthChange
          }
          disabled={
            loading
          }
        />
      </div>

      {loading && !data ? (
        <ChartSkeleton />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8">
          <div
            className="relative shrink-0"
            style={{
              width:
                DONUT_SIZE,
              height:
                DONUT_SIZE,
            }}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <defs>
                  {types.map((type) => (
                    <linearGradient
                      key={type.key}
                      id={`activityTypeGradient-${type.key}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={type.colors.from}
                      />

                      <stop
                        offset="100%"
                        stopColor={type.colors.to}
                      />
                    </linearGradient>
                  ))}
                </defs>

                <Pie
                  data={
                    chartData
                  }
                  dataKey="value"
                  nameKey="name"
                  innerRadius={
                    DONUT_INNER_RADIUS
                  }
                  outerRadius={
                    DONUT_OUTER_RADIUS
                  }
                  paddingAngle={2}
                  stroke="var(--color-bg-page-white, #FFFFFF)"
                  strokeWidth={2}
                  isAnimationActive={
                    !loading &&
                    hasData
                  }
                >
                  {chartData.map(
                    (entry) => (
                      <Cell
                        key={
                          entry.key
                        }
                        fill={
                          hasData
                            ? `url(#activityTypeGradient-${entry.key})`
                            : "var(--color-bg-page-gray, #EDEEF2)"
                        }
                        opacity={
                          loading
                            ? 0.6
                            : 1
                        }
                      />
                    )
                  )}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {!loading &&
              !hasData && (
                <div
                  className="
                    absolute
                    inset-0
                    flex
                    items-center
                    justify-center
                    px-6
                    text-center
                    text-xs
                    text-text-mute
                  "
                >
                  {t("dashboard.noData")}
                </div>
              )}
          </div>

          <div>
            {types.map((type) => (
              <LegendRow
                key={type.key}
                color={type.colors.solid}
                label={type.name}
                count={type.value}
                loading={loading}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
