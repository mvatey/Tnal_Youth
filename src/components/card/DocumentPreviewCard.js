"use client";

import { useRef, useState } from "react";
import {
  RiDownloadCloud2Line,
  RiPrinterLine,
} from "react-icons/ri";

import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

export default function DocumentPreviewCard({
  title,
  subtitle = "",
  children,

  filename = "document.pdf",

  previewClass = "",

  // "download" or "print"
  actionType = "download",

  downloadText = "ទាញយក",
  printText = "បោះពុម្ព",

  orientation = "landscape",
}) {
  const previewRef = useRef(null);

  const [downloading, setDownloading] =
    useState(false);

  const isPrintAction =
    actionType === "print";

  const handleAction = async () => {
    if (isPrintAction) {
      handlePrint();
      return;
    }

    await handleDownloadPdf();
  };

  const handleDownloadPdf = async () => {
    if (downloading) return;

    const previewElement =
      previewRef.current;

    if (!previewElement) {
      alert(
        "រកមិនឃើញឯកសារសម្រាប់ទាញយក។",
      );

      return;
    }

    setDownloading(true);

    try {
      await waitForFonts();
      await waitForImages(
        previewElement,
      );

      const contentElement =
        previewElement.querySelector(
          "[data-document-content]",
        );

      if (!contentElement) {
        throw new Error(
          "រកមិនឃើញមាតិកាឯកសារ។",
        );
      }

      const captureTarget =
        createFullSizeCapture(
          contentElement,
        );

      const captureElement =
        captureTarget.element;

      let canvas;

      try {
        canvas =
          await html2canvas(
          captureElement,
          {
            scale: 3,
            useCORS: true,
            allowTaint: false,
            backgroundColor:
              "#ffffff",
            logging: false,

            width:
              captureElement.scrollWidth,

            height:
              captureElement.scrollHeight,

            windowWidth:
              captureElement.scrollWidth,

            windowHeight:
              captureElement.scrollHeight,

            onclone: (
              clonedDocument,
            ) => {
              const clonedContent =
                clonedDocument.querySelector(
                  "[data-document-content]",
                );

              if (!clonedContent) {
                return;
              }

              clonedContent.style.transform =
                "none";

              clonedContent.style.width =
                `${captureElement.scrollWidth}px`;

              clonedContent.style.height =
                `${captureElement.scrollHeight}px`;

              clonedContent.style.maxWidth =
                "none";

              clonedContent.style.maxHeight =
                "none";

              clonedContent.style.overflow =
                "visible";

              clonedContent
                .querySelectorAll("*")
                .forEach((element) => {
                  const computed =
                    clonedDocument.defaultView?.getComputedStyle(
                      element,
                    );

                  if (
                    computed?.color?.includes(
                      "oklch",
                    )
                  ) {
                    element.style.color =
                      "#12224c";
                  }

                  if (
                    computed?.backgroundColor?.includes(
                      "oklch",
                    )
                  ) {
                    element.style.backgroundColor =
                      "#ffffff";
                  }

                  if (
                    computed?.borderColor?.includes(
                      "oklch",
                    )
                  ) {
                    element.style.borderColor =
                      "#d1d5db";
                  }
                });
            },
          },
        );
      } finally {
        captureTarget.cleanup();
      }

      if (
        !canvas.width ||
        !canvas.height
      ) {
        throw new Error(
          "មិនអាចបង្កើតរូបភាពសម្រាប់ PDF បានទេ។",
        );
      }

      const imageData =
        canvas.toDataURL(
          "image/png",
          1,
        );

      const pdf = new jsPDF({
        orientation,
        unit: "mm",
        format: "a4",
      });

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      const margin = 8;

      const availableWidth =
        pageWidth - margin * 2;

      const availableHeight =
        pageHeight - margin * 2;

      const imageRatio =
        canvas.width / canvas.height;

      let imageWidth =
        availableWidth;

      let imageHeight =
        imageWidth / imageRatio;

      if (
        imageHeight >
        availableHeight
      ) {
        imageHeight =
          availableHeight;

        imageWidth =
          imageHeight * imageRatio;
      }

      const imageX =
        (pageWidth - imageWidth) / 2;

      const imageY =
        (pageHeight - imageHeight) / 2;

      pdf.addImage(
        imageData,
        "PNG",
        imageX,
        imageY,
        imageWidth,
        imageHeight,
        undefined,
        "FAST",
      );

      pdf.save(
        ensurePdfFilename(
          filename,
        ),
      );
    } catch (error) {
      console.error(
        "Cannot download document PDF:",
        error,
      );

      alert(
        error?.message ||
          "មានបញ្ហាក្នុងការទាញយកឯកសារជា PDF។",
      );
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    const previewElement =
      previewRef.current;

    if (!previewElement) {
      return;
    }

    const contentElement =
      previewElement.querySelector(
        "[data-document-content]",
      );

    if (!contentElement) {
      return;
    }

    const printWindow =
      window.open(
        "",
        "_blank",
        "width=1100,height=800",
      );

    if (!printWindow) {
      alert(
        "កម្មវិធីរុករកបានរារាំងផ្ទាំងបោះពុម្ព។ សូមអនុញ្ញាត Pop-up ជាមុនសិន។",
      );

      return;
    }

    const styles = Array.from(
      document.querySelectorAll(
        'link[rel="stylesheet"], style',
      ),
    )
      .map(
        (styleElement) =>
          styleElement.outerHTML,
      )
      .join("\n");

    printWindow.document.open();

    printWindow.document.write(`
      <!DOCTYPE html>

      <html lang="km">
        <head>
          <meta charset="UTF-8" />

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1"
          />

          <title>${escapeHtml(
            title,
          )}</title>

          ${styles}

          <style>
            @page {
              size: landscape;
              margin: 10mm;
            }

            * {
              box-sizing: border-box;
            }

            html,
            body {
              margin: 0;
              padding: 0;
              background: white;
            }

            body {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family:
                "Noto Sans Khmer",
                "Kantumruy Pro",
                Arial,
                sans-serif;
            }

            .print-document-wrapper {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100%;
            }

            .print-document-wrapper > * {
              transform: none !important;
            }

            img {
              max-width: 100%;
            }

            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>

        <body>
          <div class="print-document-wrapper">
            ${contentElement.outerHTML}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();

    let alreadyPrinted = false;

    const startPrinting = () => {
      if (alreadyPrinted) {
        return;
      }

      alreadyPrinted = true;

      waitForPrintImages(
        printWindow,
      ).then(() => {
        printWindow.focus();
        printWindow.print();
      });
    };

    printWindow.onload =
      startPrinting;

    window.setTimeout(
      startPrinting,
      900,
    );
  };

  return (
    <div
      ref={previewRef}
      className="
        w-[380px]
        rounded-xl
        border
        border-gray-200
        border-t-4
        border-t-secondary
        bg-[#f8f9fc]
        p-3
        shadow-sm
      "
    >
      <h2 className="text-base font-bold text-primary">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-1 text-xs text-text-secondary">
          {subtitle}
        </p>
      )}

      <div
        className="
          mt-3
          flex
          h-[190px]
          w-full
          items-center
          justify-center
          overflow-hidden
          rounded-lg
          bg-white
          p-2
        "
      >
        <div
          data-document-content
          className={`
            flex
            items-center
            justify-center
            ${previewClass}
          `}
        >
          {children}
        </div>
      </div>

      <div className="mt-3 space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-text-secondary">
            ចេញនៅថ្ងៃ
          </span>

          <span className="font-semibold">
            ឯកសារ
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-text-secondary">
            លេខ
          </span>

          <span className="font-semibold">
            00009
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-text-secondary">
            ផុតកំណត់
          </span>

          <span className="font-semibold">
            30 មិថុនា 2026
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAction}
        disabled={downloading}
        className="
          mt-4
          flex
          h-[34px]
          w-full
          items-center
          justify-center
          gap-2
          rounded-lg
          bg-secondary
          text-xs
          font-semibold
          text-white
          transition
          hover:bg-secondary-hover
          active:scale-[0.99]
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {isPrintAction ? (
          <RiPrinterLine
            size={16}
          />
        ) : (
          <RiDownloadCloud2Line
            size={15}
          />
        )}

        {isPrintAction
          ? printText
          : downloading
            ? "កំពុងបង្កើត PDF..."
            : downloadText}
      </button>
    </div>
  );
}

function createFullSizeCapture(
  previewContent,
) {
  const sourceDocument =
    previewContent.firstElementChild ||
    previewContent;

  const sourceRect =
    sourceDocument.getBoundingClientRect();

  const sourceWidth = Math.max(
    sourceDocument.scrollWidth,
    sourceDocument.offsetWidth,
    sourceRect.width,
    1,
  );

  const sourceHeight = Math.max(
    sourceDocument.scrollHeight,
    sourceDocument.offsetHeight,
    sourceRect.height,
    1,
  );

  const host =
    document.createElement("div");

  host.setAttribute(
    "data-pdf-capture-host",
    "true",
  );

  Object.assign(host.style, {
    position: "fixed",
    left: "-100000px",
    top: "0",
    width: `${sourceWidth}px`,
    height: `${sourceHeight}px`,
    overflow: "visible",
    background: "#ffffff",
    transform: "none",
    zIndex: "-1",
  });

  const clone =
    sourceDocument.cloneNode(true);

  clone.setAttribute(
    "data-document-content",
    "true",
  );

  Object.assign(clone.style, {
    width: `${sourceWidth}px`,
    minWidth: `${sourceWidth}px`,
    maxWidth: "none",
    height: `${sourceHeight}px`,
    minHeight: `${sourceHeight}px`,
    maxHeight: "none",
    overflow: "visible",
    transform: "none",
    transformOrigin: "top left",
  });

  host.appendChild(clone);
  document.body.appendChild(host);

  return {
    element: clone,
    cleanup: () => host.remove(),
  };
}

function ensurePdfFilename(
  filename,
) {
  const cleanFilename =
    String(
      filename ||
        "document",
    ).trim();

  if (
    cleanFilename
      .toLowerCase()
      .endsWith(".pdf")
  ) {
    return cleanFilename;
  }

  const filenameWithoutExtension =
    cleanFilename.replace(
      /\.[^/.]+$/,
      "",
    );

  return `${filenameWithoutExtension}.pdf`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll(
      '"',
      "&quot;",
    )
    .replaceAll(
      "'",
      "&#039;",
    );
}

async function waitForFonts() {
  if (
    typeof document ===
      "undefined" ||
    !document.fonts?.ready
  ) {
    return;
  }

  try {
    await document.fonts.ready;
  } catch (error) {
    console.warn(
      "Cannot wait for fonts:",
      error,
    );
  }
}

async function waitForImages(
  element,
) {
  const images = Array.from(
    element.querySelectorAll(
      "img",
    ),
  );

  if (
    images.length === 0
  ) {
    return;
  }

  await Promise.all(
    images.map((image) => {
      if (
        image.complete &&
        image.naturalWidth > 0
      ) {
        return Promise.resolve();
      }

      return new Promise(
        (resolve) => {
          let finished = false;

          const finish = () => {
            if (finished) {
              return;
            }

            finished = true;

            image.removeEventListener(
              "load",
              finish,
            );

            image.removeEventListener(
              "error",
              finish,
            );

            resolve();
          };

          image.addEventListener(
            "load",
            finish,
          );

          image.addEventListener(
            "error",
            finish,
          );

          window.setTimeout(
            finish,
            3000,
          );
        },
      );
    }),
  );
}

async function waitForPrintImages(
  printWindow,
) {
  const images = Array.from(
    printWindow.document.images,
  );

  await Promise.all(
    images.map(
      (image) =>
        new Promise(
          (resolve) => {
            if (image.complete) {
              resolve();
              return;
            }

            image.onload = resolve;
            image.onerror = resolve;
          },
        ),
    ),
  );
}
