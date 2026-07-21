"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import data from "@/data/donation/participationSummary.json";

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

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E7E9EE",
        borderRadius: 8,
        padding: "8px 12px",
        boxShadow: "0 2px 8px rgba(16,24,40,0.08)",
        fontSize: 12,
      }}
    >
      <div style={{ color: "#9AA0A8", marginBottom: 2 }}>{label}</div>
      <div style={{ color: "#232629", fontWeight: 600 }}>
        {payload[0].value.toLocaleString()} នាក់
      </div>
    </div>
  );
}
