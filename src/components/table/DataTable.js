"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronDown, Search, CalendarDays } from "lucide-react";
import participationData from "@/data/participation.json";
import Pagination from "@/components/forms/download";

const PAGE_SIZE = 10;

// Badge styles for the "ប្រភេទ" (type) column
const TYPE_BADGE_STYLES = {
  កម្មវិធីផ្ទៃក្នុង: "bg-primary-light text-primary",
  កម្មវិធីខាងក្រៅ: "bg-success-bg text-success",
};

// Badge styles for the "សកម្មភាព" (participation status) column
const STATUS_BADGE_STYLES = {
  បានចូលរួម: "bg-success-bg text-success",
  មិនបានចូលរួម: "bg-error-bg text-error",
};

function DataTable({ columns, data, rowKey, emptyMessage }) {
  if (!data?.length) {
    return <div className="text-sm text-text-secondary">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-3 py-3 text-left font-medium text-text-secondary"
                style={column.width ? { width: column.width } : undefined}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowKey ? rowKey(row, rowIndex) : rowIndex} className="border-t border-gray-100">
              {columns.map((column) => {
                const content = column.render
                  ? column.render(row, rowIndex)
                  : row[column.key];

                return (
                  <td key={`${rowIndex}-${column.key}`} className="px-3 py-3 align-top">
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ParticipationPage() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const types = useMemo(
    () => [...new Set(participationData.map((item) => item.type))],
    [],
  );

  const filtered = useMemo(() => {
    return participationData.filter((item) => {
      const matchesQuery = item.activity
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesType = !typeFilter || item.type === typeFilter;
      const matchesDate = !dateFilter || item.date === dateFilter;
      return matchesQuery && matchesType && matchesDate;
    });
  }, [query, typeFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [query, typeFilter, dateFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const handleDownload = () => {
    const headers = [
      "ល.រ",
      "ឈ្មោះកម្មវិធី",
      "វិស័យ",
      "ប្រភេទ",
      "សកម្មភាព",
      "ទីតាំង",
      "ថ្ងៃចូលរួម",
    ];

    const rows = filtered.map((item, i) => [
      i + 1,
      item.activity,
      item.sector,
      item.type,
      item.status,
      `${item.location?.city ?? ""} ${item.location?.district ?? ""}`.trim(),
      item.date,
    ]);

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
    link.setAttribute("download", "participation.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleViewDetail = (item) => {
    // Hook this up to your router / modal as needed
    console.log("View detail for:", item);
  };

  const columns = [
    {
      key: "index",
      header: "ល.រ",
      width: "64px",
      render: (_row, rowIndex) => (currentPage - 1) * PAGE_SIZE + rowIndex + 1,
    },
    {
      key: "activity",
      header: "ឈ្មោះកម្មវិធី",
      cellClassName: "text-text-primary font-medium",
    },
    {
      key: "sector",
      header: "វិស័យ",
    },
    {
      key: "type",
      header: "ប្រភេទ",
      render: (row) => (
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs whitespace-nowrap ${
            TYPE_BADGE_STYLES[row.type] || "bg-gray-100 text-text-secondary"
          }`}
        >
          {row.type}
        </span>
      ),
    },
    {
      key: "status",
      header: "សកម្មភាព",
      render: (row) => (
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs whitespace-nowrap ${
            STATUS_BADGE_STYLES[row.status] || "bg-gray-100 text-text-secondary"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "location",
      header: "ទីតាំង",
      render: (row) => (
        <>
          <div>{row.location?.city}</div>
          <div className="text-xs text-text-secondary/70">
            {row.location?.district}
          </div>
        </>
      ),
    },
    {
      key: "date",
      header: "ថ្ងៃចូលរួម",
    },
    {
      key: "actions",
      header: "សកម្មភាព",
      width: "128px",
      render: (row) => (
        <button
          onClick={() => handleViewDetail(row)}
          className="flex items-center gap-1 bg-primary text-white text-xs font-medium px-3 py-1.5 rounded-full hover:opacity-90 transition"
        >
          លម្អិត
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary">
          ប្រវត្តិការចូលរួមសកម្មភាព
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          បង្ហាញសកម្មភាព និងកិច្ចប្រជុំដែលសមាជិកបានចូលរួម។
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ស្វែងរក..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Type filter */}
          <div className="relative w-48">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option key="type-placeholder" value="">
                ប្រភេទ
              </option>
              {types.map((t) => (
                <option key={`type-${t}`} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>

          {/* Date filter */}
          <div className="relative w-48">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <CalendarDays className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <DataTable
          columns={columns}
          data={paginated}
          rowKey={(row, i) => row.id ?? `participation-${i}`}
          emptyMessage="មិនមានទិន្នន័យត្រូវនឹងលក្ខខណ្ឌស្វែងរកទេ"
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
}