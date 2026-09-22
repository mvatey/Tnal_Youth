"use client";

import { List } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ButtonSeeDetail({
  onClick,
  children,
  className = "",
}) {
  const { t } = useLanguage();
  const label = children || t("memberPage.detail");

  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center gap-1 rounded-lg bg-primary p-1.5 text-[10px] font-medium text-white transition hover:bg-primary-hover sm:px-2 sm:py-1 ${className}`}
    >
      <List className="h-3.5 w-3.5 shrink-0 sm:w-5" />
      <span className="hidden truncate sm:inline">{label}</span>
    </button>
  );
}
