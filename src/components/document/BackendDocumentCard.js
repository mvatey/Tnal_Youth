"use client";

import { Eye, FileText } from "lucide-react";

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

export default function BackendDocumentCard({ document, onView }) {
  const previewDocument = toPreviewDocument(document);
  const isImage = IMAGE_TYPES.has(previewDocument.type);
  const isPdf = previewDocument.type === "PDF";

  const openPreview = () => onView?.(previewDocument);

  return (
    <article className="flex min-h-[420px] min-w-0 flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <button
        type="button"
        onClick={openPreview}
        aria-label={`មើលឯកសារ ${previewDocument.fileName}`}
        className="group relative flex h-[230px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 transition hover:border-primary"
      >
        <span className="absolute right-3 top-3 z-10 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
          {previewDocument.type}
        </span>

        {isImage ? (
          <img
            src={previewDocument.fileUrl}
            alt={document?.title || previewDocument.fileName}
            className="h-full max-h-[250px] w-full object-contain"
          />
        ) : isPdf ? (
          <iframe
            src={`${previewDocument.fileUrl}#page=1&view=FitH&toolbar=0&navpanes=0`}
            title={previewDocument.fileName}
            className="pointer-events-none h-[250px] w-full border-0 bg-white"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
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

      <div className="space-y-2 px-1 py-4 text-sm">
        <div className="flex min-w-0 items-center justify-between gap-4">
          <span className="shrink-0 text-gray-500">ឈ្មោះឯកសារ</span>
          <strong className="truncate text-right text-gray-900">
            {document?.title || "ឯកសារសមាជិក"}
          </strong>
        </div>
        <div className="flex min-w-0 items-center justify-between gap-4">
          <span className="shrink-0 text-gray-500">ឯកសារ</span>
          <strong className="truncate text-right text-gray-900">
            {previewDocument.fileName}
          </strong>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-500">ទំហំ</span>
          <strong className="text-gray-900">{previewDocument.size}</strong>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-500">កាលបរិច្ឆេទ</span>
          <strong className="text-gray-900">{previewDocument.date}</strong>
        </div>
      </div>

      <button
        type="button"
        onClick={openPreview}
        className="mt-auto flex h-11 items-center justify-center gap-2 rounded-lg bg-primary font-semibold text-white transition hover:bg-primary/90"
      >
        <Eye size={18} />
        មើលឯកសារ
      </button>
    </article>
  );
}
