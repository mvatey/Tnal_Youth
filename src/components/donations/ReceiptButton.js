"use client";

import { FileText } from "lucide-react";

/*
 * A donation's uploaded receipt, opened directly (not embedded as an
 * <img>) so the browser handles whatever it actually is -- image, PDF,
 * whatever -- using the real Content-Type the backend serves, instead of
 * guessing the file type on the frontend and risking a broken-image icon
 * for anything that isn't an image (the bug in the sponsor donation
 * table's previous receipt preview, which hardcoded "image/unknown" for
 * every receipt regardless of what was actually uploaded).
 */
export default function ReceiptButton({ receiptFileId, label = "Receipt" }) {
  if (!receiptFileId) {
    return <span className="text-xs text-text-mute">-</span>;
  }

  return (
    <a
      href={`/api/backend/files/${receiptFileId}/content`}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-secondary/20 bg-bg-page-white text-secondary shadow-sm transition hover:bg-secondary-light"
    >
      <FileText size={16} strokeWidth={2.2} />
    </a>
  );
}
