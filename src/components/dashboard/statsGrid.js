"use client";

import {
  FaBuilding,
  FaClipboardCheck,
  FaHandHoldingHeart,
  FaUsers,
} from "react-icons/fa6";

const CARD_CONFIG = [
  {
    key: "members",
    label: "សមាជិកសរុប",
    icon: FaUsers,
    accent: "bg-secondary-hover",
    iconBg: "bg-secondary-light",
    iconColor: "text-secondary-hover",
  },
  {
    key: "branches",
    label: "សាខាសរុប",
    icon: FaBuilding,
    accent: "bg-primary",
    iconBg: "bg-primary-light",
    iconColor: "text-primary",
  },
  {
    key: "activities",
    label: "កម្មវិធីសរុប",
    icon: FaClipboardCheck,
    accent: "bg-success",
    iconBg: "bg-success-bg",
    iconColor: "text-success",
  },
  {
    key: "donations",
    label: "វិភាគទានសរុប",
    icon: FaHandHoldingHeart,
    accent: "bg-warning",
    iconBg: "bg-warning-bg",
    iconColor: "text-warning",
  },
];

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-border bg-bg-page-white">
      <div className="h-[3px] w-full bg-bg-page-gray" />

      <div className="flex items-center gap-3 p-4">
        <div className="h-12 w-12 shrink-0 rounded-xl bg-bg-page-gray" />

        <div className="flex-1">
          <div className="mb-2.5 h-2.5 w-[60%] rounded bg-bg-page-gray" />
          <div className="h-5 w-[35%] rounded bg-bg-page-gray" />
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  icon: Icon,
  accent,
  iconBg,
  iconColor,
  value,
  changePercent,
}) {
  const normalizedChange =
    Number(changePercent) || 0;

  const isUp =
    normalizedChange >= 0;

  return (
    <div className="app-card relative overflow-hidden rounded-xl border border-border bg-bg-page-white">
      <div
        className={`h-[3px] w-full ${accent}`}
      />

      <div className="flex items-center gap-3 p-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon
            className={`h-5 w-5 ${iconColor}`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-0.5 text-sm text-text-primary">
            {label}
          </div>

          <div className="text-lg font-bold text-text-primary">
            {value}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <div
            className={`flex items-center gap-1 text-sm font-semibold ${
              isUp
                ? "text-success"
                : "text-error"
            }`}
          >
            <span>
              {isUp ? "↑" : "↓"}
            </span>

            <span>
              {Math.abs(normalizedChange)}%
            </span>
          </div>

          <span className="text-xs text-text-mute">
            ក្នុងខែនេះ
          </span>
        </div>
      </div>
    </div>
  );
}

function formatCardValue(key, stat) {
  if (key === "donations") {
    const usd =
      Number(stat?.amountUsd) || 0;

    return `${usd.toLocaleString()}$`;
  }

  return (
    Number(stat?.value) || 0
  ).toLocaleString();
}

function getChangePercent(key, stat) {
  if (key === "donations") {
    return (
      Number(
        stat?.changePercentUsd
      ) || 0
    );
  }

  return (
    Number(stat?.changePercent) || 0
  );
}

export default function StatsGrid({
  data,
  loading = false,
}) {
  const summary =
    data?.summary ?? {};

  if (loading && !data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <SkeletonCard key={item} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CARD_CONFIG.map((config) => {
        const stat =
          summary[config.key] ?? {};

        return (
          <SummaryCard
            key={config.key}
            label={config.label}
            icon={config.icon}
            accent={config.accent}
            iconBg={config.iconBg}
            iconColor={config.iconColor}
            value={formatCardValue(
              config.key,
              stat
            )}
            changePercent={getChangePercent(
              config.key,
              stat
            )}
          />
        );
      })}
    </div>
  );
}