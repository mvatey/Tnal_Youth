"use client";

import { List } from "lucide-react";

export default function DetailButton({
  onClick,
  children = "លម្អិត",
  className = "",
}) {
  return (
    <button
      onClick={onClick}
      className={`font-Regular text-white text-[10px] inline-flex h-[18px] min-w-[52px] items-center justify-center gap-[3px] rounded-[8px] bg-[#5636A3] px-2   leading-none  transition hover:bg-[#4b2f91] ${className}`}
    >
      <List  size={11} strokeWidth={2.2} />
      <span className="truncate text-[10px]">{children}</span>
    </button>
  );
}
