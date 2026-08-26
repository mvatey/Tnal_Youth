"use client";

import { List } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ButtonSeeDetail({
  onClick,
  children,
  className = "",
}) {
  const { t } = useLanguage();
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-lg bg-[#5636A3] px-1 py-1 text-[10px] font-medium text-white transition hover:bg-[#4b2f91] ${className}`}
    >
      <List className="h-3.5 w-5 shrink-0" />
      <span className="truncate">{children || t("memberPage.detail")}</span>
    </button>
  );
}
