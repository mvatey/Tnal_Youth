import { UserCheck, UserPlus, Users } from "lucide-react";

export function ParticipantStatusBadge({ status }) {
  const style =
    status === "បានចូលរួម"
      ? "bg-success-bg text-success"
      : "bg-warning-bg text-warning";

  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-normal ${style}`}
    >
      {status}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, accent, iconBg, iconColor }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-bg-page-white">
      <div className={`h-[3px] w-full ${accent}`} />
      <div className="flex items-center gap-3 p-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon size={21} className={iconColor} />
        </div>
        <div>
          <p className="text-lg font-bold text-text-primary">{value} នាក់</p>
          <p className="text-sm text-text-secondary">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function ParticipantStats({ total, attended, absent }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        icon={Users}
        label="ចំនួនសមាជិកសរុប"
        value={total}
        accent="bg-secondary-hover"
        iconBg="bg-secondary-light"
        iconColor="text-secondary-hover"
      />
      <StatCard
        icon={UserCheck}
        label="ចំនួនអ្នកបានចូលរួម"
        value={attended}
        accent="bg-primary"
        iconBg="bg-primary-light"
        iconColor="text-primary"
      />
      <StatCard
        icon={UserPlus}
        label="ចំនួនអ្នកមិនបានចូលរួម"
        value={absent}
        accent="bg-warning"
        iconBg="bg-warning-bg"
        iconColor="text-warning"
      />
    </div>
  );
}
