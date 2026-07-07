// components/dashboard/quickActions.jsx
import { Plus } from "lucide-react";

const ACTIONS = [
  { id: "program", label: "បន្ថែមកម្មវិធី", color: "text-success", bg: "bg-success-bg" },
  { id: "member", label: "បន្ថែមសមាជិក", color: "text-primary", bg: "bg-primary-light" },
  { id: "branch", label: "បន្ថែមសាខារៀន", color: "text-secondary", bg: "bg-secondary-light" },
  { id: "donation", label: "បន្ថែមចំណូល", color: "text-warning", bg: "bg-warning-bg" },
];

export default function QuickActions() {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <h3 className="font-semibold text-text-primary text-sm mb-4">មុខងារផ្សេងៗ</h3>
      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${action.bg} ${action.color} hover:opacity-80 transition`}
          >
            <Plus size={16} />
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}