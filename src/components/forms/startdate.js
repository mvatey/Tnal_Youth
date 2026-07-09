import { CalendarDays } from "lucide-react";

export default function DateInputButton() {
  return (
    <button
      className="
        flex h-[34px] w-[167px]] max-w-[890px]
        items-center justify-between
        rounded-[40px]
        border border-[#EAECF0]
        bg-white
        px-16
        text-[#4B5565]
        shadow-md
      "
    >
      <span className="text-6xl font-bold">
        កាលបរិច្ឆេទចាប់ផ្តើម
      </span>

      <CalendarDays size={16

      } strokeWidth={2.2} />
    </button>
  );
}