"use client";

import { useState } from "react";
import { DeleteIcon, Link2, X } from "lucide-react";
import { Trash2 } from "lucide-react";
import { IoRemove, IoRemoveCircle, IoRemoveSharp } from "react-icons/io5";

export default function ButtonDropLink({
  value = "",
  onChange,
  placeholder = "បញ្ចូលតំណភ្ជាប់ឯកសារ",
}) {
  const [showInput, setShowInput] = useState(Boolean(value));

  function handleCancel() {
    setShowInput(false);
    onChange?.("");
  }

  return (
    <div className="w-full">
      {!showInput ? (
        <button
          type="button"
          onClick={() => setShowInput(true)}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <Link2 size={17} />
          តំណភ្ជាប់ឯកសារ
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Link2
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="url"
              value={value}
              onChange={(event) => onChange?.(event.target.value)}
              placeholder={placeholder}
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 text-sm text-text-primary outline-none focus:border-primary"
            />
          </div>

          <button
            type="button"
            onClick={handleCancel}
            className="flex size-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-100 hover:text-red-500"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
