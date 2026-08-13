"use client";

import {
  TbFileTypePdf,
  TbFileSpreadsheet,
} from "react-icons/tb";

export default function SaveFile({
  fileName = "export.xlsx",
  fileSize = "",
  type = "excel",
  onClick,
  className = "",
}) {
  const isExcel =
    type === "excel";

  const Icon =
    isExcel
      ? TbFileSpreadsheet
      : TbFileTypePdf;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        h-[72px]
        w-[304px]
        items-center
        gap-3
        rounded-2xl
        bg-white
        px-4
        text-left
        shadow-[0_2px_5px_rgba(0,0,0,0.22)]
        transition
        hover:bg-gray-50
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-secondary
        ${className}
      `}
      aria-label={
        fileSize
          ? `${fileName}, ${fileSize}`
          : fileName
      }
    >
      <Icon
        aria-hidden="true"
        className={
          isExcel
            ? "shrink-0 text-green-600"
            : "shrink-0 text-[#e5252a]"
        }
        size={44}
        strokeWidth={1.8}
      />

      <span className="min-w-0">
        <span
          className="
            block
            truncate
            text-[20px]
            font-semibold
            leading-7
            text-black
          "
        >
          {fileName}
        </span>

        {fileSize && (
          <span
            className="
              block
              text-[14px]
              font-normal
              leading-5
              text-black
            "
          >
            {fileSize}
          </span>
        )}
      </span>
    </button>
  );
}