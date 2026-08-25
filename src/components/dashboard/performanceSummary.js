"use client";

import { ChevronDown } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

function normalizeBranchOptions(branches = [], label) {
  if (!Array.isArray(branches)) {
    return [];
  }

  return branches
    .map((branch) => ({
      id:
        branch.id ??
        branch.branchId ??
        branch.branch_id,

      name: label(branch, "-"),
    }))
    .filter(
      (branch) =>
        branch.id !== null &&
        branch.id !== undefined
    );
}

function BranchDropdown({
  branches,
  value,
  onChange,
  disabled = false,
}) {
  const { t } =
    useLanguage();

  return (
    <div className="relative">
      <select
        value={
          value == null
            ? "all"
            : String(value)
        }
        onChange={(event) => {
          const nextValue =
            event.target.value;

          onChange?.(
            nextValue === "all"
              ? "all"
              : Number(nextValue)
          );
        }}
        disabled={disabled}
        className="
          appearance-none
          rounded-lg
          border
          border-border
          bg-bg-page-white
          py-[7px]
          pl-[14px]
          pr-8
          text-[13px]
          text-text-secondary
          outline-none
          transition
          hover:border-border
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        <option value="all">
          {t("dashboard.allBranches")}
        </option>

        {branches.map((branch) => (
          <option
            key={branch.id}
            value={String(branch.id)}
          >
            {branch.name}
          </option>
        ))}
      </select>

      <ChevronDown
        size={14}
        className="
          pointer-events-none
          absolute
          right-3
          top-1/2
          -translate-y-1/2
          text-text-mute
        "
      />
    </div>
  );
}

function StatMiniCard({
  label,
  value,
  growth,
  loading,
}) {
  const growthNumber =
    Number(growth) || 0;

  const isUp =
    growthNumber >= 0;

  return (
    <div
      className="app-card"
      style={{
        display: "flex",
        height: "100%",
        flexDirection: "column",
        boxSizing: "border-box",
        border: "1px solid var(--color-border, #EEF0F3)",
        borderRadius: 10,
        background: "var(--color-bg-page-gray, #F7F8FA)",
        padding: "12px 14px",
      }}
    >
      <span
        style={{
          color: "var(--color-text-secondary, #6B7280)",
          fontSize: 12,
        }}
      >
        {label}
      </span>

      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            color: "var(--color-text-primary, #1F2329)",
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          {loading ? "···" : value}
        </span>

        {!loading && (
          <span
            style={{
              color: isUp
                ? "var(--color-success, #22A35A)"
                : "var(--color-error, #D14343)",
              fontSize: 11,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {isUp ? "↑" : "↓"}{" "}
            {Math.abs(growthNumber)}%
          </span>
        )}
      </div>
    </div>
  );
}

function formatDonationValue(
  donations
) {
  const amountUsd =
    Number(
      donations?.amountUsd ??
      donations?.amount_usd
    ) || 0;

  const amountKhr =
    Number(
      donations?.amountKhr ??
      donations?.amount_khr
    ) || 0;

  if (amountUsd > 0) {
    return `$${amountUsd.toLocaleString()}`;
  }

  return `${amountKhr.toLocaleString()}៛`;
}

export default function PerformanceSummary({
  data,
  branches = [],
  selectedBranchId,
  onBranchChange,
  loading = false,
  showBranchDropdown = true,
}) {
  const { t, label } =
    useLanguage();

  const branchOptions =
    normalizeBranchOptions(
      branches,
      label
    );

  const activities =
    data?.activities ?? {};

  const donations =
    data?.donations ?? {};

  const members =
    data?.members ?? {};

  const stats = [
    {
      key: "activities",
      label: t("dashboard.totalActivities"),

      value: (
        Number(
          activities?.value
        ) || 0
      ).toLocaleString(),

      growth:
        Number(
          activities?.changePercent
        ) || 0,
    },

    {
      key: "donations",
      label: t("dashboard.totalDonations"),

      value:
        formatDonationValue(
          donations
        ),

      growth:
        Number(
          donations?.changePercentUsd ??
          donations?.changePercentKhr
        ) || 0,
    },

    {
      key: "members",

      /*
       * Backend currently returns active members
       * counted up to the end of selected month,
       * not only newly joined members.
       */
      label: t("dashboard.totalMembers"),

      value: (
        Number(
          members?.value
        ) || 0
      ).toLocaleString(),

      growth:
        Number(
          members?.changePercent
        ) || 0,
    },
  ];

  /*
   * The parent controls the selected branch.
   *
   * null = all branches
   * number = one specific branch
   */
  const resolvedBranchId =
    selectedBranchId ??
    data?.scope?.branchId ??
    data?.scope?.branch_id ??
    null;

  const period =
    data?.period ?? "";

  return (
    <section
      className="app-card"
      style={{
        display: "flex",
        height: "100%",
        flexDirection: "column",
        boxSizing: "border-box",
        border: "1px solid var(--color-border, #EEF0F3)",
        borderRadius: 14,
        background: "var(--color-bg-page-white, #FFFFFF)",
        padding: "18px 20px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              color: "var(--color-text-primary, #232629)",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {t("dashboard.branchPerformance")}
          </h3>

          {period && (
            <span
              style={{
                display: "block",
                marginTop: 3,
                color: "var(--color-text-mute, #9CA3AF)",
                fontSize: 11,
              }}
            >
              {period}
            </span>
          )}
        </div>

        {showBranchDropdown && (
          <BranchDropdown
            branches={
              branchOptions
            }
            value={
              resolvedBranchId
            }
            onChange={
              onBranchChange
            }
            disabled={
              loading
            }
          />
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
          flex: 1,
          alignItems: "stretch",
          gap: 12,
        }}
      >
        {stats.map((item) => (
          <StatMiniCard
            key={item.key}
            label={item.label}
            value={item.value}
            growth={item.growth}
            loading={loading}
          />
        ))}
      </div>
    </section>
  );
}
