import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DocumentPagination({
  currentPage,
  totalPages,
  setCurrentPage,
}) {
  return (
    <div className="flex shrink-0 items-center justify-between border-t bg-white p-3">
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((prev) => prev - 1)}
        className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>

      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              currentPage === page
                ? "bg-[#f1f5f9] font-semibold text-gray-900"
                : "text-gray-600"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        disabled={currentPage === totalPages || totalPages === 0}
        onClick={() => setCurrentPage((prev) => prev + 1)}
        className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-40"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}