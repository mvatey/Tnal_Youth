"use client";

import { useRef } from "react";
import { FileText, Link2, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

function formatSize(bytes) {
  const size = Number(bytes);
  if (!Number.isFinite(size) || size <= 0) return "";
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MemberAttachmentField({ value, onChange, readOnly = false }) {
  const { t } = useLanguage();
  const inputRef = useRef(null);
  const selectedFile = value?.pendingFile;
  const fileName = selectedFile?.name || value?.originalName || value?.original_name || t("memberPage.attachedFileFallback");
  const fileSize = formatSize(selectedFile?.size || value?.sizeBytes || value?.size_bytes);
  const fileId = value?.id || value?.fileId;
  const href = fileId ? `/api/files/${fileId}/content` : value?.url || value?.filePath || value?.file_path;
  const hasFile = !value?.removeExisting && Boolean(selectedFile || fileId || href);

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onChange?.({ pendingFile: file });
          event.target.value = "";
        }}
      />

      {hasFile ? (
        <div className="inline-flex max-w-full items-center gap-2 rounded-lg border border-primary/20 bg-primary-light px-3 py-2 text-sm text-primary">
          <FileText size={17} className="shrink-0" />
          {href && !selectedFile ? (
            <a href={href} target="_blank" rel="noreferrer" className="max-w-[220px] truncate font-semibold hover:underline">
              {fileName}
            </a>
          ) : (
            <span className="max-w-[220px] truncate font-semibold">{fileName}</span>
          )}
          {fileSize && <span className="shrink-0 text-xs text-text-secondary">({fileSize})</span>}
          {!readOnly && (
            <button
              type="button"
              aria-label="Remove attachment"
              onClick={() => onChange?.({ removeExisting: true, removedFileId: fileId || null })}
              className="ml-1 flex size-6 shrink-0 items-center justify-center rounded-full text-error hover:bg-error-bg"
            >
              <X size={15} />
            </button>
          )}
        </div>
      ) : !readOnly ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-[34px] items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <Link2 size={17} />
          {t("memberPage.attachDocument")}
        </button>
      ) : (
        <span className="text-sm text-text-mute">{t("memberPage.noDocumentYet")}</span>
      )}
    </div>
  );
}
