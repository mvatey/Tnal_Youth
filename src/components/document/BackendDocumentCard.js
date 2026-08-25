"use client";

import { Eye, FileText, Trash2 } from "lucide-react";

const IMAGE_TYPES = new Set([
  "JPG",
  "JPEG",
  "PNG",
  "GIF",
  "WEBP",
  "BMP",
  "SVG",
]);

function getFileType(document, fileName) {
  if (fileName.includes(".")) {
    return fileName.split(".").pop().toUpperCase();
  }

  return String(document?.file?.mimeType || "")
    .split("/")
    .pop()
    .toUpperCase();
}

function getBranchName(document) {
  return (
    document?.branch?.name_km ||
    document?.branch?.nameKm ||
    document?.branch?.name_en ||
    document?.branch?.nameEn ||
    "-"
  );
}

function getCreatedDate(document) {
  const value = document?.created_at || document?.createdAt;
  return value ? String(value).slice(0, 10) : "-";
}

function getFileSize(document) {
  const sizeKb = Number(document?.file?.sizeKb);
  return Number.isFinite(sizeKb) ? `${sizeKb.toFixed(1)} KB` : "-";
}

export function toPreviewDocument(document) {
  const fileName =
    document?.file?.originalName || document?.title || "document";
  const type = getFileType(document, fileName) || "FILE";

  return {
    ...document,
    type,
    fileName,
    fileUrl: document?.file?.id
      ? `/api/backend/files/${document.file.id}/content`
      : document?.file?.url,
    branch: getBranchName(document),
    date: getCreatedDate(document),
    size: getFileSize(document),
  };
}

export default function BackendDocumentCard({ document, onView, onDelete }) {
  const previewDocument = toPreviewDocument(document);
  const isImage = IMAGE_TYPES.has(previewDocument.type);
  const isPdf = previewDocument.type === "PDF";

  const openPreview = () => onView?.(previewDocument);

  return (
    <article className="group relative flex w-full min-w-0 flex-col rounded-xl border border-border border-t-4 border-t-secondary bg-bg-page-white p-3 shadow-sm sm:max-w-[380px]">
      {onDelete ? (
        <button
          type="button"
          onClick={() => onDelete(document)}
          aria-label="លុបឯកសារ"
          title="លុប"
          className="absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-md transition hover:bg-red-600 group-hover:opacity-100 group-focus-within:opacity-100"
        >
          <Trash2 size={15} strokeWidth={2.5} />
        </button>
      ) : null}

      <h2 className="truncate text-base font-bold text-primary">
        {document?.title || "ឯកសារសមាជិក"}
      </h2>

      <button
        type="button"
        onClick={openPreview}
        aria-label={`មើលឯកសារ ${previewDocument.fileName}`}
        className="group relative mt-3 flex h-[190px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-bg-page-white p-2 transition hover:ring-1 hover:ring-primary"
      >
        <span className="absolute right-3 top-3 z-10 rounded-full bg-bg-page-white/95 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
          {previewDocument.type}
        </span>

        {isImage ? (
          <img
            src={previewDocument.fileUrl}
            alt={document?.title || previewDocument.fileName}
            className="h-full w-full object-contain"
          />
        ) : isPdf ? (
          <iframe
            src={`${previewDocument.fileUrl}#page=1&view=FitH&toolbar=0&navpanes=0`}
            title={previewDocument.fileName}
            className="pointer-events-none h-full w-full border-0 bg-bg-page-white"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 text-text-mute">
            <FileText size={52} strokeWidth={1.5} />
            <span className="text-sm">ចុចដើម្បីមើលឯកសារ</span>
          </div>
        )}

        <span className="absolute inset-0 flex items-center justify-center bg-primary/0 text-white opacity-0 transition group-hover:bg-primary/20 group-hover:opacity-100">
          <span className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold shadow">
            <Eye size={17} />
            មើលឯកសារ
          </span>
        </span>
      </button>

      <div className="mt-3 space-y-2 text-xs">
        <div className="flex min-w-0 items-center justify-between gap-4">
          <span className="shrink-0 text-text-mute">ឯកសារ</span>
          <strong className="truncate text-right text-text-primary">
            {previewDocument.fileName}
          </strong>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-text-mute">កាលបរិច្ឆេទ</span>
          <strong className="text-text-primary">{previewDocument.date}</strong>
        </div>
      </div>

      <button
        type="button"
        onClick={openPreview}
        className="mt-4 flex h-[34px] w-full items-center justify-center gap-2 rounded-lg bg-secondary text-xs font-semibold text-white transition hover:bg-secondary-hover active:scale-[0.99]"
      >
        <Eye size={16} />
        មើលឯកសារ
      </button>
    </article>
  );
}
