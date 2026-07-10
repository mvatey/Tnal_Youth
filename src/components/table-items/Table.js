"use client";

import { useEffect, useMemo, useState } from "react";
import Pagination from "@/components/dashboard/Pagination";

export default function Table({ columns = [], data = [], emptyMessage = "មិនមានទិន្នន័យទេ", rowKey, rowsPerPage = 10 }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, currentPage, rowsPerPage]);

  return (
    <div>
      <div className="overflow-hidden rounded-sm border border-[#e5eaf0] bg-white">
        <table className="w-full table-fixed border-collapse">
          <thead className="bg-white">
            <tr className="h-[42px] border-b border-border text-[12px] text-text-secondary">
              {columns.map((column) => (
                <th key={column.key} style={{ width: column.width }} className={`px-3 py-2 align-middle font-medium ${column.align === "center" ? "text-center" : "text-left"} ${column.headerClassName || ""}`}>
                  <div className="truncate">{column.label}</div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {pagedData.length > 0 ? (
              pagedData.map((row, rowIndex) => {
                const realIndex = (currentPage - 1) * rowsPerPage + rowIndex;

                return (
                  <tr key={rowKey ? rowKey(row, realIndex) : row.id ?? realIndex} className="border-b border-border/70 text-[12px] hover:bg-bg-page-gray/50">
                    {columns.map((column) => (
                      <td key={column.key} className={`px-3 py-3 align-middle text-text-secondary ${column.align === "center" ? "text-center" : "text-left"} ${column.cellClassName || ""}`}>
                        <div className={column.truncate ? "truncate" : ""}>
                          {column.render ? column.render(row, realIndex) : row[column.key]}
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}