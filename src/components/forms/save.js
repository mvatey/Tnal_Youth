"use client";

import { RiDownloadCloud2Line } from "react-icons/ri";

export default function SaveButton({
  onClick,
  className = "",
  ...buttonProps
}) {
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

      <span>ទាញយក</span>
    </button>
  );
}