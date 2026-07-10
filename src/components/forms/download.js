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

// Default CSV export, used when no custom onDownload is supplied.
function downloadCsv(data, filename) {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);

  const rows = data.map((row) => headers.map((h) => row[h]));

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename || "export.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onDownload,
  data,
  filename = "export.csv",
}) {
  const pageButton =
    "flex h-[34px] min-w-[34px] items-center justify-center rounded-lg px-2.5 text-sm font-medium text-text-secondary transition hover:bg-primary-lighter hover:text-primary";

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const goTo = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange?.(page);
  };

  const handleDownloadClick = () => {
    if (onDownload) {
      onDownload();
    } else {
      downloadCsv(data, filename);
    }
  };

  return (
    <div className="mt-3 flex flex-col gap-3 overflow-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex h-[34px] shrink-0 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-secondary shadow-sm transition hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-text-secondary"
        >
          <ArrowLeft size={15} />
          មុននេះ
        </button>

        <div className="flex flex-wrap items-center justify-center gap-1">
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
          className="inline-flex h-[34px] items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-secondary shadow-sm transition hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-text-secondary"
        >
          បន្ទាប់
          <ArrowRight size={15} />
        </button>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleDownloadClick}
          className="inline-flex h-[34px] items-center gap-2 rounded-lg bg-secondary px-4 text-xs font-bold text-white shadow-sm transition hover:bg-secondary-hover"
        >
          <Download size={15} />
          ទាញយក
        </button>
      </div>
    </div>
  );
}
