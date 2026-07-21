// components/dashboard/DataTable.js
"use client";
import { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import Pagination from "@/components/forms/download.js";

/**
 * Reusable DataTable component reflecting your precise layout design
 * 
 * @param {string} title - Table header text (e.g., "បញ្ជីសមាជិក")
 * @param {Array} data - Raw array of objects to display
 * @param {Array} columns - Array defining your column settings:
 *    { 
 *      header: "Title", 
 *      width: "w-[100px]", 
 *      align: "center"|"left"|"right",
 *      render: (item, index) => JSX // optional custom cell styling
 *      accessor: "keyName" // optional direct key picker if no render fn
 *    }
 * @param {Array} filters - Dynamic filters configuration:
 *    {
 *      value: selectedValue,
 *      onChange: (val) => void,
 *      options: ["Option 1", "Option 2"],
 *      placeholder: "Select Something"
 *    }
 * @param {string} searchPlaceholder - Placeholder for search bar
 * @param {string} searchQuery - Current search state string
 * @param {function} onSearchChange - Callback when text changes
 * @param {ReactNode} actionButton - Top right primary button slot (e.g., "Add Member")
 * @param {string} emptyMessage - Text to show when no entries found
 * @param {number} pageSize - Limit of rows per page (default: 10)
 */
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
  pageSize = 10,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination to first page if search queries or filters alter the data array size
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  // Slice down your exact pagination chunk
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      {/* Table Header/Title */}
      {title && (
        <h3 className="font-semibold text-text-primary mb-4 text-lg">
          {title}
        </h3>
      )}

      {/* Dynamic Toolbar Layer */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Universal Search Bar */}
        {onSearchChange && (
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        )}

        {/* Dynamic Filters Loop */}
        {filters.map((filter, index) => (
          <select
            key={index}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">{filter.placeholder}</option>
            {filter.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ))}

        {/* Dynamic Top Right Action Button Slot */}
        {actionButton && <div className="ml-auto">{actionButton}</div>}
      </div>

      {/* Table Shell with explicit fixed sizing setup matching your original layout */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            {columns.map((col, idx) => (
              <col key={idx} className={col.width || ""} />
            ))}
          </colgroup>
          <thead>
            <tr className="text-text-secondary border-b border-gray-100">
              {columns.map((col, idx) => {
                let alignment = "text-left";
                if (col.align === "center") alignment = "text-center";
                if (col.align === "right") alignment = "text-right";
                
                return (
                  <th key={idx} className={`py-3 px-2 font-medium ${alignment}`}>
                    {col.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, itemIndex) => (
              <tr
                key={item.id || itemIndex}
                className="border-b border-gray-50 hover:bg-bg-page-gray/50"
              >
                {columns.map((col, colIdx) => {
                  let alignment = "text-left";
                  if (col.align === "center") alignment = "text-center";
                  if (col.align === "right") alignment = "text-right";

                  // Global row entry sequential indexing rule (ល.រ)
                  const globalIndex = (currentPage - 1) * pageSize + itemIndex + 1;

                  return (
                    <td
                      key={colIdx}
                      className={`py-3 px-2 text-text-secondary truncate ${alignment}`}
                    >
                      {col.render
                        ? col.render(item, globalIndex)
                        : item[col.accessor]}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Empty Array Fallback Screen State */}
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

      {/* Pagination Integration */}
      {data.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}
    </div>
  );
}