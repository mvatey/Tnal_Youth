"use client";

import { Trash2 } from "lucide-react";

export default function DeleteButton({
  onClick,
  canDelete = true,
  text = "លុប",
  className = "",
}) {
  /*
   * When there is only one entry left (canDelete === false), a lone
   * item in a repeatable list is not meant to be removable. Rendering
   * a disabled-but-still-bright-red button here reads as broken (it
   * looks clickable but silently does nothing), so we simply don't
   * render it instead of showing a button that appears active.
   */
  if (!canDelete) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 ${className}`}
    >
      <Trash2 size={17} />
      {text}
    </button>
  );
}