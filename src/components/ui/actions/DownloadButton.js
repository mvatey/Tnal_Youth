"use client";

import { RiDownloadCloud2Line } from "react-icons/ri";

function formatCsvValue(value) {
  if (value === null || value === undefined) return "";

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function downloadCsv(data, filename) {
  if (!Array.isArray(data) || data.length === 0) return;

  const headers = Object.keys(data[0]);

  const rows = data.map((row) =>
    headers.map((header) => formatCsvValue(row[header]))
  );

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => `"${cell.replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "export.csv";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export default function DownloadButton({
  data = [],
  filename = "export.csv",
  onDownload,
}) {
  const handleDownload = async () => {
    if (onDownload) {
      await onDownload();
      return;
    }

    downloadCsv(data, filename);
  };

  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={handleDownload}
        className="inline-flex h-[34px] items-center gap-2 rounded-lg bg-secondary px-4 text-xs font-bold text-white shadow-sm transition hover:bg-secondary-hover"
      >
        <RiDownloadCloud2Line size={15} />
        ទាញយក
      </button>
    </div>
  );
}