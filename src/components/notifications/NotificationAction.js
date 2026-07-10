"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

export default function NotificationAction({ expanded = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-[12px] font-semibold text-secondary transition hover:bg-secondary-light"
    >
      {expanded ? "បង្ហាញតិច" : "បង្ហាញបន្ថែម"}
      {expanded ? (
        <ChevronUp size={14} strokeWidth={2.4} />
      ) : (
        <ChevronDown size={14} strokeWidth={2.4} />
      )}
    </button>
  );
}
