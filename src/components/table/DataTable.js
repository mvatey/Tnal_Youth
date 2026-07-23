"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

import FormSelect from "@/components/forms/FormSelect.js";
import FormDate from "@/components/forms/FormDate.js";

import Pagination from "@/components/navigation/Pagination";
import DownloadButton from "@/components/forms/download";

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
  downloadFilename = "table-data.csv",
}) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [data.length, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  const safePage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * pageSize;

    return data.slice(start, start + pageSize);
  }, [data, safePage, pageSize]);

  const getAlignment = (align) => {
    if (align === "center") return "text-center";

    if (align === "right") return "text-right";

    return "text-left";
  };

  return (
    <div className="w-full">
      {(title || onSearchChange || filters.length > 0 || actionButton) && (
        <div className="mb-4 rounded-lg border border-[#e5eaf0] bg-white p-4">
          {title && (
            <h3
              className="
              mb-4
              text-lg
              font-semibold
              text-text-primary
              "
            >
              {title}
            </h3>
          )}

          <div
            className="
            flex
            flex-wrap
            items-center
            gap-3
            "
          >
            {onSearchChange && (
              <div
                className="
                relative
                min-w-[220px]
                flex-1
                "
              >
                <Search
                  className="
                  absolute
                  left-3
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  text-text-secondary
                  "
                />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="
                  h-10
                  w-full
                  rounded-lg
                  border
                  border-gray-200
                  bg-white
                  pl-9
                  pr-4
                  text-sm
                  outline-none
                  transition
                  focus:border-primary
                  "
                />
              </div>
            )}

            {filters.map((filter, index) => (
              <div key={index} className="min-w-[140px]">
                {filter.type === "date" ? (
                  <FormDate
                    value={filter.value}
                    onChange={(event) => filter.onChange(event.target.value)}
                  />
                ) : (
                  <FormSelect
                    name={filter.name || `filter-${index}`}
                    value={filter.value}
                    onChange={(event) => filter.onChange(event.target.value)}
                    placeholder={filter.placeholder}
                    options={filter.options || []}
                    disabled={filter.disabled || false}
                  />
                )}
              </div>
            ))}

            {actionButton && <div className="ml-auto">{actionButton}</div>}
          </div>
        </div>
      )}

      <div
        className="
        overflow-x-auto
        rounded-sm
        border
        border-[#e5eaf0]
        bg-white
        "
      >
        <table
          className="
          w-full
          min-w-[980px]
          table-fixed
          border-collapse
          text-sm
          "
        >
          <colgroup>
            {columns.map((column, index) => (
              <col key={index} className={column.width || ""} />
            ))}
          </colgroup>

          <thead className="bg-[#f8fafc]">
            <tr
              className="
              border-b
              border-[#e5eaf0]
              "
            >
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`
                    h-11
                    px-4
                    text-xs
                    font-semibold
                    text-text-secondary
                    ${getAlignment(column.align)}
                    `}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, itemIndex) => {
                const globalIndex = (safePage - 1) * pageSize + itemIndex + 1;

                return (
                  <tr
                    key={item.id ?? itemIndex}
                    className="
                      border-b
                      border-[#edf0f3]
                      transition
                      last:border-b-0
                      hover:bg-bg-page-gray/60
                      "
                  >
                    {columns.map((column, columnIndex) => (
                      <td
                        key={columnIndex}
                        className={`
                            h-12
                            overflow-hidden
                            px-4
                            text-text-secondary
                            ${getAlignment(column.align)}
                            `}
                      >
                        <div className="min-w-0 truncate">
                          {column.render
                            ? column.render(item, globalIndex)
                            : (item[column.accessor] ?? "-")}
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="
                  px-4
                  py-10
                  text-center
                  text-sm
                  text-gray-400
                  "
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data.length > 0 && (
        <div className="mt-3">
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />

          <div
            className="
            mt-3
            flex
            justify-end
            "
          >
            <DownloadButton data={data} filename={downloadFilename} />
          </div>
        </div>
      )}
    </div>
  );
}
