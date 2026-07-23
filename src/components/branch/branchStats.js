"use client";

import {
  Building2,
  BadgeCheck,
  Users,
} from "lucide-react";

const STAT_CONFIG = [
  {
    key: "totalBranches",
    label: "ចំនួនសាខាសរុប",
    Icon: Building2,
    iconClass:
      "bg-secondary-light text-secondary",
    borderClass: "border-t-secondary",
  },
  {
    key: "activeBranches",
    label: "ចំនួនសាខាសកម្ម",
    Icon: BadgeCheck,
    iconClass:
      "bg-warning-bg text-warning",
    borderClass: "border-t-warning",
  },
  {
    key: "totalMembers",
    label: "ចំនួនសមាជិកសរុប",
    Icon: Users,
    iconClass:
      "bg-success-bg text-success",
    borderClass: "border-t-success",
  },
];

export default function BranchStats({ branches = [] }) {
  const values = {
    totalBranches: branches.length,

    activeBranches: branches.filter(
      (branch) => branch.status === "ACTIVE",
    ).length,

    totalMembers: branches.reduce(
      (total, branch) =>
        total + Number(branch.memberCount || 0),
      0,
    ),
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {STAT_CONFIG.map(
        ({
          key,
          label,
          Icon,
          iconClass,
          borderClass,
        }) => (
          <div
            key={key}
            className={`rounded-xl border border-border border-t-3 bg-white p-5 shadow-sm ${borderClass}`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconClass}`}
              >
                <Icon size={19} />
              </div>

              <div>
                <p className="text-xs text-text-secondary">
                  {label}
                </p>

                <p className="mt-1 text-2xl font-bold text-text-primary">
                  {values[key]}
                </p>
              </div>
            </div>
          </div>
        ),
      )}
    </div>
  );
}