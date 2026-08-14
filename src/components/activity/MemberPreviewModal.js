"use client";

import { X } from "lucide-react";
import MemberInfoCard from "@/components/card/memberInfoCard";

/**
 * A read-only "quick look" at a member's brief info card (the same card used
 * on the member detail page), opened from the Eye action in
 * MemberSelectModal. Profile-photo editing is intentionally disabled here —
 * this is a preview, not the member's own profile page.
 */
export default function MemberPreviewModal({ member, onClose }) {
  if (!member) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            aria-label="បិទ"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-text-secondary shadow-md transition hover:text-primary"
          >
            <X size={18} />
          </button>
        </div>

        <MemberInfoCard member={member} allowProfileChange={false} />
      </div>
    </div>
  );
}
