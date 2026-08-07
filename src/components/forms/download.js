"use client";

import { useState } from "react";
import { RiDownloadCloud2Line } from "react-icons/ri";

import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

export default function DownloadButton({
  targetRef,
  filename = "table-data.pdf",
  buttonText = "ទាញយក",
  disabled = false,
}) {
  const [downloading, setDownloading] =
    useState(false);

  const handleDownload = async () => {
    if (downloading || disabled) {
      return;
    }

    const targetElement =
      targetRef?.current;

    if (!targetElement) {
      alert(
        "រកមិនឃើញតារាងសម្រាប់ទាញយក។",
      );

      return;
    }

    setDownloading(true);

    try {
      await waitForImages(
        targetElement,
      );

      await waitForFonts();

      const originalOverflow =
        targetElement.style.overflow;

      const originalWidth =
        targetElement.style.width;

      const originalMaxWidth =
        targetElement.style.maxWidth;

      targetElement.style.overflow =
        "visible";

      targetElement.style.width =
        `${targetElement.scrollWidth}px`;

      targetElement.style.maxWidth =
        "none";

      const canvas =
        await html2canvas(
          targetElement,
          {
            scale: 2,

            useCORS: true,

            allowTaint: false,

            backgroundColor:
              "#ffffff",

            logging: false,

            width:
              targetElement.scrollWidth,

            height:
              targetElement.scrollHeight,

            windowWidth:
              targetElement.scrollWidth,

            windowHeight:
              targetElement.scrollHeight,

            scrollX: 0,

            scrollY:
              -window.scrollY,

            onclone: (
              clonedDocument,
            ) => {
              const clonedTable =
                clonedDocument.querySelector(
                  "[data-pdf-table]",
                );

              if (!clonedTable) {
                return;
              }

              clonedTable.style.overflow =
                "visible";

              clonedTable.style.width =
                `${targetElement.scrollWidth}px`;

              clonedTable.style.maxWidth =
                "none";

              clonedTable.style.height =
                "auto";

              clonedTable.style.maxHeight =
                "none";

              const table =
                clonedTable.querySelector(
                  "table",
                );

              if (table) {
                table.style.width =
                  `${targetElement.scrollWidth}px`;

                table.style.maxWidth =
                  "none";
              }

              clonedTable
                .querySelectorAll("*")
                .forEach((element) => {
                  const computedStyle =
                    clonedDocument.defaultView?.getComputedStyle(
                      element,
                    );

                  if (
                    computedStyle?.color?.includes(
                      "oklch",
                    )
                  ) {
                    element.style.color =
                      "#374151";
                  }

                  if (
                    computedStyle?.backgroundColor?.includes(
                      "oklch",
                    )
                  ) {
                    element.style.backgroundColor =
                      "#ffffff";
                  }

                  if (
                    computedStyle?.borderColor?.includes(
                      "oklch",
                    )
                  ) {
                    element.style.borderColor =
                      "#e5e7eb";
                  }
                });
            },
          },
        );

      targetElement.style.overflow =
        originalOverflow;

      targetElement.style.width =
        originalWidth;

      targetElement.style.maxWidth =
        originalMaxWidth;

      if (
        !canvas.width ||
        !canvas.height
      ) {
        throw new Error(
          "PDF canvas is empty.",
        );
      }

      const imageData =
        canvas.toDataURL(
          "image/jpeg",
          0.95,
        );

      const pageWidth = 1120;

      const pageHeight = 790;

      const scaledImageHeight =
        (
          canvas.height *
          pageWidth
        ) / canvas.width;

      const pdf = new jsPDF({
        orientation:
          "landscape",

        unit: "px",

        format: [
          pageWidth,
          pageHeight,
        ],

        hotfixes: [
          "px_scaling",
        ],
      });

      let remainingHeight =
        scaledImageHeight;

      let imagePosition = 0;

      pdf.addImage(
        imageData,
        "JPEG",
        0,
        imagePosition,
        pageWidth,
        scaledImageHeight,
        undefined,
        "FAST",
      );

      remainingHeight -=
        pageHeight;

      while (
        remainingHeight > 0
      ) {
        imagePosition -=
          pageHeight;

        pdf.addPage(
          [
            pageWidth,
            pageHeight,
          ],
          "landscape",
        );

        pdf.addImage(
          imageData,
          "JPEG",
          0,
          imagePosition,
          pageWidth,
          scaledImageHeight,
          undefined,
          "FAST",
        );

        remainingHeight -=
          pageHeight;
      }

      pdf.save(
        ensurePdfFilename(
          filename,
        ),
      );
    } catch (error) {
      console.error(
        "Cannot download table PDF:",
        error,
      );

      alert(
        error?.message ||
          "មានបញ្ហាក្នុងការទាញយកតារាងជា PDF។",
      );
    } finally {
      setDownloading(false);
    }
  };

  const cannotDownload =
    downloading || disabled;

  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={
          handleDownload
        }
        disabled={
          cannotDownload
        }
        className="
          inline-flex
          h-[34px]
          items-center
          justify-center
          gap-2
          rounded-lg
          bg-secondary
          px-4
          text-xs
          font-bold
          text-white
          shadow-sm
          transition
          hover:bg-secondary-hover
          active:scale-[0.99]
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        <RiDownloadCloud2Line
          size={15}
        />

        {downloading
          ? "កំពុងបង្កើត PDF..."
          : buttonText}
      </button>
    </div>
  );
}

function ensurePdfFilename(
  filename,
) {
  const cleanFilename =
    String(
      filename ||
        "table-data",
    ).trim();

  if (
    cleanFilename
      .toLowerCase()
      .endsWith(".pdf")
  ) {
    return cleanFilename;
  }

  const withoutExtension =
    cleanFilename.replace(
      /\.[^/.]+$/,
      "",
    );

  return `${withoutExtension}.pdf`;
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
      "Could not wait for fonts:",
      error,
    );
  }
}