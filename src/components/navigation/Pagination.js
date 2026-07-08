"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  currentPage = 1,
  totalPages = 10,
  onPageChange,
}) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange?.(page);
    }
  };

  return (
    <div className="w-full bg-white py-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => changePage(currentPage - 1)}
          disabled={currentPage === 1}
          className="ml-7 flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <ChevronLeft className="h-5 w-5" />
          មុននេះ
        </button>

        <div className="flex items-center gap-1">
          {pages.map((page) => (
            <button
              type="button"
              key={page}
              onClick={() => changePage(page)}
              className={`flex h-12 w-12 items-center justify-center rounded-xl text-base ${
                currentPage === page
                  ? "bg-slate-50 font-semibold text-slate-900"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => changePage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="mr-7 flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          បន្ទាប់
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
