import {
  CalendarDays,
  Clock,
  CheckCircle,
  Activity,
} from "lucide-react";

const stats = [
  {
    label: "កម្មវិធីសរុប",
    value: 28,
    icon: Activity,
    accent: "bg-primary",
    iconBg: "bg-primary-light",
    iconColor: "text-primary",
  },
  {
    label: "កម្មវិធីបន្ទាប់",
    value: 9,
    icon: CalendarDays,
    accent: "bg-secondary-hover",
    iconBg: "bg-secondary-light",
    iconColor: "text-secondary-hover",
  },
  {
    label: "កំពុងដំណើរការ",
    value: 3,
    icon: Clock,
    accent: "bg-warning",
    iconBg: "bg-warning-bg",
    iconColor: "text-warning",
  },
  {
    label: "បានបញ្ចប់",
    value: 16,
    icon: CheckCircle,
    accent: "bg-success",
    iconBg: "bg-success-bg",
    iconColor: "text-success",
  },
];


function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  iconBg,
  iconColor,
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-bg-page-white">
      
      {/* top color line */}
      <div className={`h-[3px] w-full ${accent}`} />


      <div className="flex items-center gap-3 p-4">

        <div
          className={`
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-xl
            ${iconBg}
          `}
        >

          <Icon
            size={22}
            className={iconColor}
          />

        </div>


        <div>

          <p className="text-lg font-bold text-text-primary">
            {value}
          </p>

          <p className="text-sm text-text-secondary">
            {label}
          </p>

        </div>

      </div>

    </div>
  );
}


export default function ActivityStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => (
        <StatCard
          key={item.label}
          {...item}
        />
      ))}
    </div>
  );
}