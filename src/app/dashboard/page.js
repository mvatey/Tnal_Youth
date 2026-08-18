"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import StatsGrid from "@/components/dashboard/statsGrid";
import ActivitySummaryChart from "@/components/dashboard/pieChart";
import ParticipationChart from "@/components/dashboard/lineChart";

import {
  RecentActivities,
  UpcomingActivities,
} from "@/components/dashboard/activityList";

import QuickActions from "@/components/dashboard/quickActions";
import PerformanceSummary from "@/components/dashboard/performanceSummary";

import { useBranch } from "@/context/BranchContext";
import useCurrentMember from "@/hooks/useCurrentMember";

function getCurrentMonth() {
  const today = new Date();

  return `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;
}

async function parseJsonSafely(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
}

export default function DashboardPage() {
  const {
    branches,
    selectedBranch,
  } = useBranch();

  const { member: currentMember } = useCurrentMember();

  // A secretary/branch_leader is always scoped to exactly one branch (see
  // BranchContext) -- their Performance Summary card has no separate
  // branch to pick, so it always mirrors the same single branch the rest
  // of the dashboard is scoped to, with its own dropdown hidden. ADMIN
  // (and anyone else) keeps the independent picker below, unaffected by
  // the sidebar's global branch selection.
  const isBranchScoped =
    currentMember?.role === "secretary" ||
    currentMember?.role === "branch_leader";

  // The summary cards' branch card shows this branch's own name instead
  // of an org-wide count/percentage for a branch-scoped role (see
  // StatsGrid) -- looked up from the same accessible-branches list the
  // sidebar's dropdown uses, matched against the one branch currently
  // active.
  const currentBranchName = useMemo(() => {
    if (!isBranchScoped) return "";

    const match = branches.find(
      (branch) => String(branch.id) === String(selectedBranch)
    );

    return match?.nameKm || match?.nameEn || "";
  }, [isBranchScoped, branches, selectedBranch]);

  /*
   * This branch is ONLY for the Performance Summary card.
   *
   * It must not filter the whole dashboard.
   */
  const [
    performanceBranch,
    setPerformanceBranch,
  ] = useState("all");

  const effectivePerformanceBranch = isBranchScoped
    ? selectedBranch
    : performanceBranch;

  const [
    selectedMonth,
    setSelectedMonth,
  ] = useState(getCurrentMonth);

  const [
    selectedYear,
    setSelectedYear,
  ] = useState(
    () => new Date().getFullYear()
  );

  const [
    dashboard,
    setDashboard,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /*
   * =========================================================
   * LOAD DASHBOARD
   * =========================================================
   *
   * The main dashboard remains:
   *
   * ADMIN:
   * → organization-wide
   *
   * SECRETARY / BRANCH_LEADER:
   * → backend resolves accessible branch scope
   *
   * Performance Summary:
   * → optional performanceBranchId only affects
   *   branchPerformance in the Next.js proxy
   */
  const loadDashboard =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const params =
          new URLSearchParams({
            month: selectedMonth,
            year: String(
              selectedYear
            ),
          });

        /*
         * The sidebar's global branch selector scopes the whole
         * dashboard (summary cards, charts, activity lists).
         *
         * performanceBranchId is a SEPARATE, independent selector
         * that only scopes the Performance Summary card and must
         * keep being handled on its own below.
         */
        if (
          selectedBranch !== "all" &&
          selectedBranch != null
        ) {
          params.set(
            "branchId",
            String(
              selectedBranch
            )
          );
        }

        if (
          effectivePerformanceBranch !== "all" &&
          effectivePerformanceBranch != null
        ) {
          params.set(
            "performanceBranchId",
            String(
              effectivePerformanceBranch
            )
          );
        }

        const response =
          await fetch(
            `/api/dashboard?${params.toString()}`,
            {
              method: "GET",
              credentials: "include",
              cache: "no-store",
            }
          );

        const result =
          await parseJsonSafely(
            response
          );

        if (!response.ok) {
          throw new Error(
            result?.message ||
            "មិនអាចទាញយកទិន្នន័យបានទេ"
          );
        }

        setDashboard(
          result
        );

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
    }, [
      selectedMonth,
      selectedYear,
      selectedBranch,
      effectivePerformanceBranch,
    ]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  function handleMonthChange(
    month
  ) {
    setSelectedMonth(
      month
    );

    const yearFromMonth =
      Number(
        month.slice(
          0,
          4
        )
      );

    setSelectedYear(
      yearFromMonth
    );
  }

  /*
   * =========================================================
   * LOADING STATE
   * =========================================================
   */
  if (
    loading &&
    !dashboard
  ) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-sm text-text-mute">
        កំពុងទាញយកទិន្នន័យ...
      </div>
    );
  }

  /*
   * =========================================================
   * ERROR STATE
   * =========================================================
   */
  if (
    error &&
    !dashboard
  ) {
    return (
      <div className="rounded-xl border border-error/30 bg-error-bg p-5">

        <p className="text-sm text-error">
          {error}
        </p>

        <button
          type="button"
          onClick={
            loadDashboard
          }
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-white"
        >
          ព្យាយាមម្តងទៀត
        </button>

      </div>
    );
  }

  /*
   * =========================================================
   * PAGE
   * =========================================================
   */
  return (
    <div className="flex flex-col gap-4">

      {error && (
        <div className="rounded-xl border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* ===============================
          SUMMARY CARDS
      =============================== */}
      <StatsGrid
        data={
          dashboard?.summary
        }
        loading={
          loading
        }
        isBranchScoped={
          isBranchScoped
        }
        branchName={
          currentBranchName
        }
      />


      {/* ===============================
          CHARTS
      =============================== */}
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">

        <ActivitySummaryChart
          data={
            dashboard
              ?.activityBreakdown
          }
          month={
            selectedMonth
          }
          onMonthChange={
            handleMonthChange
          }
          loading={
            loading
          }
        />

        <ParticipationChart
          data={
            dashboard
              ?.participationTrend
          }
          year={
            selectedYear
          }
          onYearChange={
            setSelectedYear
          }
          loading={
            loading
          }
        />

      </div>


      {/* ===============================
          ACTIVITIES + QUICK ACTIONS
          + PERFORMANCE
      =============================== */}
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">

        <RecentActivities
          activities={
            dashboard
              ?.activities
              ?.recentCompleted ??
            []
          }
          loading={
            loading
          }
        />

        <UpcomingActivities
          activities={
            dashboard
              ?.activities
              ?.upcoming ??
            []
          }
          loading={
            loading
          }
        />

        <div className="flex h-full flex-col gap-4">

          <div className="flex-1">
            <QuickActions />
          </div>

          <div className="flex-1">
            <PerformanceSummary
              data={
                dashboard
                  ?.branchPerformance
              }
              branches={
                branches
              }
              selectedBranchId={
                effectivePerformanceBranch ===
                "all"
                  ? null
                  : effectivePerformanceBranch
              }
              onBranchChange={
                setPerformanceBranch
              }
              loading={
                loading
              }
              showBranchDropdown={
                !isBranchScoped
              }
            />
          </div>

        </div>

      </div>

    </div>
  );
}