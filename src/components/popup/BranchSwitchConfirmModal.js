"use client";

import { AlertTriangle } from "lucide-react";
import PopupCard from "@/components/popup/PopupCard";

// Shown whenever the sidebar's branch dropdown is switched while the page
// currently open has unsaved progress (a form with entered-but-not-saved
// amounts, etc.) -- see BranchContext.js's registerBranchChangeGuard /
// requestBranchChange. Without this, switching branches mid-entry silently
// discarded whatever the user had typed, or left the page half showing the
// old branch and half the new one.
export default function BranchSwitchConfirmModal({
  open,
  busy = false,
  error = "",
  onCancel,
  onDiscard,
  onSave,
}) {
  if (!open) return null;

  return (
    <PopupCard size="sm" onClose={busy ? undefined : onCancel}>
      <div className="text-center">
        <div
          className="
            mx-auto
            mb-4
            flex
            h-[34px]
            w-12
            items-center
            justify-center
            rounded-full
            bg-warning-bg
            text-warning
          "
        >
          <AlertTriangle size={22} />
        </div>

        <h2 className="mb-2 text-lg font-bold text-text-primary">
          មានទិន្នន័យមិនទាន់រក្សាទុក
        </h2>

        <p className="mb-6 text-sm text-text-secondary">
          អ្នកកំពុងកែប្រែទិន្នន័យនៅសាខាបច្ចុប្បន្ន។ ប្តូរសាខាឥឡូវនេះ
          នឹងបោះបង់ការកែប្រែដែលមិនទាន់រក្សាទុក។
          តើអ្នកចង់រក្សាទុកជាមុន ឬបោះបង់ ហើយប្តូរសាខា?
        </p>

        {error ? (
          <p className="mb-4 rounded-md border border-error/30 bg-error-bg px-3 py-2 text-xs text-error">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={busy}
            className="
              rounded-lg
              bg-secondary
              py-2.5
              text-sm
              font-semibold
              text-white
              hover:opacity-90
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {busy ? "កំពុងរក្សាទុក..." : "រក្សាទុក ហើយប្តូរសាខា"}
          </button>

          <button
            type="button"
            onClick={onDiscard}
            disabled={busy}
            className="
              rounded-lg
              border
              border-error/30
              py-2.5
              text-sm
              font-semibold
              text-error
              hover:bg-error-bg
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            បោះបង់ការកែប្រែ ហើយប្តូរសាខា
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="
              rounded-lg
              border
              border-border
              py-2.5
              text-sm
              font-medium
              text-text-secondary
              hover:bg-bg-page-gray
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            បន្តកែប្រែសាខានេះ
          </button>
        </div>
      </div>
    </PopupCard>
  );
}
