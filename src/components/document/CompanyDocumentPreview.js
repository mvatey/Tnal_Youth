"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DownloadCloud,
  Expand,
  FileText,
  LoaderCircle,
  X,
} from "lucide-react";

const IMAGE_TYPES = new Set(["JPG", "JPEG", "PNG", "GIF", "WEBP", "BMP", "SVG"]);
const TEXT_TYPES = new Set(["TXT", "CSV", "JSON", "XML", "MD"]);

function getDocumentType(document) {
  const declaredType = String(document?.type || "").toUpperCase();
  const fileName = document?.fileName || document?.files?.[0]?.name || "";
  const extension = fileName.includes(".")
    ? fileName.split(".").pop().toUpperCase()
    : "";

  return extension || declaredType || "FILE";
}

function getFileName(document, type) {
  const existingName = document?.fileName || document?.files?.[0]?.name;
  if (existingName) return existingName;

  const title = document?.title || "document";
  return type === "FILE" ? title : `${title}.${type.toLowerCase()}`;
}

function documentHtml(body) {
  return `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          html { background: #f3f4f6; }
          body {
            box-sizing: border-box;
            max-width: 900px;
            min-height: 100vh;
            margin: 0 auto;
            padding: 40px 52px;
            background: white;
            color: #1f2937;
            font-family: Arial, "Khmer OS Battambang", sans-serif;
            line-height: 1.55;
            overflow-wrap: anywhere;
          }
          img { max-width: 100%; height: auto; }
          table { width: 100%; border-collapse: collapse; }
          td, th { border: 1px solid #d1d5db; padding: 6px; }
          pre { white-space: pre-wrap; }
          @media (max-width: 640px) { body { padding: 24px; } }
        </style>
      </head>
      <body>${body}</body>
    </html>`;
}

