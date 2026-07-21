"use client";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import data from "@/data/donation/activitySummary.json";

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

// Legend dot colors (solid).
const COLORS = {
  internal: "#4B5FD9",
  external: "#22C55E",
};

// Gradient stops for the donut slices — subtle vertical gradient,
// dark at top fading to a lighter tint at the bottom, per reference image.
const GRADIENT_IDS = {
  internal: "activityInternalGradient",
  external: "activityExternalGradient",
};
const GRADIENT_STOPS = {
  internal: { from: "#3B4FC7", to: "#A5B4E8" },
  external: { from: "#22C55E", to: "#6EE0A0" },
};

// Donut pixel size — kept large to fill the taller card.
const DONUT_SIZE = 190;
const DONUT_INNER_RADIUS = 60;
const DONUT_OUTER_RADIUS = 90;


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
