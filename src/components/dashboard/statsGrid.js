"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FaBuilding,
  FaClipboardCheck,
  FaHandHoldingHeart,
  FaUsers,
} from "react-icons/fa6";
import dashboardSummary from "@/data/dashboard/cardSummary.json";

// ---- DATA LAYER ----
async function fetchDashboardSummary() {
  if (!dashboardSummary) {
    throw new Error("No summary data found");
  }
  return dashboardSummary;
}
// --------------------------------------------------------------------

const CARD_CONFIG = [
  {
    key: "total_members",
    label: "សមាជិកសរុប",
    icon: FaUsers,
    accent: "bg-secondary-hover",
    iconBg: "bg-secondary-light",
    iconColor: "text-secondary-hover",
    format: (v) => v.toLocaleString(),
  },
  {
    key: "total_branches",
    label: "សាខាសរុប",
    icon: FaBuilding,
    accent: "bg-primary",
    iconBg: "bg-primary-light",
    iconColor: "text-primary",
    format: (v) => v.toLocaleString(),
  },
  {
    key: "total_activities",
    label: "កម្មវិធីសរុប",
    icon: FaClipboardCheck,
    accent: "bg-success",
    iconBg: "bg-success-bg",
    iconColor: "text-success",
    format: (v) => v.toLocaleString(),
  },
  {
    key: "total_donations",
    label: "វិភាគទានសរុប",
    icon: FaHandHoldingHeart,
    accent: "bg-warning",
    iconBg: "bg-warning-bg",
    iconColor: "text-warning",
    format: (v) => `${v.usd.value.toLocaleString()}$`,
    getChange: (v) => v.usd.change_percent,
  },
];

function SkeletonCard() {
  return (
    <div className="bg-bg-page-white border border-border rounded-xl overflow-hidden animate-pulse">
      <div className="h-[3px] w-full bg-bg-page-gray" />
      <div className="flex items-center gap-3 p-4">
        <div className="w-12 h-12 rounded-xl bg-bg-page-gray shrink-0" />
        <div className="flex-1">
          <div className="w-[60%] h-2.5 rounded bg-bg-page-gray mb-2.5" />
          <div className="w-[35%] h-5 rounded bg-bg-page-gray" />
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, icon: Icon, accent, iconBg, iconColor, value, changePercent }) {
  const isUp = changePercent >= 0;

  return (
    <div className="app-card relative bg-bg-page-white border border-border rounded-xl overflow-hidden">
      {/* Thin full-width accent bar across the top edge */}
      <div className={`h-[3px] w-full ${accent}`} />

      <div className="flex items-center gap-3 p-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm text-text-primary mb-0.5">{label}</div>
          <div className="text-lg font-bold text-text-primary">{value}</div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <div
            className={`flex items-center gap-1 text-sm font-semibold ${
              isUp ? "text-success" : "text-error"
            }`}
          >
            <span>{isUp ? "↑" : "↓"}</span>
            <span>{Math.abs(changePercent)}%</span>
          </div>
          <span className="text-xs text-text-mute">ក្នុងខែនេះ</span>
        </div>
      </div>
    </div>
  );
}

export default function StatsGrid() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(() => {
    setIsLoading(true);
    setError(null);
    fetchDashboardSummary()
      .then((res) => {
        setSummary(res);
        setIsLoading(false);
      })
      .catch(() => {
        setError("មិនអាចទាញយកទិន្នន័យបានទេ");
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (error) {
    return (
      <div className="py-5 text-center text-error text-[13px]">{error}</div>
    );
  }

  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {CARD_CONFIG.map((cfg) => {
        const stat = summary[cfg.key];
        const value = cfg.format(stat.value !== undefined ? stat.value : stat);
        const changePercent = cfg.getChange ? cfg.getChange(stat) : stat.change_percent;

        return (
          <SummaryCard
            key={cfg.key}
            label={cfg.label}
            icon={cfg.icon}
            accent={cfg.accent}
            iconBg={cfg.iconBg}
            iconColor={cfg.iconColor}
            value={value}
            changePercent={changePercent}
          />
        );
      })}
    </div>
  );
}

/**
 * SummaryCards
 * -------------
 * Renders the four top summary cards: members, branches, activities,
 * donations (USD only — see note in earlier conversation about why KHR
 * isn't a currency-converted 5th card, but a genuinely separate total
 * if/when the org tracks it).
 *
 * Colors are pulled from the app's Tailwind v4 theme tokens defined in
 * app/globals.css (@theme block) instead of hardcoded hex values, so the
 * cards automatically follow the design system (and dark mode overrides).
 *
 * Wired to match this API contract:
 *
 *   GET /dashboard/summary
 *
 *   Response:
 *   {
 *     "total_members":    { "value": 250,  "change_percent": 12 },
 *     "total_branches":   { "value": 2,    "change_percent": 12 },
 *     "total_activities": { "value": 180,  "change_percent": 12 },
 *     "total_donations": {
 *       "usd": { "value": 2500, "change_percent": 12 }
 *     }
 *   }
 */
