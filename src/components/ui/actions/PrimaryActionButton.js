"use client";

import { RiDownloadCloud2Line } from "react-icons/ri";
import { useLanguage } from "@/context/LanguageContext";

export default function PrimaryActionButton({
  onClick,
  className = "",
  ...buttonProps
}) {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      onClick={onClick}
      {...buttonProps}
      className={`
        flex h-[34px]
        items-center
        justify-center
        gap-2
        whitespace-nowrap
        rounded-lg
        bg-primary
        px-4
        text-sm
        font-semibold
        text-white
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:bg-primary-hover
        hover:shadow-sm
        active:translate-y-0
        ${className}
      `}
    >
      <RiDownloadCloud2Line
        size={16}
        className="shrink-0"
      />

      <span>{t("common.download")}</span>
    </button>
  );
}
