import { toPng } from "html-to-image";

export async function downloadAsImage(element, filename = "document.png") {
  if (!element) {
    throw new Error("រកមិនឃើញផ្នែករូបភាពសម្រាប់ទាញយកទេ។");
  }

  try {
    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio: 3,
      backgroundColor: "#a53232",
    });

    const link = document.createElement("a");
    link.download = filename.endsWith(".png")
      ? filename
      : `${filename}.png`;

    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error("Failed to download image:", error);
    throw error;
  }
}
