"use client";

import { useState } from "react";
import { RiDownloadCloud2Line } from "react-icons/ri";
import FeedbackAlert from "@/components/ui/feedback/FeedbackAlert";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function PdfDownloadButton({
  targetRef,
  elementId = "",
  filename = "document.pdf",
  orientation = "landscape",
  buttonText = "ទាញយក",
  disabled = false,
}) {
  const [downloading, setDownloading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleDownload =
    async () => {
      if (
        downloading ||
        disabled
      ) {
        return;
      }

      const element =
        targetRef?.current ||
        (
          elementId
            ? document.getElementById(
                elementId,
              )
            : null
        );

      if (!element) {
        alert(
          "រកមិនឃើញឯកសារសម្រាប់ទាញយក។",
        );

        return;
      }

      setDownloading(true);
      setFeedback("");

      try {
        await waitForImages(
          element,
        );

        const canvas =
          await html2canvas(
            element,
            {
              scale: 3,

              useCORS: true,

              allowTaint: false,

              backgroundColor:
                "#ffffff",

              width:
                element.scrollWidth,

              height:
                element.scrollHeight,

              windowWidth:
                element.scrollWidth,

              windowHeight:
                element.scrollHeight,
            },
          );

        const imageData =
          canvas.toDataURL(
            "image/png",
            1,
          );

        const pdf =
          new jsPDF({
            orientation,

            unit: "px",

            format: [
              canvas.width,
              canvas.height,
            ],

            hotfixes: [
              "px_scaling",
            ],
          });

        pdf.addImage(
          imageData,
          "PNG",
          0,
          0,
          canvas.width,
          canvas.height,
          undefined,
          "FAST",
        );

        pdf.save(ensurePdfFilename(filename));
        setFeedback("ការទាញយកបានជោគជ័យ");
      } catch (error) {
        console.error(
          "PDF download failed:",
          error,
        );

        setFeedback("មានបញ្ហាក្នុងការទាញយកឯកសារ PDF។");
      } finally {
        setDownloading(false);
      }
    };

  return (
    <>
      {feedback ? (
        <div className="fixed right-6 top-6 z-[100]">
          <FeedbackAlert message={feedback} onClose={() => setFeedback("")} />
        </div>
      ) : null}
      <button
        type="button"
        onClick={handleDownload}
        disabled={disabled || downloading}
        className="flex h-[34px] w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 text-xs font-semibold text-white transition hover:bg-secondary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RiDownloadCloud2Line size={15} />
        {downloading ? "កំពុងបង្កើត PDF..." : buttonText}
      </button>
    </>
  );
}

function ensurePdfFilename(
  filename,
) {
  const cleanFilename =
    String(
      filename ||
        "document",
    ).trim();

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
  const images =
    Array.from(
      element.querySelectorAll(
        "img",
      ),
    );

  await Promise.all(
    images.map(
      (image) =>
        new Promise(
          (resolve) => {
            if (
              image.complete &&
              image.naturalWidth >
                0
            ) {
              resolve();
              return;
            }

            const finish =
              () => {
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
        ),
    ),
    );
    </>
  );
}
