// app/dashboard/page.jsx
import { Users, MapPin, Calendar, HandHeart } from "lucide-react";
import StatCard from "@/components/dashboard/statCard";
import DonutChart from "@/components/dashboard/pieChart";
import RevenueChart from "@/components/dashboard/lineChart";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Users} label="សមាជិកសរុប" value="250" growth="12" iconColor="text-primary" iconBg="bg-primary-light" />
        <StatCard icon={MapPin} label="សាខាសរុប" value="2" growth="12" iconColor="text-secondary" iconBg="bg-secondary-light" />
        <StatCard icon={Calendar} label="កម្មវិធីសរុបបច្ចុប្បន្ន" value="180" growth="12" iconColor="text-success" iconBg="bg-success-bg" />
        <StatCard icon={HandHeart} label="វិភាគទានចូលសរុប" value="2500$" growth="12" iconColor="text-warning" iconBg="bg-warning-bg" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
            
          <h3 className="font-semibold text-text-primary mb-4">សង្ខេបកម្មវិធី</h3>
          <DonutChart />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-text-primary mb-4">ការចូលរួមប្រចាំខែ</h3>
          <RevenueChart />
        </div>
      </div>

      {/* Activity lists + quick actions — next step */}
    </div>
  );
}