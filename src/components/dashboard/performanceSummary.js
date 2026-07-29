"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import dashboardData from "@/data/dashboard.json";
import branchesData from "@/data/branchRecords.json";

function normalizeBranches(branches) {
  return branches.map((branch) => ({
    id: String(branch.id),
    name:
      branch.nameKm ||
      branch.name ||
      branch.branchName ||
      "មិនមានឈ្មោះសាខា",
  }));
}

function normalizePerformanceStats(items = []) {
  return items.map((item) => {
    const key = item.key || "";

    const defaultLabels = {
      newMembers: "សមាជិកថ្មី",
      totalIncome: "ចំណូលសរុប",
      completedActivities: "កម្មវិធីបានបញ្ចប់",
    };

    let value = item.value ?? 0;

    if (item.valueUsd != null) {
      value = `${new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
      }).format(Number(item.valueUsd) || 0)}$`;
    }

    return {
      key: key || item.label,
      label:
        item.label ||
        defaultLabels[key] ||
        "មិនមានចំណងជើង",
      value,
      growth:
        item.growthPercent ??
        item.growth ??
        0,
    };
  });
}

// Temporary mock data loader.
// The current dashboard.json has one organization-level summary,
// not separate statistics for every branch.
async function fetchPerformanceStats() {
  return normalizePerformanceStats(
    dashboardData.performanceSummary || []
  );
}

function BranchDropdown({
  branches,
  value,
  onChange,
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="cursor-pointer appearance-none rounded-lg border border-[#E7E9EE] bg-white py-[7px] pl-[14px] pr-8 text-[13px] text-[#4A4F59] outline-none"
      >
        {branches.map((branch) => (
          <option
            key={branch.id}
            value={branch.id}
          >
            {branch.name}
          </option>
        ))}
      </select>

      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8F98]"
      />
    </div>
  );
}

function StatMiniCard({
  label,
  value,
  growth,
  isLoading,
}) {
  const growthNumber =
    Number(growth) || 0;

  const isUp = growthNumber >= 0;

  return (
    <div className="flex h-full flex-col rounded-[10px] border border-[#EEF0F3] bg-[#F7F8FA] px-[14px] py-3">
      <span className="text-xs text-[#6B7280]">
        {label}
      </span>

      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-1.5 gap-y-1">
        <span className="whitespace-nowrap text-base font-bold text-[#1F2329] sm:text-lg">
          {isLoading ? "···" : value}
        </span>

        {!isLoading && (
          <span
            className={`shrink-0 whitespace-nowrap text-[10px] font-semibold ${
              isUp
                ? "text-[#22A35A]"
                : "text-[#D14343]"
            }`}
          >
            {isUp ? "↑" : "↓"}{" "}
            {Math.abs(growthNumber)}%
          </span>
        )}
      </div>
    </div>
  );
}

export default function PerformanceSummary() {
  const branchOptions = useMemo(
    () => normalizeBranches(branchesData),
    []
  );

  const [selectedBranchId, setSelectedBranchId] =
    useState(
      branchOptions[0]?.id || ""
    );

  const [stats, setStats] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        setIsLoading(true);
        setError("");

        const result =
          await fetchPerformanceStats(
            selectedBranchId
          );

        if (!cancelled) {
          setStats(result);
        }
      } catch {
        if (!cancelled) {
          setError(
            "មិនអាចទាញយកទិន្នន័យបានទេ"
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      cancelled = true;
    };
  }, [selectedBranchId]);

  return (
    <div className="flex h-full flex-col rounded-[14px] border border-[#EEF0F3] bg-white px-5 py-[18px]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#232629]">
          សមិទ្ធផលសរុបរបស់សាខា
        </h3>

        {branchOptions.length > 0 && (
          <BranchDropdown
            branches={branchOptions}
            value={selectedBranchId}
            onChange={setSelectedBranchId}
          />
        )}
      </div>

      {error ? (
        <div className="py-4 text-center text-[13px] text-[#B3261E]">
          {error}
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-1 items-stretch gap-3 sm:grid-cols-3">
          {(isLoading
            ? [0, 1, 2]
            : stats
          ).map((item, index) =>
            isLoading ? (
              <StatMiniCard
                key={index}
                label=""
                value=""
                growth={0}
                isLoading
              />
            ) : (
              <StatMiniCard
                key={
                  item.key ||
                  item.label ||
                  index
                }
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
