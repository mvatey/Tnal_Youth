import { ArrowLeft, ArrowRight, Download } from "lucide-react";

// Builds a compact page list like: 1 2 3 ... 8 9 10
function getPageNumbers(current, total) {
  const pages = [];
  const siblings = 1;

  const left = Math.max(2, current - siblings);
  const right = Math.min(total - 1, current + siblings);

  pages.push(1);

  if (left > 2) {
    pages.push("...");
  }

  for (let i = left; i <= right; i++) {
    pages.push(i);
  }

  if (right < total - 1) {
    pages.push("...");
  }

  if (total > 1) {
    pages.push(total);
  }

  return pages;
}

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onDownload,
}) {
  const pageButton =
    "flex h-11 min-w-11 items-center justify-center rounded-lg px-3 text-sm font-medium text-text-secondary transition hover:bg-primary-lighter hover:text-primary";

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const goTo = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange?.(page);
  };

  return (
    <div className="mt-3 space-y-8">
      <div className="flex min-w-0 items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-bg-page-white px-3 text-xs font-semibold text-text-secondary shadow-sm transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-text-secondary sm:gap-2 sm:px-4 sm:text-sm"
        >
          <ArrowLeft size={15} />
          មុននេះ
        </button>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-1 sm:gap-1.5">
          {pageNumbers.map((page, idx) =>
            page === "..." ? (
              <span key={`ellipsis-${idx}`} className={pageButton}>
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => goTo(page)}
                className={`${pageButton} ${
                  page === currentPage ? "bg-primary-lighter text-primary" : ""
                }`}
              >
                {page}
              </button>
            ),
          )}
        </div>

        <button
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-bg-page-white px-3 text-xs font-semibold text-text-secondary shadow-sm transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-text-secondary sm:gap-2 sm:px-4 sm:text-sm"
        >
          បន្ទាប់
          <ArrowRight size={15} />
        </button>
      </div>

    </div>
  );
}
