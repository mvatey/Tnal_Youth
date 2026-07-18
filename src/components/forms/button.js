import { ImportIcon, RefreshCw } from "lucide-react";

const BUTTONS = {
  reset: {
    label: "ចាប់ផ្ដើមសារថ្មី",
    Icon: RefreshCw,
    className: "bg-[#E5E7EB] border border-border text-center text-text-secondary hover:bg-bg-page-gray​ w-[150px] h-[34px]",
  },
  save: {
    label: "រក្សាទុក",
    Icon: ImportIcon,
    className: "bg-[#1F285A] text-white text-center hover:bg-[#182149] w-[196px] h-[34px]",
  },
  cancel: {
    label: "បោះបង់",
    Icon: null,
    className: "border border-border bg-[#F3F5FC] text-text-secondary hover:bg-bg-page-gray w-[91px] h-[34px]",
  },
};

export default function Button({ action, onClick }) {
  const { label, Icon, className } = BUTTONS[action];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-[34px] items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium ${className}`}
    >
      {Icon && <Icon size={16} />}
      {label}
    </button>
  );
}
