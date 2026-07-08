"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import branchStats from "@/data/dashboard/branchPerformance.json";

// Placeholder until real per-branch data exists — see note above.
const PLACEHOLDER_BRANCHES = [{ id: "default", name: "សាខាក្រុងភ្នំពេញ" }];

// ---- DATA LAYER ----
async function fetchPerformanceStats() {
  return branchStats ?? [];
}
// --------------------------------------------------------------------

function BranchDropdown({ branches, value, onChange }) {
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        style={{
          appearance: "none",
          WebkitAppearance: "none",
          background: "#FFFFFF",
          border: "1px solid #E7E9EE",
          borderRadius: 8,
          padding: "7px 32px 7px 14px",
          fontSize: 13,
          color: "#4A4F59",
          fontFamily: "inherit",
          cursor: "pointer",
          outline: "none",
        }}
      >
        {branches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        color="#8A8F98"
        style={{
          position: "absolute",
          right: 12,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

function StatMiniCard({ label, value, growth, isLoading }) {
  const growthNum = Number(growth);
  const isUp = growthNum >= 0;

  return (
    <div
      style={{
        background: "#F7F8FA",
        border: "1px solid #EEF0F3",
        borderRadius: 10,
        padding: "12px 14px",
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <span style={{ fontSize: 12, color: "#6B7280" }}>{label}</span>

      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: "#1F2329" }}>
          {isLoading ? "···" : value}
        </span>
        {!isLoading && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: isUp ? "#22A35A" : "#D14343",
              whiteSpace: "nowrap",
            }}
          >
            {isUp ? "↑" : "↓"} {Math.abs(growthNum)}%
          </span>
        )}
      </div>
    </div>
  );
}

export default function PerformanceSummary() {
  const [selectedBranchId, setSelectedBranchId] = useState(PLACEHOLDER_BRANCHES[0].id);
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPerformanceStats()
      .then((res) => {
        setStats(res);
        setIsLoading(false);
      })
      .catch(() => {
        setError("មិនអាចទាញយកទិន្នន័យបានទេ");
        setIsLoading(false);
      });
  }, []);

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #EEF0F3",
        borderRadius: 14,
        padding: "18px 20px",
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: 600, color: "#232629" }}>
          សមិទ្ធផលសរុបរបស់សាខា
        </h3>
        <BranchDropdown
          branches={PLACEHOLDER_BRANCHES}
          value={selectedBranchId}
          onChange={setSelectedBranchId}
        />
      </div>

      {error ? (
        <div style={{ padding: "16px 0", textAlign: "center", color: "#B3261E", fontSize: 13 }}>
          {error}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, flex: 1, alignItems: "stretch" }}>
          {(isLoading ? [0, 1, 2] : stats).map((item, i) =>
            isLoading ? (
              <StatMiniCard key={i} label="" value="" growth="0" isLoading />
            ) : (
              <StatMiniCard
                key={item.label}
                label={item.label}
                value={item.value}
                growth={item.growth}
                isLoading={false}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}



/**
 * PerformanceSummary
 * --------------------
 * Renders "សម្ថភពលសរុបរបស់សាខា" (branch performance summary) — a branch
 * dropdown plus three mini stat cards.
 *
 * ⚠️ IMPORTANT — CURRENT LIMITATION:
 * branch-performance.json is currently a flat array of 3 stats with NO
 * per-branch data (no branch_id, branch_name, or grouping at all):
 *
 *   [
 *     { "label": "កម្មវិធីសរុប",       "value": "58",   "growth": "8" },
 *     { "label": "វិភាគទានសរុប",       "value": "$1200", "growth": "23" },
 *     { "label": "អ្នកចូលរួមថ្មីបន្ថែម", "value": "86",   "growth": "12" }
 *   ]
 *
 * That means: the dropdown below currently shows a single hardcoded
 * placeholder branch and CANNOT actually switch between real branches'
 * data yet, because there's nothing in this file to switch to. This is
 * a stopgap, not the final behavior — once backend provides real
 * per-branch data (e.g. a "branches" array, each with its own stats),
 * this component needs its dropdown wired back to that, similar to how
 * the month/year dropdowns select from already-loaded data elsewhere in
 * this dashboard.
 */