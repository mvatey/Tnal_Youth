"use client";

import { RiDownloadCloud2Line } from "react-icons/ri";
import { downloadExcel } from "@/utils/downloadExcel";
import FeedbackAlert from "@/components/ui/feedback/FeedbackAlert";
import { useState } from "react";

function formatExportValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return value;
}

// Exports under each column's on-screen Khmer header label (column.header),
// reading column.accessor off each row \u2014 not the row's raw object keys,
// which are internal field names (e.g. "fullNameKm") a downloaded file
// shouldn't expose as-is.
function buildExportRows(data, columns) {
  if (!Array.isArray(columns) || columns.length === 0) {
    return data.map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => [key, formatExportValue(value)]),
      ),
    );
  }

  return data.map((row) =>
    Object.fromEntries(
      columns.map((column) => [
        column.header || column.accessor,
        formatExportValue(
          column.exportValue ? column.exportValue(row) : row[column.accessor],
        ),
      ]),
    ),
  );
}

export default function DownloadButton({
  data = [],
  columns = [],
  filename = "export",
  onDownload,
}) {
  const [feedback, setFeedback] = useState("");

  const handleDownload = async () => {
    if (onDownload) {
      await onDownload();
      setFeedback("ការទាញយកបានជោគជ័យ");
      return;
    }

    if (!Array.isArray(data) || data.length === 0) return;

    downloadExcel({
      rows: buildExportRows(data, columns),
      fileName: filename.replace(/\.(csv|xlsx|pdf)$/i, ""),
    });
    setFeedback("ការទាញយកបានជោគជ័យ");
  };

  return (
    <>
      {feedback ? (
        <div className="fixed right-6 top-6 z-[100]">
          <FeedbackAlert message={feedback} onClose={() => setFeedback("")} />
        </div>
      ) : null}
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
    </>
  );
}
