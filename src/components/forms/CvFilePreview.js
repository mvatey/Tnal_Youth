"use client";

import { FileText, ExternalLink } from "lucide-react";

/*
 * Renders whatever's currently picked/saved for a CV/document field.
 *
 * Deliberately only trusts `mimeType` to decide how to render, never the
 * filename's extension -- an existing (already-saved) file previously had
 * no real filename to go on at all (callers used to fall back to a
 * placeholder like "CV #53", which obviously has no extension), so
 * anything that wasn't detected as an image fell through to an <iframe>
 * pointed straight at the raw file. That works fine for a PDF, but for
 * anything else (a .docx, in particular) the browser has no built-in
 * renderer for it -- the iframe just showed the file's raw, unreadable
 * bytes. Only PDFs get the iframe treatment now; everything else that
 * isn't an image gets a plain "here's the file, open it" card instead,
 * which is honest about what can and can't be shown inline.
 *
 * `fileUrl` must be the direct content URL (e.g. /api/files/{id}/content
 * or a local blob: URL for a not-yet-saved pick) -- also used as the
 * "open in a new tab" link, so the file is always reachable one click
 * away regardless of whether an inline preview is even attempted.
 */
export default function CvFilePreview({ fileUrl, fileName, mimeType }) {
  if (!fileUrl) return null;

  const isImage = (mimeType || "").startsWith("image/");
  const isPdf = (mimeType || "") === "application/pdf";

  return (
    <div className="flex h-[260px] w-full flex-col overflow-hidden rounded-lg border border-border bg-bg-page-white">
      <div className="min-h-0 flex-1">
        {isImage ? (
          <img
            src={fileUrl}
            alt={fileName || ""}
            className="h-full w-full object-contain"
          />
        ) : isPdf ? (
          <iframe
            src={`${fileUrl}#view=FitH`}
            title={fileName || "document"}
            className="h-full w-full border-0"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center">
            <FileText size={32} className="text-text-secondary" />
            <p className="max-w-full truncate text-xs text-text-secondary" title={fileName}>
              {fileName}
            </p>
          </div>
        )}
      </div>

      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex shrink-0 items-center justify-center gap-1.5 border-t border-border py-2 text-xs font-medium text-primary transition hover:bg-bg-page-gray"
      >
        <ExternalLink size={13} />
        មើលឯកសារពេញ
      </a>
    </div>
  );
}
