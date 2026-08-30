"use client";

import { Save } from "lucide-react";
import PopupCard from "@/components/modals/PopupCard";
import { useLanguage } from "@/context/LanguageContext";

export default function UnsavedChangesModal({
  open,
  saving = false,
  error = "",
  onCancel,
  onDiscard,
  onSaveAndContinue,
  title,
  message,
}) {
  const { t } = useLanguage();

  if (!open) return null;

  const resolvedTitle = title ?? t("memberPage.unsavedChangesTitle");
  const resolvedMessage = message ?? t("memberPage.unsavedChangesMessage");

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
          {resolvedTitle}
        </h2>

        {/* Message */}

        <p
          className="
          mb-4
          text-sm
          text-text-mute
          "
        >
          {resolvedMessage}
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
            {saving ? t("common.saving") : t("memberPage.saveAndContinue")}
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
            {t("memberPage.discardAndContinue")}
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
            {t("memberPage.cancel")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
}
