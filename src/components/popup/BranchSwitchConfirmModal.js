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
  // Overridable so the same "unsaved changes" pattern can be reused
  // outside the branch-switch context (e.g. switching tabs mid-edit on
  // the event-donation detail page) without the copy still talking about
  // branches. Defaults keep the original branch-switch wording exactly
  // as-is for BranchContext's own usage.
  title = "មានទិន្នន័យមិនទាន់រក្សាទុក",
  message = "អ្នកកំពុងកែប្រែទិន្នន័យនៅសាខាបច្ចុប្បន្ន។ ប្តូរសាខាឥឡូវនេះ នឹងបោះបង់ការកែប្រែដែលមិនទាន់រក្សាទុក។ តើអ្នកចង់រក្សាទុកជាមុន ឬបោះបង់ ហើយប្តូរសាខា?",
  saveLabel = "រក្សាទុក ហើយប្តូរសាខា",
  savingLabel = "កំពុងរក្សាទុក...",
  discardLabel = "បោះបង់ការកែប្រែ ហើយប្តូរសាខា",
  cancelLabel = "បន្តកែប្រែសាខានេះ",
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
          {title}
        </h2>

        <p className="mb-6 text-sm text-text-secondary">
          {message}
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
            {busy ? savingLabel : saveLabel}
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
            {discardLabel}
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
            {cancelLabel}
          </button>
        </div>
      </div>
    </PopupCard>
  );
}
