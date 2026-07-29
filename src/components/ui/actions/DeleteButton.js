"use client";

import { Trash2 } from "lucide-react";

export default function DeleteButton({
  onClick,
  canDelete = true,
  text = "លុប",
  className = "",
}) {
  return (
    <button
      type="button"
      disabled={!canDelete}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white transition ${
        canDelete
          ? "hover:bg-red-700"
          : "cursor-not-allowed"
      } ${className}`}
    >
      <Trash2 size={17} />
      {text}
    </button>
  );
}