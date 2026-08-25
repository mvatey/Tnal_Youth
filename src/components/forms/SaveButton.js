"use client";

import { HiSaveAs } from "react-icons/hi";
import { useLanguage } from "@/context/LanguageContext";

export default function SaveButton({
  onClick,
  children,
  disabled = false,
  type = "submit",
  className = "",
  ...buttonProps
}) {
  const { t } = useLanguage();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...buttonProps}
      className={`inline-flex h-[34px] items-center justify-center gap-2 rounded-lg bg-secondary px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary-hover disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <HiSaveAs size={17} />
      {children || t("common.save", "រក្សាទុក")}
    </button>
  );
}
