"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

const pages = [1, 2, 3, "...", 8, 9, 10];

export default function NotificationPagination() {
  return (
    <div className="flex items-center justify-between border-t border-border px-6 py-3">
      <button
        type="button"
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-text-secondary shadow-sm transition hover:border-primary hover:text-primary"
      >
        <ArrowLeft size={15} />
        Previous
      </button>

      <div className="flex items-center justify-center gap-1.5">
        {pages.map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium text-text-secondary"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition hover:bg-primary-lighter hover:text-primary ${
                page === 1
                  ? "bg-primary-lighter text-primary"
                  : "text-text-secondary"
              }`}
            >
              {page}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-text-secondary shadow-sm transition hover:border-primary hover:text-primary"
      >
        Next
        <ArrowRight size={15} />
      </button>
    </div>
  );
}
