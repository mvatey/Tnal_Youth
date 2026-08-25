"use client";

import { HiSaveAs } from "react-icons/hi";
import { useLanguage } from "@/context/LanguageContext";

export default function SaveButton({
  onClick,
  children,
}) {
  const { t } = useLanguage();

  const handleClick = () => {

    if (onClick) {
      onClick();
      return;
    }

    alert("រក្សាទុកបានជោគជ័យ");

  };


  return (
    <button
      onClick={handleClick}
      className="inline-flex h-[34px] w-full items-center justify-center gap-2 rounded-lg bg-secondary px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary-hover sm:w-auto"
    >
      <HiSaveAs size={17} />
      {children || t("common.save", "រក្សាទុក")}
    </button>
  );
}
