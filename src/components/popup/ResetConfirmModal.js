"use client";

import { AlertTriangle } from "lucide-react";
import PopupCard from "@/components/popup/PopupCard";

// Confirms the donation tables' "ចាប់ផ្ដើមសារថ្មី" (start over) action before
// it runs. That action zeroes every visible row's amount, including ones
// that already show a saved donation -- meant for someone who typed a batch
// of amounts, made too many mistakes, and genuinely wants to blank the
// whole table and start entering again, not something that should fire on
// a single accidental click.
export default function ResetConfirmModal({ open, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <PopupCard size="sm" onClose={onCancel}>
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-[34px] w-12 items-center justify-center rounded-full bg-warning-bg text-warning">
          <AlertTriangle size={22} />
        </div>

        <h2 className="mb-2 text-lg font-bold text-text-primary">
          ចាប់ផ្ដើមសារថ្មី
        </h2>

        <p className="mb-6 text-sm text-text-secondary">
          ការចាប់ផ្ដើមសារថ្មីនឹងធ្វើឲ្យចំនួនទឹកប្រាក់ទាំងអស់ក្នុងតារាងនេះទៅជា 0។ តើអ្នកចង់បន្តទេ?
        </p>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-secondary py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            ចាប់ផ្ដើមសារថ្មី
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-page-gray"
          >
            បោះបង់
          </button>
        </div>
      </div>
    </PopupCard>
  );
}
