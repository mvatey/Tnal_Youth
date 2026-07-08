"use client";

import { CloudDownload } from "lucide-react";

export default function SaveButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex items-center justify-center gap-2 px-3
        w-[110px] h-[34px]
        bg-[#4B2E91]
        text-white
        rounded-[8px]
        shadow-xl
        hover:bg-[#432982]
        transition-all
      "
    >
      <CloudDownload
        className="
          h-4 w-4 shrink-0
          stroke-[2]
        "
      />

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
