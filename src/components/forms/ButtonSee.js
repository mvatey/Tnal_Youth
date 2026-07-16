"use client";

import { EyeIcon } from "lucide-react";

export default function ButtonSee({
  onClick,
  children = "មើល",
  className = "",
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-lg bg-secondary px-1 py-1 text-[11px] font-medium text-white transition hover:opacity-90 ${className}`}
    >
      <EyeIcon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{children}</span>
    </button>
  );
}