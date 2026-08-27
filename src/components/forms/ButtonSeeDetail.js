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
      className={`inline-flex items-center gap-1 rounded-lg bg-primary px-1 py-1 text-[10px] font-medium text-white transition hover:bg-primary-hover ${className}`}
    >
      <List className="h-3.5 w-5 shrink-0" />
      <span className="truncate">{children || t("memberPage.detail")}</span>
    </button>
  );
}
