import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

export async function downloadAsPdf(
  element,
  filename = "certificate.pdf"
) {
  if (!element) {
    throw new Error("The certificate element was not found.");
  }

  try {
    const width = element.scrollWidth;
    const height = element.scrollHeight;

    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio: 3,
      backgroundColor: "#ffffff",
      width,
      height,
      style: {
        width: `${width}px`,
        height: `${height}px`,
        overflow: "visible",
        transform: "none",
      },
    });

    const orientation = width > height ? "landscape" : "portrait";

    const pdf = new jsPDF({
      orientation,
      unit: "px",
      format: [width, height],
      hotfixes: ["px_scaling"],
    });

    pdf.addImage(dataUrl, "PNG", 0, 0, width, height);

    pdf.save(
      filename.endsWith(".pdf")
        ? filename
        : `${filename}.pdf`
    );
  } catch (error) {
    console.error("Failed to download certificate:", error);
    throw error;
  }
}