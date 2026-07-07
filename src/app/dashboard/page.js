import StatsGrid from "@/components/dashboard/statsGrid";
import ActivitySummaryChart from "@/components/dashboard/pieChart";
import ParticipationChart from "@/components/dashboard/lineChart";
import ActivityList from "@/components/dashboard/activityList";
import QuickActions from "@/components/dashboard/quickActions";
import PerformanceSummary from "@/components/dashboard/performanceSummary";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-5 p-6 bg-bg-page-gray min-h-screen">
      {/* 1. Summary cards */}
      <StatsGrid />

      {/* 2. Donut + trend chart — donut takes 1 share of width, trend chart takes 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ActivitySummaryChart />
        <div className="lg:col-span-2">
          <ParticipationChart />
        </div>
      </div>

      {/* 3. Recent activities, upcoming activities, quick actions + performance summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ActivityList type="recent" />
        <ActivityList type="upcoming" />
        <div className="flex flex-col gap-5">
          <QuickActions />
          <PerformanceSummary />
        </div>
      </div>
    </div>
  );
}