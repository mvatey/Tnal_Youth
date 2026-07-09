// components/table/DataTable.js
"use client";

import { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import { RiDownloadCloud2Line } from "react-icons/ri";
import Pagination from "@/components/dashboard/Pagination.js";

function downloadCsv(data, filename) {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const rows = data.map((row) => headers.map((h) => row[h]));

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename || "data.csv";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export default function DataTable({
  title,
  data = [],
  columns = [],
  filters = [],
  searchPlaceholder = "ស្វែងរក...",
  searchQuery = "",
  onSearchChange,
  actionButton,
  emptyMessage = "មិនមានទិន្នន័យត្រូវនឹងលក្ខខណ្ឌស្វែងរកទេ",
  pageSize = 6,
  filename = "data.csv",
}) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [data.length, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {title && (
        <h3 className="mb-4 text-lg font-semibold text-primary">
          {title}
        </h3>
      )}

      <div className="mb-4 flex items-center gap-4">
        {onSearchChange && (
          <div className="relative w-[42%]">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 w-full rounded-lg border border-gray-200 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        )}

        {filters.map((filter, index) => (
          <select
            key={index}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="h-9 w-[150px] rounded-lg border border-gray-200 px-3 text-xs text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">{filter.placeholder}</option>

            {filter.options.map((opt, optIndex) => (
              <option
                key={`${filter.placeholder}-${opt}-${optIndex}`}
                value={opt}
              >
                {opt}
              </option>
            ))}
          </select>
        ))}

        <div className="ml-auto shrink-0">
          <button
            onClick={() => downloadCsv(data, filename)}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-secondary px-5 text-xs font-bold text-white shadow-sm transition hover:bg-secondary-hover"
          >
            <RiDownloadCloud2Line size={18} />
            ទាញយក
          </button>
        </div>

        {actionButton && <div className="shrink-0">{actionButton}</div>}
      </div>

      <div className="w-full overflow-hidden">
        <table className="w-full table-fixed border-collapse text-sm">
          <colgroup>
            {columns.map((col, idx) => (
              <col key={idx} className={col.width || ""} />
            ))}
          </colgroup>

          <thead className="h-10 bg-white">
            <tr className="border border-gray-100 text-text-secondary">
              {columns.map((col, idx) => {
                const alignment =
                  col.align === "center"
                    ? "justify-center text-center"
                    : col.align === "right"
                    ? "justify-end text-right"
                    : "justify-start text-left";

                return (
                  <th key={idx} className="px-2 align-middle font-medium">
                    <div
                      className={`flex w-full min-w-0 items-center ${alignment}`}
                    >
                      <span className="block truncate">{col.header}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((item, itemIndex) => (
              <tr
                key={item.id || item.guest_id || itemIndex}
                className="h-9 border-b border-gray-100 hover:bg-bg-page-gray/50"
              >
                {columns.map((col, colIdx) => {
                  const globalIndex =
                    (currentPage - 1) * pageSize + itemIndex + 1;

                  const alignment =
                    col.align === "center"
                      ? "justify-center text-center"
                      : col.align === "right"
                      ? "justify-end text-right"
                      : "justify-start text-left";

                  return (
                    <td
                      key={colIdx}
                      className="overflow-hidden px-2 align-middle text-text-secondary"
                    >
                      <div
                        className={`flex w-full min-w-0 items-center ${alignment}`}
                      >
                        <div className="min-w-0 max-w-full truncate whitespace-nowrap">
                          {col.render
                            ? col.render(item, globalIndex)
                            : item[col.accessor]}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-8 text-center text-text-secondary"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}