"use client";

import { HiSaveAs } from "react-icons/hi";

export default function FormActionButtons({
  onCancel,
  saveText = "រក្សាទុក",
  cancelText = "បោះបង់",
  isValid = true,
  saving = false,
  showSaveIcon = true,
}) {
  return (
    <div className="mt-5 grid grid-cols-[168px_1fr] gap-5">
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        className="
          flex
          h-[34px]
          items-center
          justify-center
          rounded-[10px]
          border
          border-[#C8CBD2]
          bg-page-gray
          px-5
          text-sm
          font-medium
          text-[#252525]
          shadow-[0_1px_2px_rgba(0,0,0,0.08)]
          transition
          hover:bg-[#EEEEF1]
          active:scale-[0.99]
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {cancelText}
      </button>

      <button
        type="submit"
        aria-disabled={!isValid || saving}
        className={`
          flex
          h-[34px]
          items-center
          justify-center
          gap-2
          rounded-[10px]
          px-5
          text-sm
          font-medium
          text-white
          shadow-[0_1px_2px_rgba(0,0,0,0.12)]
          transition
          ${
            isValid && !saving
              ? `
                cursor-pointer
                bg-secondary
                hover:bg-secondary-hover
                active:scale-[0.99]
              `
              : `
                cursor-not-allowed
                bg-secondary
                hover:bg-secondary-hover
              `
          }
        `}
      >
        {showSaveIcon && <HiSaveAs size={19} />}

        {saving
          ? "កំពុងរក្សាទុក..."
          : saveText}
      </button>
    </div>
  );
}
