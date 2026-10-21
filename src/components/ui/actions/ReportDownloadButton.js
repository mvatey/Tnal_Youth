"use client";

import { useState } from "react";
import { RiFileExcel2Line } from "react-icons/ri";

import FeedbackAlert from "@/components/ui/feedback/FeedbackAlert";
import { useLanguage } from "@/context/LanguageContext";

// The file name the backend chose (Content-Disposition's UTF-8 form, since
// the names are Khmer), falling back to the given one.
function fileNameFrom(response, fallback) {
  const header = response.headers.get("content-disposition") || "";
  const encoded = header.match(/filename\*=UTF-8''([^;]+)/i);

  if (encoded) {
    try {
      return decodeURIComponent(encoded[1]);
    } catch {
      return fallback;
    }
  }

  return fallback;
}

/*
 * Downloads a report the backend fills into the association's own template
 * (see ReportController). `path` is the backend path under /api/backend,
 * e.g. "reports/member-register?branchId=3".
 */
export default function ReportDownloadButton({
  path,
  label,
  fallbackFileName = "report.xlsx",
  Icon = RiFileExcel2Line,
}) {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleDownload = async () => {
    if (busy) return;

    setBusy(true);

    try {
      const response = await fetch(`/api/backend/${path}`, {
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || t("common.downloadFailed"));
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileNameFrom(response, fallbackFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setFeedback({ type: "success", message: t("common.downloadSuccess") });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || t("common.downloadFailed"),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {feedback ? (
        <div className="fixed right-6 top-6 z-[100]">
          <FeedbackAlert
            type={feedback.type}
            message={feedback.message}
            onClose={() => setFeedback(null)}
          />
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleDownload}
        disabled={busy}
        className="inline-flex h-[34px] items-center gap-2 rounded-lg bg-success px-4 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Icon size={15} />
        {label}
      </button>
    </>
  );
}
