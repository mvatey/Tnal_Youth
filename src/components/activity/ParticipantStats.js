import {
  Building2,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function ParticipantStatusBadge({
  status,
}) {
  const { t } = useLanguage();
  const style =
    status === t("activityPage.participated") ||
    status === t("activityPage.invited")
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

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  iconBg,
  iconColor,
}) {
  const { t } = useLanguage();
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-bg-page-white">
      <div
        className={`h-[3px] w-full ${accent}`}
      />

      <div className="flex items-center gap-3 p-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon
            size={21}
            className={iconColor}
          />
        </div>

        <div>
          <p className="text-lg font-bold text-text-primary">
            {Number(value || 0)} {t("activityPage.memberUnit")}
          </p>

          <p className="text-sm text-text-secondary">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ParticipantStats({
  total = 0,
  attended = 0,
  absent = 0,

  // Host branch only.
  showInvitedBranch = false,
  invitedBranch = 0,
}) {
  const { t } = useLanguage();
  return (
    <div
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
        showInvitedBranch
          ? "xl:grid-cols-4"
          : "xl:grid-cols-3"
      }`}
    >
      <StatCard
        icon={Users}
        label={t("activityPage.totalMembers")}
        value={total}
        accent="bg-secondary-hover"
        iconBg="bg-secondary-light"
        iconColor="text-secondary-hover"
      />

      <StatCard
        icon={UserCheck}
        label={t("activityPage.attendedMembers")}
        value={attended}
        accent="bg-primary"
        iconBg="bg-primary-light"
        iconColor="text-primary"
      />

      <StatCard
        icon={UserPlus}
        label={t("activityPage.absentMembers")}
        value={absent}
        accent="bg-warning"
        iconBg="bg-warning-bg"
        iconColor="text-warning"
      />

      {showInvitedBranch && (
        <StatCard
          icon={Building2}
          label={t("activityPage.invitedBranchMembers")}
          value={invitedBranch}
          accent="bg-secondary"
          iconBg="bg-secondary-light"
          iconColor="text-secondary"
        />
      )}
    </div>
  );
}
