import { ImportIcon, RefreshCw } from "lucide-react";

const BUTTONS = {
  reset: {
    label: "ចាប់ផ្ដើមសារថ្មី",
    Icon: RefreshCw,
    className: "bg-[#E5E7EB] border border-border text-center text-text-secondary hover:bg-bg-page-gray w-[150px] h-[34px]",
  },
  save: {
    label: "រក្សាទុក",
    Icon: Download,
    className: "bg-[#1F285A] text-white text-center hover:bg-[#182149] w-[196px] h-[34px]",
  },
  cancel: {
    label: "បោះបង់",
    Icon: null,
    className: "border border-border bg-[#F3F5FC] text-text-secondary hover:bg-bg-page-gray w-[91px] h-[34px]",
  },
};

export default function Button({
  action,
  onClick,
  type = "button",
  disabled = false,
  label,
}) {
  const { label: defaultLabel, Icon, className } = BUTTONS[action];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`activity-form-action-button inline-flex h-[34px] items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {Icon && <Icon size={16} />}
      {label || defaultLabel}
    </button>
  );
}
