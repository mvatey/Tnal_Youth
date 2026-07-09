// components/popup/Confirmdeletemodal.jsx
"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  title = "លុបទិន្នន័យ?",
  description = "តើអ្នកប្រាកដថានឹងលុបទិន្នន័យនេះទេ?",
  cancelLabel = "បោះបង់",
  confirmLabel = "លុប",
}) {
  const [mounted, setMounted] = useState(false);

  // document.body only exists on the client — wait for mount before portaling
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Lock body scroll while open, so the page behind can't scroll/shift
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-xl"
      >
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-gray-50">
          <Trash2 className="h-10 w-10 text-red-600" strokeWidth={1.75} />
        </div>

        {/* Title */}
        <h2 className="mb-3 text-2xl font-bold text-text-primary">{title}</h2>

        {/* Description */}
        <p className="mb-7 text-base text-text-secondary">{description}</p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-full bg-gray-100 py-3.5 text-sm font-medium text-text-secondary transition hover:bg-gray-200"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-full bg-red-600 py-3.5 text-sm font-medium text-white transition hover:bg-red-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}