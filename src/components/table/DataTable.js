"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Search } from "lucide-react";

import FormSelect from "@/components/forms/FormSelect.js";
import FormDate from "@/components/forms/FormDate.js";
import DateRangePicker from "@/components/forms/DateRangePicker.js";
import Pagination from "@/components/navigation/Pagination";
import DownloadButton from "@/components/ui/actions/DownloadButton";

export default function DataTable({
  title,
  data = [],
  columns = [],
  filters = [],
  searchPlaceholder = "ស្វែងរក...",
  searchQuery = "",
  onSearchChange,
  actionButton,
  onDownload,
  emptyMessage = "មិនមានទិន្នន័យត្រូវនឹងលក្ខខណ្ឌស្វែងរកទេ",
  pageSize = 10,
  // Every table shares this 900px floor by default, but a table with
  // fewer/narrower columns (e.g. participation history) doesn't need
  // that much room -- forcing it anyway pushes the last column off the
  // visible card on common laptop widths, forcing a horizontal scroll
  // just to reach it. Lower this per-table instead of changing the
  // shared default, which other tables' columns do actually need.
  minTableWidth = 900,
}) {
  const [currentPage, setCurrentPage] =
    useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [data.length, searchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(data.length / pageSize),
  );

  const safePage = Math.min(
    currentPage,
    totalPages,
  );

  const paginatedData = useMemo(() => {
    const start =
      (safePage - 1) * pageSize;

    return data.slice(
      start,
      start + pageSize,
    );
  }, [data, safePage, pageSize]);

  const getAlignment = (align) => {
    if (align === "center") {
      return "text-center";
    }

    if (align === "right") {
      return "text-right";
    }

    return "text-left";
  };

  const showToolbar =
    title ||
    onSearchChange ||
    filters.length > 0 ||
    actionButton;

  return (
    <div className="w-full min-w-0">
      {showToolbar && (
        <div
          className="
            mb-4
            w-full
            min-w-0
            rounded-lg
            border
            border-border
            bg-bg-page-white
            p-3
            sm:p-4
          "
        >
          {title && (
            <h3
              className="
                mb-4
                text-base
                font-semibold
                text-text-primary
                sm:text-lg
              "
            >
              {title}
            </h3>
          )}

          <div
            className="
              flex
              w-full
              min-w-0
              flex-col
              gap-3
              xl:flex-row
              xl:items-center
            "
          >
            {/* Search and filters */}
            <div
              className="
                flex
                min-w-0
                flex-1
                flex-col
                gap-3
                md:flex-row
                md:flex-nowrap
                md:items-center
              "
            >
              {/* Search */}
              {onSearchChange && (
                <div
                  className="
                    relative
                    w-full
                    min-w-0
                    md:min-w-[140px]
                    md:max-w-[220px]
                    md:flex-1
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
                    onChange={(event) =>
                      onSearchChange(
                        event.target.value,
                      )
                    }
                    placeholder={
                      searchPlaceholder
                    }
                    className="
                      h-[38px]
                      w-full
                      min-w-0
                      rounded-lg
                      border
                      border-border
                      bg-bg-page-white
                      pl-9
                      pr-3
                      text-sm
                      text-text-primary
                      outline-none
                      transition
                      placeholder:text-text-mute
                      focus:border-primary
                    "
                  />
                </div>
              )}

              {/* Filters */}
              {filters.length > 0 && (
                <div
                  className="
                    grid
                    w-full
                    min-w-0
                    grid-cols-1
                    gap-3
                    overflow-x-visible
                    sm:grid-cols-2
                    lg:grid-cols-3
                    xl:flex
                    xl:w-auto
                    xl:flex-nowrap
                    xl:items-center
                    xl:overflow-x-auto
                  "
                >
                  {filters.map(
                    (filter, index) => {
                      const filterName =
                        filter.name ||
                        `filter-${index}`;

                      const widthClass =
                        filter.type === "daterange"
                          ? "w-full xl:w-[240px]"
                          : filter.type === "date"
                            ? "w-full xl:w-[280px]"
                            : "w-full xl:w-[210px]";

                      return (
                        <div
                          key={filterName}
                          className={`min-w-0 ${widthClass}`}
                        >
                          {filter.type === "daterange" ? (
                            <DateRangePicker
                              name={filterName}
                              value={filter.value}
                              onChange={filter.onChange}
                              placeholder={filter.placeholder}
                              disabled={filter.disabled || false}
                            />
                          ) : filter.type ===
                          "date" ? (
                            <FormDate
                              name={
                                filterName
                              }
                              value={
                                filter.value
                              }
                              onChange={(
                                event,
                              ) =>
                                filter.onChange(
                                  event.target
                                    .value,
                                )
                              }
                            />
                          ) : (
                            <FormSelect
                              name={
                                filterName
                              }
                              value={
                                filter.value
                              }
                              onChange={(
                                event,
                              ) =>
                                filter.onChange(
                                  event.target
                                    .value,
                                )
                              }
                              placeholder={
                                filter.placeholder
                              }
                              options={
                                filter.options ||
                                []
                              }
                              disabled={
                                filter.disabled ||
                                false
                              }
                            />
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </div>

            {/* Action button */}
{actionButton && (
  <div
    className="
      flex
      h-[34px]
      w-full
      max-w-[220px]
      shrink-0
      items-center
      justify-center
      self-start
      xl:w-[180px]
      xl:self-auto
    "
  >
    <div
      className="
        flex
        h-full
        w-full
        items-center
        justify-center
        [&>button]:h-full
        [&>button]:w-full
        [&>button]:justify-center
      "
    >
      {actionButton}
    </div>
  </div>
)}
          </div>
        </div>
      )}

      {/* Responsive table */}
      <div
        className="
          w-full
          min-w-0
          overflow-hidden
          rounded-lg
          border
          border-border
          bg-bg-page-white
        "
      >
        <div
          className="
            w-full
            overflow-x-auto
            overscroll-x-contain
          "
        >
          <table
            className="
              w-full
              table-fixed
              border-collapse
              text-sm
            "
            style={{ minWidth: `${minTableWidth}px` }}
          >
            <colgroup>
              {columns.map(
                (column, index) => (
                  <col
                    key={index}
                    className={
                      column.width || ""
                    }
                  />
                ),
              )}
            </colgroup>

            <thead className="bg-bg-page-gray">
              <tr className="border-b border-border">
                {columns.map(
                  (column, index) => (
                    <th
                      key={index}
                      className={`
                        whitespace-nowrap
                        px-3
                        py-2.5
                        text-xs
                        font-semibold
                        text-text-secondary
                        ${getAlignment(
                          column.align,
                        )}
                      `}
                    >
                      {column.header}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody>
              {paginatedData.length >
              0 ? (
                paginatedData.map(
                  (item, itemIndex) => {
                    const globalIndex =
                      (safePage - 1) *
                        pageSize +
                      itemIndex +
                      1;

                    return (
                      <tr
                        key={
                          item.id ??
                          itemIndex
                        }
                        className="
                          border-b
                          border-border
                          transition
                          last:border-b-0
                          hover:bg-bg-page-gray/60
                        "
                      >
                        {columns.map(
                          (
                            column,
                            columnIndex,
                          ) => (
                            <td
                              key={
                                columnIndex
                              }
                              className={`
                                h-12
                                overflow-hidden
                                px-3
                                text-text-secondary
                                sm:px-4
                                ${getAlignment(
                                  column.align,
                                )}
                              `}
                            >
                              <div className="min-w-0 truncate">
                                {column.render
                                  ? column.render(
                                      item,
                                      globalIndex,
                                    )
                                  : (item[
                                      column
                                        .accessor
                                    ] ?? "-")}
                              </div>
                            </td>
                          ),
                        )}
                      </tr>
                    );
                  },
                )
              ) : (
                <tr>
                  <td
                    colSpan={Math.max(
                      columns.length,
                      1,
                    )}
                    className="
                      px-4
                      py-10
                      text-center
                      text-sm
                      text-text-mute
                    "
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination and download */}
      {data.length > 0 && (
        <div
          className="
            mt-3
            flex
            w-full
            min-w-0
            flex-col
            gap-3
          "
        >
          <div className="w-full min-w-0 overflow-x-auto">
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={
                setCurrentPage
              }
            />
          </div>

          <div
            className="
              flex
              w-full
              justify-center
              sm:justify-end
            "
          >
            {onDownload && (
              <DownloadButton
                onDownload={onDownload}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}