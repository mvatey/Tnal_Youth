"use client";

import { AlertTriangle } from "lucide-react";
import PopupCard from "@/components/popup/PopupCard";
import { useLanguage } from "@/context/LanguageContext";

// A single-button warning popup for an oversized file selection --
// shared by every document/template upload form so the limit is
// impossible to miss (unlike a quiet inline error line, which is easy
// to scroll past).
export default function FileTooLargeModal({ open, message, onClose }) {
  const { t } = useLanguage();

  if (!open) return null;

  return (
    <PopupCard size="sm" onClose={onClose}>
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-[34px] w-12 items-center justify-center rounded-full bg-warning-bg text-warning">
          <AlertTriangle size={22} />
        </div>

        <h2 className="mb-2 text-lg font-bold text-text-primary">
          {t("documentPage.fileTooLargeTitle")}
        </h2>

        <p className="mb-6 text-sm text-text-secondary">
          {message}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg bg-secondary py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          {t("documentPage.gotIt")}
        </button>
      </div>
    </PopupCard>
  );
}
