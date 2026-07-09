// components/dashboard/quickActions.jsx
import { CirclePlus } from "lucide-react";

const ACTIONS = [
  { id: "program", label: "បន្ថែមកម្មវិធី", color: "text-success", bg: "bg-success-bg" },
  { id: "member", label: "បន្ថែមសមាជិក", color: "text-primary", bg: "bg-primary-light" },
  { id: "branch", label: "បន្ថែមសាខារៀន", color: "text-secondary", bg: "bg-secondary-light" },
  { id: "donation", label: "បន្ថែមចំណូល", color: "text-warning", bg: "bg-warning-bg" },
];

export default function QuickActions() {
  return (
    <div
      className="bg-white rounded-xl border border-border"
      style={{ padding: "16px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}
    >
      <h3 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: 600, color: "#232629" }}>មុខងារផ្សេងៗ</h3>
      <div className="grid grid-cols-2 gap-3" style={{ flex: 1, alignContent: "center" }}>
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium ${action.bg} ${action.color} hover:opacity-80 transition`}
          >
            <CirclePlus size={16} strokeWidth={2} />
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}