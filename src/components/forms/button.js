import { Pencil, RefreshCw } from "lucide-react";
import { HiSaveAs } from "react-icons/hi";

const BUTTONS = {
  reset: {
    label: "ចាប់ផ្ដើមសារថ្មី",
    Icon: RefreshCw,
    className: "h-[34px] w-full border border-border bg-bg-page-gray text-center text-text-secondary hover:bg-bg-page-gray/70 sm:w-[150px]",
  },
  save: {
    label: "រក្សាទុក",
    Icon: HiSaveAs,
    className: "h-[34px] w-full bg-[#1F285A] text-center text-white hover:bg-[#182149] sm:w-[196px]",
  },
  cancel: {
    label: "បោះបង់",
    Icon: null,
    className: "h-[34px] w-full border border-border bg-bg-page-gray text-text-secondary hover:bg-bg-page-gray/70 sm:w-[91px]",
  },
  edit: {
    label: "កែប្រែ",
    Icon: Pencil,
    className: "h-[34px] w-full bg-[#4B2E91] text-center text-white hover:bg-[#3d2577] sm:w-[120px]",
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
