"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown } from "lucide-react";

const MONTHS_KM_SHORT = [
  "ខែមករា", "ខែកុម្ភៈ", "ខែមីនា", "ខែមេសា", "ខែឧសភា", "ខែមិថុនា",
  "ខែកក្កដា", "ខែសីហា", "ខែកញ្ញា", "ខែតុលា", "ខែវិច្ឆិកា", "ខែធ្នូ",
];

const TODAY = new Date();
const CURRENT_CALENDAR_YEAR = TODAY.getFullYear();

// School-year style options, e.g. "2024-2025", "2025-2026", "2026-2027".
// Static for now per our earlier call — revisit with an
// /dashboard/available-years endpoint if empty years become confusing.
const YEAR_OPTIONS = [-2, -1, 0].map((offset) => {
  const start = CURRENT_CALENDAR_YEAR + offset;
  return `${start}-${start + 1}`;
});
const DEFAULT_YEAR = YEAR_OPTIONS[YEAR_OPTIONS.length - 1];

import dashboardParticipationTrend from "@/data/dashboard/participationSummary.json";

// ---- DATA LAYER ----
// Imported directly since data now lives under src/ (not browser-
// fetchable). Kept as `async function` so downstream loading logic
// doesn't need to change. Swap for a real fetch() call once the
// backend endpoint exists.
async function fetchParticipationTrend(year) {
  const match = dashboardParticipationTrend.find((entry) => entry.year === year);

  if (match) {
    return match;
  }

  // No recorded data for this year yet — same "empty, not an error" rule
  // as the donut widget.
  return {
    year,
    data: MONTHS_KM_SHORT.map((month) => ({ month, participant_count: 0 })),
  };
}
// --------------------------------------------------------------------

const LINE_COLOR = "#7B6EF6";

function YearDropdown({ value, onChange }) {
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
        {YEAR_OPTIONS.map((y) => (
          <option key={y} value={y}>
            {y}
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

export default function ParticipationChart() {
  const [year, setYear] = useState(DEFAULT_YEAR);
  const [chartData, setChartData] = useState(
    MONTHS_KM_SHORT.map((month) => ({ month, participant_count: 0 }))
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback((selectedYear) => {
    setIsLoading(true);
    setError(null);
    fetchParticipationTrend(selectedYear)
      .then((res) => {
        setChartData(res.data);
        setIsLoading(false);
      })
      .catch(() => {
        setError("មិនអាចទាញយកទិន្នន័យបានទេ");
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    loadData(year);
  }, [year, loadData]);

  const hasAnyData = chartData.some((d) => d.participant_count > 0);

  return (
    <div
      style={{
        // Centers the card horizontally within whatever parent width
        // it's given (e.g. a full-width dashboard column or page body).
        // Remove maxWidth/margin if this is placed inside a fixed-width
        // grid cell where centering isn't needed.
        maxWidth: 600,
        margin: "0 auto",
        background: "#FFFFFF",
        borderRadius: 14,
        padding: "16px 18px",
        boxShadow: "0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)",
        width: "100%",
        height: "100%",
        minHeight: 240,
        boxSizing: "border-box",
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
          ការចូលរួមប្រចាំខែ
        </h3>
        <YearDropdown value={year} onChange={setYear} />
      </div>

      {error ? (
        <div style={{ padding: "30px 0", textAlign: "center", color: "#B3261E", fontSize: 13 }}>
          {error}
        </div>
      ) : (
        <div style={{ position: "relative", height: 210, paddingBottom: 8 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 12 }}>
              <CartesianGrid stroke="#F3F4F6" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: "#9AA0A8" }}
                axisLine={false}
                tickLine={false}
                interval={0}
                tickFormatter={(m) => m.replace("ខែ", "")}
                tickMargin={4}
                padding={{ left: 16, right: 16 }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9AA0A8" }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Area
                type="monotone"
                dataKey="participant_count"
                stroke={isLoading ? "#E4E5EA" : LINE_COLOR}
                strokeWidth={1.8}
                strokeLinecap="round"
                fill="none"
                dot={false}
                activeDot={{ r: 4, fill: LINE_COLOR, strokeWidth: 0 }}
                isAnimationActive={!isLoading}
              />
            </AreaChart>
          </ResponsiveContainer>

          {!isLoading && !hasAnyData && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                color: "#9AA0A8",
                background: "rgba(255,255,255,0.6)",
              }}
            >
              មិនទាន់មានទិន្នន័យសម្រាប់ឆ្នាំនេះ
            </div>
          )}
        </div>
      )}
    </div>
  );
}


/**
 * ParticipationTrendLine
 * -----------------------
 * Renders the "ការចូលរួមប្រចាំខែ" (monthly participation trend) line chart.
 *
 * Wired to match this API contract:
 *
 *   GET /dashboard/participation-trend?year=2025-2026
 *
 *   Response:
 *   {
 *     "year": "2025-2026",
 *     "data": [
 *       { "month": "មករា", "participant_count": 78 },
 *       { "month": "កុម្ភៈ", "participant_count": 52 },
 *       ...
 *     ]
 *   }
 *
 * Data source: same static data/dashboard.json file as the donut widget,
 * under a "participationTrend" key (array of { year, data }). Swap
 * DASHBOARD_DATA_URL for the real API base once backend ships it — the
 * lookup-by-year logic doesn't need to change.
 */