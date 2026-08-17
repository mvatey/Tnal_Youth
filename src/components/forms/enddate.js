import { CalendarDays } from "lucide-react";

export default function DateInputButton() {
  return (
    <button
      className="
        flex h-[34px] w-[167px] max-w-[890px]
        items-center justify-between
        rounded-[40px]
        border border-border
        bg-bg-page-white
        px-16
        text-sm font-medium text-text-secondary
        shadow-md
      "
    >
      <span>
        កាលបរិច្ឆេទបញ្ចប់
      </span>

      <CalendarDays size={16} strokeWidth={2.2} />
    </button>
  );
}
