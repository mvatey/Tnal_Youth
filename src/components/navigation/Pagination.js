import { ArrowLeft, ArrowRight } from "lucide-react";

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
  className = "mt-3 space-y-8",
}) {
  const pageButton =
    "flex h-11 min-w-11 items-center justify-center rounded-lg px-3 text-sm font-medium text-text-secondary transition hover:bg-primary-lighter hover:text-primary";

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const goTo = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange?.(page);
  };

  return (
    <div className={className}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-text-secondary shadow-sm transition hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-text-secondary"
        >
          <ArrowLeft size={15} />
          មុននេះ
        </button>

        <div className="flex items-center justify-center gap-1.5">
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
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-text-secondary shadow-sm transition hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-text-secondary"
        >
          បន្ទាប់
          <ArrowRight size={15} />
        </button>
      </div>

    </div>
  );
}
