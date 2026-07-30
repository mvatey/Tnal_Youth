"use client";

import { useCallback, useEffect, useState } from "react";

import StatsGrid from "@/components/dashboard/statsGrid";
import ActivitySummaryChart from "@/components/dashboard/pieChart";
import ParticipationChart from "@/components/dashboard/lineChart";
import {
  RecentActivities,
  UpcomingActivities,
} from "@/components/dashboard/activityList";
import QuickActions from "@/components/dashboard/quickActions";
import PerformanceSummary from "@/components/dashboard/performanceSummary";

function getCurrentMonth() {
  const today = new Date();

  return `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;
}

async function parseJsonSafely(response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
}

export default function DashboardPage() {
  const [selectedMonth, setSelectedMonth] =
    useState(getCurrentMonth);

  const [selectedYear, setSelectedYear] =
    useState(() => new Date().getFullYear());

  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        month: selectedMonth,
        year: String(selectedYear),
      });

      const response = await fetch(
        `/api/dashboard?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const result =
        await parseJsonSafely(response);

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "មិនអាចទាញយកទិន្នន័យបានទេ"
        );
      }

      setDashboard(result);
    } catch (fetchError) {
      console.error(
        "Dashboard fetch error:",
        fetchError
      );

      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "មិនអាចទាញយកទិន្នន័យបានទេ"
      );
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  function handleMonthChange(month) {
    setSelectedMonth(month);

    const yearFromMonth =
      Number(month.slice(0, 4));

    setSelectedYear(yearFromMonth);
  }

  if (loading && !dashboard) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-sm text-gray-500">
        កំពុងទាញយកទិន្នន័យ...
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <p className="text-sm text-red-700">
          {error}
        </p>

        <button
          type="button"
          onClick={loadDashboard}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-white"
        >
          ព្យាយាមម្តងទៀត
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <StatsGrid
        data={dashboard?.summary}
        loading={loading}
      />

      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
        <ActivitySummaryChart
          data={dashboard?.activityBreakdown}
          month={selectedMonth}
          onMonthChange={handleMonthChange}
          loading={loading}
        />

        <ParticipationChart
          data={dashboard?.participationTrend}
          year={selectedYear}
          onYearChange={setSelectedYear}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
        <RecentActivities
          activities={
            dashboard?.activities
              ?.recentCompleted ?? []
          }
          loading={loading}
        />

        <UpcomingActivities
          activities={
            dashboard?.activities
              ?.upcoming ?? []
          }
          loading={loading}
        />

        <div className="flex h-full flex-col gap-4">
          <div className="flex-1">
            <QuickActions />
          </div>

          <div className="flex-1">
            <PerformanceSummary
              data={
                dashboard?.branchPerformance
              }
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}