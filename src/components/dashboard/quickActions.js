// components/dashboard/quickActions.jsx
import Link from "next/link";
import { CirclePlus } from "lucide-react";
import quickActions from "@/data/donation/quickActions.json";

export default function QuickActions() {
  return (
    <div
      className="bg-white rounded-xl border border-border"
      style={{ padding: "16px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}
    >
      <h3 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: 600, color: "#232629" }}>មុខងារផ្សេងៗ</h3>
      <div className="grid grid-cols-2 gap-3" style={{ flex: 1, alignContent: "center" }}>
        {quickActions.map((action) => (
          <Link
            key={action.id}
            href={action.href}
            className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium ${action.bg} ${action.color} hover:opacity-80 transition`}
          >
            <CirclePlus size={16} strokeWidth={2} />
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
