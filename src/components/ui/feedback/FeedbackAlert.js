"use client";

import { Check, X } from "lucide-react";

export default function FeedbackAlert({
  message,
  type = "success",
  onClose,
}) {
  const isError = type === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live="polite"
      className="pointer-events-auto flex min-h-[46px] w-[min(460px,calc(100vw-32px))] items-center gap-3 rounded-lg border border-border bg-bg-page-white px-4 py-3 shadow-lg"
    >
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white ${
          isError ? "bg-error" : "bg-success"
        }`}
      >
        {isError ? <X size={16} strokeWidth={3} /> : <Check size={16} strokeWidth={3} />}
      </div>

      <p className="min-w-0 flex-1 text-sm font-medium text-text-secondary">
        {message}
      </p>

      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="បិទ"
          className="shrink-0 rounded-md p-1 text-text-mute transition hover:bg-bg-page-gray hover:text-text-primary"
        >
          <X size={16} />
        </button>
      ) : null}
    </div>
  );
}
