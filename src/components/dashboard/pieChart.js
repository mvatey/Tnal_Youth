"use client";

import { useState, useEffect, useCallback } from "react";
import { PieChart, Pie, Cell } from "recharts";
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

// Real "today" — reflects whenever the component actually renders.
const TODAY = new Date();
const CURRENT_YEAR = TODAY.getFullYear();
const CURRENT_MONTH = String(TODAY.getMonth() + 1).padStart(2, "0");

import dashboardActivityBreakdown from "@/data/dashboard/activitySummary.json";

// ---- DATA LAYER ----
// Imported directly since data now lives under src/ (not browser-
// fetchable). Kept as `async function` so the .then()/.catch() loading
// logic elsewhere in this component doesn't need to change. Swap for a
// real fetch() call once the backend endpoint exists.
async function fetchActivityBreakdown(month) {
  const match = dashboardActivityBreakdown.find((entry) => entry.month === month);

  if (match) {
    return match;
  }

  // No entry for this month in the payload — treat the same as the
  // zero-data case rather than erroring, since "no activities yet" is a
  // normal, expected state (not a failure).
  return {
    month,
    internal: { label: "កម្មវិធីខាងក្នុង", count: 0 },
    external: { label: "កម្មវិធីខាងក្រៅ", count: 0 },
  };
}
// --------------------------------------------------------------------

const COLORS = {
  internal: "#5B6FE8",
  external: "#3FC97A",
};

const GRADIENT_IDS = {
  internal: "activityInternalGradient",
  external: "activityExternalGradient",
};

// Donut pixel size — bumped up from 115 to fill the taller card.
const DONUT_SIZE = 190;
const DONUT_INNER_RADIUS = 58;
const DONUT_OUTER_RADIUS = 92;

function MonthDropdown({ value, onChange }) {
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          appearance: "none",
          WebkitAppearance: "none",
          background: "#F7F8FA",
          border: "1px solid #E7E9EE",
          borderRadius: 8,
          padding: "6px 30px 6px 12px",
          fontSize: 13,
          color: "#4A4F59",
          fontFamily: "inherit",
          cursor: "pointer",
          outline: "none",
        }}
      >
        {MONTHS_KM.map((m) => (
          <option key={m.value} value={`${CURRENT_YEAR}-${m.value}`}>
            {m.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        color="#8A8F98"
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

function LegendRow({ color, label, count, isLoading }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 13, color: "#232629" }}>{label}</span>
      <span style={{ fontSize: 13, color: "#232629", marginLeft: 4 }}>ចំនួន</span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#232629",
          marginLeft: 2,
          minWidth: 28,
          opacity: isLoading ? 0.3 : 1,
          transition: "opacity 0.2s",
        }}
      >
        {count}
      </span>
    </div>
  );
}

export default function DonutChart() {
  const [month, setMonth] = useState(`${CURRENT_YEAR}-${CURRENT_MONTH}`);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback((selectedMonth) => {
    setIsLoading(true);
    setError(null);
    fetchActivityBreakdown(selectedMonth)
      .then((res) => {
        setData(res);
        setIsLoading(false);
      })
      .catch(() => {
        setError("មិនអាចទាញយកទិន្នន័យបានទេ");
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    loadData(month);
  }, [month, loadData]);

  const total = data ? data.internal.count + data.external.count : 0;

  const chartData = data
    ? [
        { name: data.internal.label, value: data.internal.count, key: "internal" },
        { name: data.external.label, value: data.external.count, key: "external" },
      ]
    : [
        { name: "internal", value: 1, key: "internal" },
        { name: "external", value: 1, key: "external" },
      ];

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 14,
        padding: "16px 18px",
        boxShadow: "0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)",
        width: "100%",
        height: "100%",
        minHeight: 340,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#232629" }}>
          សង្ខេបកម្មវិធី
        </h3>
        <MonthDropdown value={month} onChange={setMonth} />
      </div>

      {error ? (
        <div style={{ padding: "30px 0", textAlign: "center", color: "#B3261E", fontSize: 13 }}>
          {error}
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 32,
            flex: 1,
          }}
        >
          <div style={{ position: "relative", width: DONUT_SIZE, height: DONUT_SIZE, flexShrink: 0 }}>
            <PieChart width={DONUT_SIZE} height={DONUT_SIZE}>
              <defs>
                <linearGradient id={GRADIENT_IDS.internal} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6E7EEF" />
                  <stop offset="100%" stopColor="#4A57C7" />
                </linearGradient>
                <linearGradient id={GRADIENT_IDS.external} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#4ADB8C" />
                  <stop offset="100%" stopColor="#2FB77A" />
                </linearGradient>
              </defs>
              <Pie
                data={chartData}
                dataKey="value"
                innerRadius={DONUT_INNER_RADIUS}
                outerRadius={DONUT_OUTER_RADIUS}
                startAngle={90}
                endAngle={-270}
                stroke="none"
                cornerRadius={9}
                paddingAngle={3}
                isAnimationActive={!isLoading}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.key}
                    fill={isLoading ? "#EDEEF2" : `url(#${GRADIENT_IDS[entry.key]})`}
                    opacity={isLoading ? 0.6 : 1}
                  />
                ))}
              </Pie>
            </PieChart>
            {!isLoading && total === 0 && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  color: "#9AA0A8",
                  textAlign: "center",
                  padding: "0 24px",
                }}
              >
                មិនទាន់មានទិន្នន័យ
              </div>
            )}
          </div>

          <div style={{ flexShrink: 0 }}>
            <LegendRow
              color={COLORS.internal}
              label={data ? data.internal.label : "កម្មវិធីខាងក្នុង"}
              count={data ? data.internal.count : 0}
              isLoading={isLoading}
            />
            <LegendRow
              color={COLORS.external}
              label={data ? data.external.label : "កម្មវិធីខាងក្រៅ"}
              count={data ? data.external.count : 0}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ActivityBreakdownDonut
 * -----------------------
 * Renders the "សង្ខេបកម្មវិធី" (Program Summary) donut widget.
 *
 * Wired to match this API contract:
 *
 *   GET /dashboard/activities-breakdown?month=YYYY-MM
 *
 *   Response:
 *   {
 *     "month": "2026-07",
 *     "internal": { "label": "កម្មវិធីខាងក្នុង", "count": 280 },
 *     "external": { "label": "កម្មវិធីខាងក្រៅ", "count": 220 }
 *   }
 *
 * `fetchActivityBreakdown()` below is a MOCK standing in for the real
 * fetch call. Swap its internals for a real `fetch(...)` once the
 * backend endpoint exists — the component and its data shape don't
 * need to change at all.
 */