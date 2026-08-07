import StatsGrid from "@/components/dashboard/statsGrid";
import ActivitySummaryChart from "@/components/dashboard/pieChart";
import ParticipationChart from "@/components/dashboard/lineChart";
import { RecentActivities, UpcomingActivities } from "@/components/dashboard/activityList";
import QuickActions from "@/components/dashboard/quickActions";
import PerformanceSummary from "@/components/dashboard/performanceSummary";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      {/* 1. Summary cards */}
      <StatsGrid />

      {/* 2. Donut + trend chart — now equal width, equal height */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <div className="h-full">
          <ActivitySummaryChart />
        </div>
        <div className="h-full">
          <ParticipationChart />
        </div>
      </div>

      {/* 3. Recent activities, upcoming activities, quick actions + performance
             summary  */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <RecentActivities />
        <UpcomingActivities />
        <div className="flex flex-col gap-4 h-full">
          <div className="flex-1">
            <QuickActions />
          </div>
          <div className="flex-1">
            <PerformanceSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
