"use client";

import { ChevronDown } from "lucide-react";

function normalizeBranchOptions(branches = []) {
  if (!Array.isArray(branches)) {
    return [];
  }

  return branches.map((branch) => ({
    id:
      branch.id ??
      branch.branchId ??
      branch.branch_id,

    name:
      branch.nameKm ??
      branch.name_km ??
      branch.branchNameKm ??
      branch.branch_name_km ??
      branch.name ??
      branch.label ??
      "-",
  }));
}

function BranchDropdown({
  branches,
  value,
  onChange,
  disabled = false,
}) {
  return (
    <div className="relative">
      <select
        value={value ?? ""}
        onChange={(event) =>
          onChange?.(event.target.value)
        }
        disabled={disabled}
        className="
          appearance-none
          rounded-lg
          border
          border-[#E7E9EE]
          bg-white
          py-[7px]
          pl-[14px]
          pr-8
          text-[13px]
          text-[#4A4F59]
          outline-none
          transition
          hover:border-gray-300
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {branches.length === 0 ? (
          <option value="">
            មិនមានសាខា
          </option>
        ) : (
          branches.map((branch) => (
            <option
              key={branch.id}
              value={branch.id}
            >
              {branch.name}
            </option>
          ))
        )}
      </select>

      <ChevronDown
        size={14}
        className="
          pointer-events-none
          absolute
          right-3
          top-1/2
          -translate-y-1/2
          text-[#8A8F98]
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
        border:
          "1px solid #EEF0F3",
        borderRadius: 10,
        background: "#F7F8FA",
        padding: "12px 14px",
      }}
    >
      <span
        style={{
          color: "#6B7280",
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
            color: "#1F2329",
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
                ? "#22A35A"
                : "#D14343",
              fontSize: 11,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {isUp ? "↑" : "↓"}{" "}
            {Math.abs(
              growthNumber
            )}
            %
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
  /*
   * Expected backend response:
   *
   * {
   *   "period": "2026-07",
   *   "scope": {
   *     "branchId": 1,
   *     "branchNameKm": "...",
   *     "branchNameEn": "..."
   *   },
   *   "activities": {
   *     "value": 58,
   *     "changePercent": 8
   *   },
   *   "donations": {
   *     "amountKhr": 0,
   *     "amountUsd": 1200,
   *     "changePercentKhr": 0,
   *     "changePercentUsd": 23
   *   },
   *   "members": {
   *     "value": 86,
   *     "changePercent": 12
   *   }
   * }
   */

  const branchOptions =
    normalizeBranchOptions(
      branches
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
      label: "កម្មវិធីសរុប",
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
      label: "វិភាគទានសរុប",
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
      label: "សមាជិកថ្មី",
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

  const resolvedBranchId =
    selectedBranchId ??
    data?.scope?.branchId ??
    data?.scope?.branch_id ??
    "";

  return (
    <section
      className="app-card"
      style={{
        display: "flex",
        height: "100%",
        flexDirection: "column",
        boxSizing: "border-box",
        border:
          "1px solid #EEF0F3",
        borderRadius: 14,
        background: "#FFFFFF",
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
        <h3
          style={{
            margin: 0,
            color: "#232629",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          សមិទ្ធផលសរុបរបស់សាខា
        </h3>

        {showBranchDropdown && (
          <BranchDropdown
            branches={branchOptions}
            value={resolvedBranchId}
            onChange={
              onBranchChange
            }
            disabled={loading}
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