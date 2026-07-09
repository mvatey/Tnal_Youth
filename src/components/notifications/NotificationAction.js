"use client";

import { ChevronDown } from "lucide-react";

export default function NotificationAction() {
  return (
    <button
      type="button"
      className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-[12px] font-semibold text-secondary transition hover:bg-secondary-light"
    >
      បង្ហាញបន្ថែម
      <ChevronDown size={14} strokeWidth={2.4} />
    </button>
  );
}