export default function CompanyDocumentPreview({ document, onClose }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewState, setPreviewState] = useState("idle");

  const type = useMemo(() => getDocumentType(document), [document]);
  const fileName = useMemo(() => getFileName(document, type), [document, type]);
  const fileUrl = document?.fileUrl || document?.image;
  const isImage = IMAGE_TYPES.has(type);
  const isPdf = type === "PDF";
  const isDocx = type === "DOCX";
  const isText = TEXT_TYPES.has(type);
  const hasInlinePreview = isImage || isPdf || isDocx || isText;

  useEffect(() => {
    if (!document || !fileUrl || (!isDocx && !isText)) {
      setPreviewHtml("");
      setPreviewState("idle");
      return undefined;
    }

    const controller = new AbortController();

    async function loadPreview() {
      setPreviewState("loading");
      setPreviewHtml("");

      try {
        const response = await fetch(fileUrl, { signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load document");

        if (isDocx) {
          const mammothModule = await import("mammoth/mammoth.browser");
          const mammoth = mammothModule.default || mammothModule;
          const result = await mammoth.convertToHtml({
            arrayBuffer: await response.arrayBuffer(),
          });
          setPreviewHtml(documentHtml(result.value || "<p>Empty document</p>"));
        } else {
          const text = await response.text();
          const escaped = text
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;");
          setPreviewHtml(documentHtml(`<pre>${escaped}</pre>`));
        }

        setPreviewState("ready");
      } catch (error) {
        if (error.name !== "AbortError") setPreviewState("error");
      }
    }

    loadPreview();
    return () => controller.abort();
  }, [document, fileUrl, isDocx, isText]);

  useEffect(() => {
    if (!document) return undefined;

    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (isExpanded) setIsExpanded(false);
      else onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [document, isExpanded, onClose]);

  if (!document) return null;

  const handleDownload = async () => {
    if (!fileUrl) return;

    const response = await fetch(fileUrl);
    if (!response.ok) return;

    const blobUrl = window.URL.createObjectURL(await response.blob());
    const link = window.document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    window.document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  };

  const preview = (expanded = false) => {
    if (!fileUrl) return <EmptyPreview message="មិនមានឯកសារសម្រាប់មើល" />;

    if (isPdf) {
      return (
        <iframe
          src={`${fileUrl}#view=FitH`}
          title={fileName}
          className="h-full w-full border-0 bg-bg-page-white"
        />
      );
    }

    if (isImage) {
      return (
        <img
          src={fileUrl}
          alt={document.title || fileName}
          className="h-full w-full object-contain"
        />
      );
    }

    if (isDocx || isText) {
      if (previewState === "loading") {
        return (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-text-mute">
            <LoaderCircle className="animate-spin" size={34} />
            <span className="text-sm">កំពុងបើកឯកសារ...</span>
          </div>
        );
      }

      if (previewState === "ready") {
        return (
          <iframe
            srcDoc={previewHtml}
            sandbox=""
            title={fileName}
            className="h-full w-full border-0 bg-bg-page-white"
          />
        );
      }

      if (previewState === "error") {
        return <EmptyPreview message="មិនអាចបង្ហាញឯកសារនេះបាន" />;
      }
    }

    return (
      <EmptyPreview
        message={
          expanded
            ? "ប្រភេទឯកសារនេះត្រូវទាញយកដើម្បីបើកមើល"
            : "ចុចទាញយកដើម្បីបើកឯកសារនេះ"
        }
      />
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose}>
        <div className="fixed bottom-0 left-64 right-0 top-16 flex items-center justify-center p-4">
          <div
            onClick={(event) => event.stopPropagation()}
            className="relative w-[560px] max-w-full rounded-2xl bg-bg-page-white p-5 shadow-xl"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close document preview"
              className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full hover:bg-bg-page-gray"
            >
              <X size={17} />
            </button>

            <h2 className="mb-4 text-lg font-bold text-primary">ឯកសារ</h2>

            <div className="mb-4 grid grid-cols-2 gap-x-5 gap-y-3 rounded-xl bg-bg-page-gray p-4">
              <Info label="ឈ្មោះឯកសារ" value={document.title} />
              <Info label="សាខា" value={document.branch} />
              <Info label="កាលបរិច្ឆេទ" value={document.date} />
              <Info label="ទំហំ" value={document.size} />
              <Info label="ប្រភេទឯកសារ" value={type} />
            </div>

            <div
              role={hasInlinePreview ? "button" : undefined}
              tabIndex={hasInlinePreview ? 0 : undefined}
              onClick={() => hasInlinePreview && setIsExpanded(true)}
              onKeyDown={(event) => {
                if (hasInlinePreview && (event.key === "Enter" || event.key === " ")) {
                  event.preventDefault();
                  setIsExpanded(true);
                }
              }}
              className={`group relative flex h-[280px] w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-bg-page-gray ${
                hasInlinePreview ? "cursor-pointer" : "cursor-default"
              }`}
              title={hasInlinePreview ? "ចុចដើម្បីមើលពេញអេក្រង់" : undefined}
            >
              <div className="h-full w-full pointer-events-none">{preview()}</div>
              {hasInlinePreview && (
                <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white opacity-90 shadow transition group-hover:opacity-100">
                  <Expand size={15} />
                  មើលទំហំពេញ
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleDownload}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-white hover:opacity-90"
            >
              <DownloadCloud size={16} />
              ទាញយក
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-black/85 p-4 sm:p-6">
          <div className="mb-3 flex items-center justify-between gap-4 text-white">
            <div className="min-w-0">
              <p className="truncate font-semibold">{document.title || fileName}</p>
              <p className="text-xs text-white/70">{type} · {document.size}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="flex h-10 items-center gap-2 rounded-lg bg-white/15 px-4 text-sm hover:bg-white/25"
              >
                <DownloadCloud size={17} />
                ទាញយក
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                aria-label="Close full document view"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 hover:bg-white/25"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden rounded-xl bg-bg-page-white shadow-2xl">
            {preview(true)}
          </div>
        </div>
      )}
    </>
  );
}

function EmptyPreview({ message }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-text-mute">
      <FileText size={50} />
      <span className="px-4 text-center text-sm">{message}</span>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-text-mute">{label}</p>
      <p className="truncate text-sm font-medium text-text-secondary">{value || "-"}</p>
    </div>
  );
}
