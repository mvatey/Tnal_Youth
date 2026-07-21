"use client";

import { CloudDownload } from "lucide-react";
import { RiDownloadCloud2Line } from "react-icons/ri";

export default function SaveButton({ onClick, ...buttonProps }) {
  return (
    <button
      type="button"
      onClick={onClick}
      {...buttonProps}
      className="
        flex items-center justify-center gap-2 px-3
        h-[34px] w-[110px]
        bg-[#4B2E91]
        text-white
        rounded-[8px]
        shadow-xl
        transition-all duration-200
        hover:-translate-y-0.5 hover:bg-[#432982] hover:shadow-md
        active:translate-y-0
      "
    >
      <CloudDownload className="h-5 w-5 shrink-0" />

      <span
        className="
          whitespace-nowrap text-[14px]
          font-medium
          leading-none
        "
      >
        ទាញយក
      </span>
    </button>
  );
}
