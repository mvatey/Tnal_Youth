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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-text-secondary">
                <th className="w-16 py-3 px-2">ល.រ</th>
                <th className="py-3 px-2">ឈ្មោះកម្មវិធី</th>
                <th className="py-3 px-2">វិស័យ</th>
                <th className="py-3 px-2">ប្រភេទ</th>
                <th className="py-3 px-2">សកម្មភាព</th>
                <th className="py-3 px-2">ទីតាំង</th>
                <th className="py-3 px-2">ថ្ងៃចូលរួម</th>
                <th className="w-32 py-3 px-2">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((item, i) => (
                <tr
                  key={item.id ?? `participation-${i}`}
                  className="border-b border-gray-50 hover:bg-bg-page-gray/50"
                >
                  <td className="py-3 px-2 text-text-secondary">
                    {(currentPage - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td className="py-3 px-2 text-text-primary font-medium">
                    {item.activity}
                  </td>
                  <td className="py-3 px-2 text-text-secondary">
                    {item.sector}
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs ${
                        TYPE_BADGE_STYLES[item.type] ||
                        "bg-gray-100 text-text-secondary"
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs ${
                        STATUS_BADGE_STYLES[item.status] ||
                        "bg-gray-100 text-text-secondary"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-text-secondary">
                    <div>{item.location?.city}</div>
                    <div className="text-xs text-text-secondary/70">
                      {item.location?.district}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-text-secondary">{item.date}</td>
                  <td className="py-3 px-2">
                    <button
                      onClick={() => handleViewDetail(item)}
                      className="flex items-center gap-1 bg-primary text-white text-xs font-medium px-3 py-1.5 rounded-full hover:opacity-90 transition"
                    >
                      លម្អិត
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 text-center text-text-secondary"
                  >
                    មិនមានទិន្នន័យត្រូវនឹងលក្ខខណ្ឌស្វែងរកទេ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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