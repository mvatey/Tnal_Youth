"use client";

import { List } from "lucide-react";

export default function ButtonSeeDetail({
  onClick,
  children = "ព័ត៌មានលម្អិត",
  className = "",
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-lg bg-secondary px-1 py-1 text-[10px] font-medium text-white transition hover:opacity-90 ${className}`}
    >
      <List className="h-3.5 w-5 shrink-0" />
      <span className="truncate">{children}</span>
    </button>
  );
}