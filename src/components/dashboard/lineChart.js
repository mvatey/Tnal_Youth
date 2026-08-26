"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChevronDown } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

const CURRENT_YEAR =
  new Date().getFullYear();

const YEAR_OPTIONS = [
  CURRENT_YEAR - 2,
  CURRENT_YEAR - 1,
  CURRENT_YEAR,
  CURRENT_YEAR + 1,
];

const MONTH_LABELS_KM = {
  1: "មករា",
  2: "កុម្ភៈ",
  3: "មីនា",
  4: "មេសា",
  5: "ឧសភា",
  6: "មិថុនា",
  7: "កក្កដា",
  8: "សីហា",
  9: "កញ្ញា",
  10: "តុលា",
  11: "វិច្ឆិកា",
  12: "ធ្នូ",
};

const MONTH_LABELS_EN = {
  1: "Jan",
  2: "Feb",
  3: "Mar",
  4: "Apr",
  5: "May",
  6: "Jun",
  7: "Jul",
  8: "Aug",
  9: "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec",
};

const LINE_COLOR = "#7B6EF6";

function getMonthNumber(item) {
  const directMonth =
    Number(item?.month);

  if (
    Number.isInteger(directMonth) &&
    directMonth >= 1 &&
    directMonth <= 12
  ) {
    return directMonth;
  }

  const period =
    String(item?.period ?? "");

  const periodMonth =
    Number(period.slice(5, 7));

  if (
    Number.isInteger(periodMonth) &&
    periodMonth >= 1 &&
    periodMonth <= 12
  ) {
    return periodMonth;
  }

  return null;
}

function normalizeParticipationMonths(
  months,
  year,
  locale = "km"
) {
  const monthLabels =
    locale === "en"
      ? MONTH_LABELS_EN
      : MONTH_LABELS_KM;

  const monthMap = new Map();

  if (Array.isArray(months)) {
    months.forEach((item) => {
      const monthNumber =
        getMonthNumber(item);

      if (!monthNumber) {
        return;
      }

      monthMap.set(monthNumber, {
        monthNumber,
        month:
          monthLabels[
            monthNumber
          ],
        period:
          item?.period ??
          `${year}-${String(
            monthNumber
          ).padStart(2, "0")}`,
        participantCount:
          Number(
            item?.participationCount ??
              item?.participant_count ??
              item?.count
          ) || 0,
      });
    });
  }

  /*
   * Always create 12 points so the chart keeps
   * the same shape even when some months have
   * no records.
   */
  return Array.from(
    { length: 12 },
    (_, index) => {
      const monthNumber =
        index + 1;

      return (
        monthMap.get(monthNumber) ?? {
          monthNumber,
          month:
            monthLabels[
              monthNumber
            ],
          period: `${year}-${String(
            monthNumber
          ).padStart(2, "0")}`,
          participantCount: 0,
        }
      );
    }
  );
}

function ChartTooltip({
  active,
  payload,
}) {
  const { t } =
    useLanguage();

  if (
    !active ||
    !payload ||
    payload.length === 0
  ) {
    return null;
  }

  const item =
    payload[0]?.payload;

  return (
    <div
      className="
        rounded-lg
        border
        border-border
        bg-bg-page-white
        px-3
        py-2
        text-xs
        shadow-[0_2px_8px_rgba(16,24,40,0.08)]
      "
    >
      <div className="mb-0.5 text-text-mute">
        {item?.month} {item?.period?.slice(0, 4)}
      </div>

      <div className="font-semibold text-text-primary">
        {Number(
          item?.participantCount || 0
        ).toLocaleString()}{" "}
        {t("dashboard.peopleUnit")}
      </div>
    </div>
  );
}

function YearDropdown({
  value,
  onChange,
  disabled = false,
}) {
  const { t, locale } =
    useLanguage();

  const normalizedValue =
    Number(value) || CURRENT_YEAR;

  const availableYears =
    Array.from(
      new Set([
        ...YEAR_OPTIONS,
        normalizedValue,
      ])
    ).sort((a, b) => a - b);

  return (
    <div className="relative">
      <select
        value={normalizedValue}
        onChange={(event) =>
          onChange?.(
            Number(event.target.value)
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
        {availableYears.map(
          (yearOption) => (
            <option
              key={yearOption}
              value={yearOption}
            >
              {yearOption}
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

function ChartSkeleton() {
  return (
    <div className="flex flex-1 animate-pulse items-end gap-4 px-8 pb-8">
      {[
        55, 35, 68, 48, 78, 58,
        82, 63, 74, 52, 70, 45,
      ].map((height, index) => (
        <div
          key={index}
          className="flex-1 rounded-t bg-bg-page-gray"
          style={{
            height: `${height}%`,
          }}
        />
      ))}
    </div>
  );
}

export default function ParticipationChart({
  data,
  year,
  onYearChange,
  loading = false,
}) {
  const { t, locale } =
    useLanguage();

  /*
   * Backend response:
   *
   * {
   *   "year": 2026,
   *   "months": [
   *     {
   *       "month": 1,
   *       "period": "2026-01",
   *       "participationCount": 10
   *     }
   *   ]
   * }
   */

  const selectedYear =
    Number(year) ||
    Number(data?.year) ||
    CURRENT_YEAR;

  const chartData =
    normalizeParticipationMonths(
      data?.months,
      selectedYear,
      locale
    );

  const hasAnyData =
    chartData.some(
      (item) =>
        item.participantCount > 0
    );

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
      <div className="mb-3 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h3 className="m-0 text-[15px] font-semibold text-text-primary">
          {t("dashboard.monthlyParticipation")}
        </h3>

        <YearDropdown
          value={selectedYear}
          onChange={onYearChange}
          disabled={loading}
        />
      </div>

      {loading && !data ? (
        <ChartSkeleton />
      ) : (
        <div className="relative min-h-0 min-w-0 flex-1 pb-2">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <AreaChart
              data={chartData}
              margin={{
                top: 8,
                right: 16,
                left: 8,
                bottom: 12,
              }}
            >
              <CartesianGrid
                stroke="var(--color-border, #F3F4F6)"
                vertical={false}
              />

              <Tooltip
                content={
                  <ChartTooltip />
                }
                cursor={{
                  stroke: "var(--color-border, #E4E5EA)",
                  strokeWidth: 1,
                }}
              />

              <XAxis
                dataKey="month"
                tick={{
                  fontSize: 10,
                  fill: "var(--color-text-mute, #9AA0A8)",
                }}
                axisLine={false}
                tickLine={false}
                interval={0}
                tickMargin={6}
                padding={{
                  left: 12,
                  right: 12,
                }}
              />

              <YAxis
                allowDecimals={false}
                tick={{
                  fontSize: 11,
                  fill: "var(--color-text-mute, #9AA0A8)",
                }}
                axisLine={false}
                tickLine={false}
                width={40}
              />

              <Area
                type="monotone"
                dataKey="participantCount"
                stroke={
                  loading
                    ? "#E4E5EA"
                    : LINE_COLOR
                }
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: LINE_COLOR,
                  stroke: "var(--color-bg-page-white, #FFFFFF)",
                  strokeWidth: 2,
                }}
                isAnimationActive={
                  !loading
                }
              />
            </AreaChart>
          </ResponsiveContainer>

          {!loading && !hasAnyData && (
            <div
              className="
                absolute
                inset-0
                flex
                items-center
                justify-center
                bg-bg-page-white/60
                text-xs
                text-text-mute
              "
            >
              {t("dashboard.noDataForYear")}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
