import { ArrowLeft, ArrowRight, Download } from "lucide-react";

export default function Pagination() {
  const pageButton =
    "flex h-11 min-w-11 items-center justify-center rounded-lg px-3 text-sm font-medium text-text-secondary transition hover:bg-primary-lighter hover:text-primary";

  return (
    <div className="mt-3 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-text-secondary shadow-sm transition hover:border-primary hover:text-primary">
          <ArrowLeft size={15} />
          មុននេះ
        </button>

        <div className="flex items-center justify-center gap-1.5">
          {[1, 2, 3].map((page) => (
            <button key={page} className={`${pageButton} ${page === 1 ? "bg-primary-lighter text-primary" : ""}`}>
              {page}
            </button>
          ))}
          <span className={pageButton}>...</span>
          {[8, 9, 10].map((page) => (
            <button key={page} className={pageButton}>
              {page}
            </button>
          ))}
        </div>

        <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-text-secondary shadow-sm transition hover:border-primary hover:text-primary">
          បន្ទាប់
          <ArrowRight size={15} />
        </button>
      </div>

      <div className="flex justify-end">
        <button className="inline-flex h-9 items-center gap-2 rounded-lg bg-secondary px-5 text-xs font-bold text-white shadow-sm transition hover:bg-secondary-hover">
          <Download size={15} />
          ទាញយក
        </button>
      </div>
    </div>
  );
}
