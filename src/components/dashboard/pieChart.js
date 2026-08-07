"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown } from "lucide-react";

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

const COLORS = {
  internal: "#4B5FD9",
  external: "#22C55E",
};

const GRADIENT_IDS = {
  internal: "activityInternalGradient",
  external: "activityExternalGradient",
};

const GRADIENT_STOPS = {
  internal: {
    from: "#3B4FC7",
    to: "#A5B4E8",
  },
  external: {
    from: "#22C55E",
    to: "#6EE0A0",
  },
};

const DONUT_SIZE = 190;
const DONUT_INNER_RADIUS = 60;
const DONUT_OUTER_RADIUS = 90;

function getYearOptions(selectedMonth) {
  const selectedYear =
    Number(
      String(selectedMonth ?? "").slice(
        0,
        4
      )
    ) || new Date().getFullYear();

  return [
    selectedYear - 1,
    selectedYear,
    selectedYear + 1,
  ];
}

function MonthDropdown({
  value,
  onChange,
  disabled = false,
}) {
  const yearOptions =
    getYearOptions(value);

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange?.(event.target.value)
        }
        disabled={disabled}
        className="
          appearance-none
          rounded-lg
          border
          border-[#E7E9EE]
          bg-[#F7F8FA]
          py-1.5
          pl-3
          pr-8
          text-[13px]
          text-[#4A4F59]
          outline-none
          transition
          hover:border-gray-300
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {yearOptions.flatMap((year) =>
          MONTHS_KM.map((month) => (
            <option
              key={`${year}-${month.value}`}
              value={`${year}-${month.value}`}
            >
              {month.label} {year}
            </option>
          ))
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
          text-[#8A8F98]
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

      <span>{label}</span>

      <span className="font-semibold text-text-primary">
        ចំនួន{" "}
        {Number(count || 0).toLocaleString()}
      </span>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="flex flex-1 items-center justify-center gap-8">
      <div className="h-[190px] w-[190px] animate-pulse rounded-full border-[30px] border-gray-100" />

      <div className="space-y-4">
        <div className="h-4 w-36 animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-36 animate-pulse rounded bg-gray-100" />
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
  /*
   * Backend response:
   *
   * {
   *   "period": "2026-07",
   *   "internal": 5,
   *   "external": 3,
   *   "total": 8
   * }
   */

  const internalCount =
    Number(data?.internal) || 0;

  const externalCount =
    Number(data?.external) || 0;

  const calculatedTotal =
    internalCount + externalCount;

  const total =
    Number(data?.total) ||
    calculatedTotal;

  /*
   * Recharts does not display a useful empty
   * pie when both values are zero.
   *
   * During zero-data state, two temporary gray
   * values preserve the donut shape.
   */
  const hasData = total > 0;

  const chartData = hasData
    ? [
        {
          name: "កម្មវិធីខាងក្នុង",
          value: internalCount,
          key: "internal",
        },
        {
          name: "កម្មវិធីខាងក្រៅ",
          value: externalCount,
          key: "external",
        },
      ]
    : [
        {
          name: "កម្មវិធីខាងក្នុង",
          value: 1,
          key: "internal",
        },
        {
          name: "កម្មវិធីខាងក្រៅ",
          value: 1,
          key: "external",
        },
      ];

  return (
    <section
      className="
        flex
        h-full
        min-h-[340px]
        w-full
        flex-col
        rounded-[14px]
        bg-white
        px-[18px]
        py-4
        shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)]
      "
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="m-0 text-[15px] font-semibold text-[#232629]">
          សង្ខេបកម្មវិធី
        </h3>

        <MonthDropdown
          value={month}
          onChange={onMonthChange}
          disabled={loading}
        />
      </div>

      {loading && !data ? (
        <ChartSkeleton />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8">
          <div
            className="relative shrink-0"
            style={{
              width: DONUT_SIZE,
              height: DONUT_SIZE,
            }}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <defs>
                  <linearGradient
                    id={
                      GRADIENT_IDS.internal
                    }
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={
                        GRADIENT_STOPS
                          .internal.from
                      }
                    />

                    <stop
                      offset="100%"
                      stopColor={
                        GRADIENT_STOPS
                          .internal.to
                      }
                    />
                  </linearGradient>

                  <linearGradient
                    id={
                      GRADIENT_IDS.external
                    }
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={
                        GRADIENT_STOPS
                          .external.from
                      }
                    />

                    <stop
                      offset="100%"
                      stopColor={
                        GRADIENT_STOPS
                          .external.to
                      }
                    />
                  </linearGradient>
                </defs>

                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={
                    DONUT_INNER_RADIUS
                  }
                  outerRadius={
                    DONUT_OUTER_RADIUS
                  }
                  paddingAngle={2}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  isAnimationActive={
                    !loading && hasData
                  }
                >
                  {chartData.map(
                    (entry) => (
                      <Cell
                        key={entry.key}
                        fill={
                          hasData
                            ? `url(#${
                                GRADIENT_IDS[
                                  entry.key
                                ]
                              })`
                            : "#EDEEF2"
                        }
                        opacity={
                          loading ? 0.6 : 1
                        }
                      />
                    )
                  )}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {!loading && !hasData && (
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
                  text-[#9AA0A8]
                "
              >
                មិនទាន់មានទិន្នន័យ
              </div>
            )}
          </div>

          <div>
            <LegendRow
              color={COLORS.internal}
              label="កម្មវិធីខាងក្នុង"
              count={internalCount}
              loading={loading}
            />

            <LegendRow
              color={COLORS.external}
              label="កម្មវិធីខាងក្រៅ"
              count={externalCount}
              loading={loading}
            />
          </div>
        </div>
      )}
    </section>
  );
}