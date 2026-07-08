import { RefreshCw, Save } from "lucide-react";

const BUTTONS = {
  reset: {
    label: "កំណត់ឡើងវិញ",
    Icon: RefreshCw,
    className: "border border-border text-text-secondary hover:bg-bg-page-gray",
  },
  save: {
    label: "រក្សាទុក",
    Icon: Save,
    className: "bg-primary text-white hover:bg-primary-hover",
  },
  cancel: {
    label: "បោះបង់",
    Icon: null,
    className: "border border-border bg-white text-text-secondary hover:bg-bg-page-gray",
  },
};

export default function Button({ action, onClick }) {
  const { label, Icon, className } = BUTTONS[action];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium ${className}`}
    >
      {Icon && <Icon size={16} />}
      {label}
    </button>
  );
}
