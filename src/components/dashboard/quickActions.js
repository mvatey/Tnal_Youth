// components/dashboard/quickActions.jsx
"use client";

import { useRouter } from "next/navigation";
import { CirclePlus } from "lucide-react";
import Link from "next/link";

const ACTIONS = [
  {
    id: "program",
    label: "បង្កើតកម្មវិធី",
    href: "/activity/create",
    color: "text-primary",
    bg: "bg-gray-100",
  },
  {
    id: "branch",
    label: "បង្កើតឯកសារ",
    href: "/document/create",
    color: "text-primary",
    bg: "bg-gray-100",
  },
  {
    id: "activity",
    label: "បង្កើតវិភាគទាន",
    href: "/donation/add",
    color: "text-primary",
    bg: "bg-gray-100",
  },
  {
    id: "member",
    label: "បង្កើតសមាជិក",
    href: "/member/create",
    color: "text-primary",
    bg: "bg-gray-100",
  },
];

const HOVER_STYLES = {
  program: "hover:bg-success-bg hover:text-success",
  branch: "hover:bg-primary-light hover:text-primary",
  activity: "hover:bg-secondary-light hover:text-secondary",
  member: "hover:bg-warning-bg hover:text-warning",
};

export default function QuickActions() {
  const router = useRouter();

  return (
    <div
      className="app-card bg-white rounded-xl border border-border"
      style={{
        padding: "16px",
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3
        style={{
          margin: "0 0 16px 0",
          fontSize: 14,
          fontWeight: 600,
          color: "#232629",
        }}
      >
        មុខងារផ្សេងៗ
      </h3>

      <div
        className="grid grid-cols-2 gap-3"
        style={{ flex: 1, alignContent: "center" }}
      >
        {ACTIONS.map((action) => (
          <Link
            key={action.id}
            href={action.href}
            className={`flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-xs font-medium ${action.bg} ${action.color} transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-sm ${HOVER_STYLES[action.id]}`}
          >
            <CirclePlus size={16} strokeWidth={2} />
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}