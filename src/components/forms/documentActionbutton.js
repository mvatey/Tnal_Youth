"use client";

import { FolderPlus } from "lucide-react";

export default function DocumentActionButton({
  onCancel,
  onCreate,
  isValid = true,
  saving = false,
  cancelText = "បោះបង់",
  createText = "បង្កើត",
  savingText = "កំពុងរក្សាទុក...",
  createIcon: CreateIcon = FolderPlus,
}) {
  const cannotCreate = !isValid || saving;

  return (
    <div className="mt-5 flex items-center gap-4">
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        className="
          h-[34px]
          w-[150px]
          shrink-0
          rounded-lg
          border
          border-gray-300
          bg-white
          text-sm
          font-medium
          text-text-primary
          transition
          hover:bg-gray-50
          active:scale-[0.99]
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {cancelText}
      </button>

      <button
        type="button"
        onClick={onCreate}
        disabled={saving}
        aria-disabled={cannotCreate}
        className={`
          flex
          h-[34px]
          flex-1
          items-center
          justify-center
          gap-2
          rounded-lg
          text-sm
          font-medium
          text-white
          transition
          ${
            cannotCreate
              ? `
                cursor-not-allowed
                bg-primary
                hover:bg-primary-hover
                active:scale-[0.99]
              `
              : `
                cursor-pointer
                bg-primary
                hover:bg-primary-hover
                active:scale-[0.99]
              `
          }
        `}
      >
        <CreateIcon size={19} />

        {saving ? savingText : createText}
      </button>
    </div>
  );
}