// components/dashboard/quickActions.jsx
"use client";

import Link from "next/link";
import { CirclePlus, Eye } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/lib/navigation";

const DEFAULT_ACTIONS = [
  {
    id: "program",
    label: "បង្កើតកម្មវិធី",
    href: "/activity/create",
    icon: CirclePlus,
    color: "text-primary",
    bg: "bg-bg-page-gray",
  },
  {
    id: "branch",
    label: "បង្កើតឯកសារ",
    href: "/document/create",
    icon: CirclePlus,
    color: "text-primary",
    bg: "bg-bg-page-gray",
  },
  {
    id: "activity",
    label: "បង្កើតវិភាគទាន",
    href: "/donation/add",
    icon: CirclePlus,
    color: "text-primary",
    bg: "bg-bg-page-gray",
  },
  {
    id: "member",
    label: "បង្កើតសមាជិក",
    href: "/member",
    icon: CirclePlus,
    color: "text-primary",
    bg: "bg-bg-page-gray",
  },
];

// Read-only equivalent of DEFAULT_ACTIONS, shown to VIEWER accounts instead
// of the create-action set — same four destinations, but every action is a
// plain "view" link (Eye icon) rather than something implying a write the
// backend's ViewerWriteBlockFilter would reject anyway.
const VIEWER_ACTIONS = [
  {
    id: "view-program",
    label: "មើលកម្មវិធី",
    href: "/activity",
    icon: Eye,
    color: "text-primary",
    bg: "bg-bg-page-gray",
  },
  {
    id: "view-branch",
    label: "មើលឯកសារ",
    href: "/document",
    icon: Eye,
    color: "text-primary",
    bg: "bg-bg-page-gray",
  },
  {
    id: "view-activity",
    label: "មើលវិភាគទាន",
    href: "/donation",
    icon: Eye,
    color: "text-primary",
    bg: "bg-bg-page-gray",
  },
  {
    id: "view-member",
    label: "មើលសមាជិក",
    href: "/member",
    icon: Eye,
    color: "text-primary",
    bg: "bg-bg-page-gray",
  },
];

const HOVER_STYLES = {
  program: "hover:bg-success-bg hover:text-success",
  branch: "hover:bg-primary-light hover:text-primary",
  activity: "hover:bg-secondary-light hover:text-secondary",
  member: "hover:bg-warning-bg hover:text-warning",
  "view-activities": "hover:bg-success-bg hover:text-success",

  "view-branch": "hover:bg-primary-light hover:text-primary",
  "view-activity": "hover:bg-secondary-light hover:text-secondary",
  "view-program": "hover:bg-success-bg hover:text-success",
  "view-member": "hover:bg-warning-bg hover:text-warning",
};

export default function QuickActions() {
  const { user, authLoading } = useAuth();

  const role = normalizeRole(user?.role);

  const actions = role === "viewer" ? VIEWER_ACTIONS : DEFAULT_ACTIONS;

  if (authLoading) {
    return (
      <div className="app-card flex h-full items-center justify-center rounded-xl border border-border bg-bg-page-white p-4">
        <p className="text-sm text-text-secondary">កំពុងផ្ទុក...</p>
      </div>
    );
  }

  return (
    <div className="app-card flex h-full flex-col rounded-xl border border-border bg-bg-page-white p-4">
      <h3 className="mb-4 text-sm font-semibold text-text-primary">
        មុខងារផ្សេងៗ
      </h3>

      <div className={`grid flex-1 content-center gap-3 ${actions.length === 2 ? "grid-cols-1" : "grid-cols-2"}`}>
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.id}
              href={action.href}
              className={`flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-xs font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${action.bg} ${action.color} ${HOVER_STYLES[action.id]}`}
            >
              <Icon size={16} strokeWidth={2} />
              {action.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}