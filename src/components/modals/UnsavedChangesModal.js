"use client";

import { Save } from "lucide-react";
import PopupCard from "@/components/modals/PopupCard";

export default function UnsavedChangesModal({
  open,
  saving = false,
  error = "",
  onCancel,
  onDiscard,
  onSaveAndContinue,
  title = "មានការផ្លាស់ប្ដូរមិនទាន់រក្សាទុក",
  message = "តើអ្នកចង់រក្សាទុកការផ្លាស់ប្ដូរឥឡូវនេះ ឬរំលងហើយបន្តទៅផ្ទាំងបន្ទាប់?",
}) {
  if (!open) return null;

  return (
    <PopupCard
      size="sm"
      onClose={saving ? undefined : onCancel}
    >
      <div className="text-center">
        {/* Icon */}

        <div
          className="
          mx-auto
          mb-4
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-full
          bg-warning-bg
          text-warning
          "
        >
          <Save size={24} />
        </div>

        {/* Title */}

        <h2
          className="
          mb-2
          text-lg
          font-bold
          text-text-primary
          "
        >
          {title}
        </h2>

        {/* Message */}

        <p
          className="
          mb-4
          text-sm
          text-text-mute
          "
        >
          {message}
        </p>

        {error && (
          <p className="mb-4 text-sm text-error">
            {error}
          </p>
        )}

        {/* Buttons */}

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onSaveAndContinue}
            disabled={saving}
            className="
            w-full
            rounded-lg
            bg-primary
            py-2.5
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-primary/90
            disabled:cursor-not-allowed
            disabled:opacity-60
            "
          >
            {saving ? "កំពុងរក្សាទុក..." : "រក្សាទុក ហើយបន្ត"}
          </button>

          <button
            type="button"
            onClick={onDiscard}
            disabled={saving}
            className="
            w-full
            rounded-lg
            border
            border-border
            py-2.5
            text-sm
            font-medium
            text-text-secondary
            transition
            hover:bg-bg-page-gray
            disabled:cursor-not-allowed
            disabled:opacity-60
            "
          >
            រំលង ហើយបន្ត
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="
            w-full
            py-2
            text-sm
            font-medium
            text-text-mute
            transition
            hover:text-text-secondary
            disabled:cursor-not-allowed
            disabled:opacity-60
            "
          >
            បោះបង់
          </button>
        </div>
      </div>
    </PopupCard>
  );
}
