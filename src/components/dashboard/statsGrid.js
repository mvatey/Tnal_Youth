"use client";

import {
  FaBuilding,
  FaClipboardCheck,
  FaHandHoldingHeart,
  FaUsers,
} from "react-icons/fa6";

import { useLanguage } from "@/context/LanguageContext";

const CARD_CONFIG = [
  {
    key: "branches",
    label: "សាខាសរុប",
    labelKey: "dashboard.totalBranches",
    // Shown instead of the label above when this card is scoped to a
    // single branch (see isBranchScoped below) -- "Total branches" reads
    // oddly once the value itself is one branch's name, not a count.
    scopedLabel: "សាខា",
    scopedLabelKey: "dashboard.branch",
    icon: FaBuilding,
    accent: "bg-primary",
    iconBg: "bg-primary-light",
    iconColor: "text-primary",
  },
  {
    key: "members",
    label: "សមាជិកសរុប",
    labelKey: "dashboard.totalMembers",
    icon: FaUsers,
    accent: "bg-secondary-hover",
    iconBg: "bg-secondary-light",
    iconColor: "text-secondary-hover",
  },
  {
    key: "activities",
    label: "កម្មវិធីសរុប",
    labelKey: "dashboard.totalActivities",
    icon: FaClipboardCheck,
    accent: "bg-success",
    iconBg: "bg-success-bg",
    iconColor: "text-success",
  },
  {
    key: "donations",
    label: "វិភាគទានសរុប",
    labelKey: "dashboard.totalDonations",
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
  // Hidden for the branch card once it's scoped to a single branch (see
  // isBranchScoped in StatsGrid below) -- a growth percentage / "this
  // month" comparison doesn't mean anything for a branch's own name.
  showGrowth = true,
}) {
  const { t } =
    useLanguage();

  const normalizedChange =
    Number(changePercent) || 0;

  const isUp =
    normalizedChange >= 0;

  return (
    <div className="app-card relative min-w-0 overflow-hidden rounded-xl border border-border bg-bg-page-white">
      <div
        className={`h-[3px] w-full ${accent}`}
      />

      <div className="flex min-w-0 flex-wrap items-center gap-3 p-4 sm:flex-nowrap">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon
            className={`h-5 w-5 ${iconColor}`}
          />
        </div>

        <div className="min-w-0 flex-1 basis-[120px]">
          <div className="mb-0.5 text-sm text-text-primary">
            {label}
          </div>

          <div className="truncate text-lg font-bold text-text-primary sm:text-xl">
            {value}
          </div>
        </div>

        {showGrowth && (
          <div className="hidden min-w-0 shrink-0 flex-col items-end gap-1 sm:flex">
            <div
              className={`flex min-w-0 items-center gap-1 text-xs font-semibold sm:text-sm ${
                isUp
                  ? "text-success"
                  : "text-error"
              }`}
            >
              <span>
                {isUp ? "↑" : "↓"}
              </span>

              <span className="max-w-[110px] truncate sm:max-w-[92px]">
                {Math.abs(normalizedChange)}%
              </span>
            </div>

            <span className="text-xs text-text-mute">
              {t("dashboard.thisMonth")}
            </span>
          </div>
        )}
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
  // A secretary/branch_leader is always scoped to exactly one branch (see
  // dashboard/page.js) -- for them the branch card shows that branch's
  // own name instead of a count, with no growth/"this month" comparison.
  // ADMIN (isBranchScoped false) keeps the org-wide branch count as-is.
  isBranchScoped = false,
  branchName = "",
}) {
  const { t } =
    useLanguage();

  const summary =
    data?.summary ?? {};

  if (loading && !data) {
    return (
      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <SkeletonCard key={item} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CARD_CONFIG.map((config) => {
        const stat =
          summary[config.key] ?? {};

        const isScopedBranchCard =
          config.key === "branches" && isBranchScoped;

        return (
          <SummaryCard
            key={config.key}
            label={
              isScopedBranchCard
                ? t(
                    config.scopedLabelKey,
                    config.scopedLabel ?? config.label
                  )
                : t(config.labelKey, config.label)
            }
            icon={config.icon}
            accent={config.accent}
            iconBg={config.iconBg}
            iconColor={config.iconColor}
            value={
              isScopedBranchCard
                ? branchName || "-"
                : formatCardValue(
                    config.key,
                    stat
                  )
            }
            changePercent={getChangePercent(
              config.key,
              stat
            )}
            showGrowth={!isScopedBranchCard}
          />
        );
      })}
    </div>
  );
}
