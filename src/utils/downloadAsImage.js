import { toPng } from "html-to-image";

async function waitForImage(image) {
  if (image.complete && image.naturalWidth > 0) {
    return;
  }

  await new Promise((resolve) => {
    const finish = () => resolve();

    image.addEventListener("load", finish, { once: true });
    image.addEventListener("error", finish, { once: true });
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () =>
      reject(new Error("Failed to convert image to Base64."));

    reader.readAsDataURL(blob);
  });
}

async function convertImageToDataUrl(image) {
  const originalSrc = image.currentSrc || image.src;

  if (!originalSrc) {
    return null;
  }

  // The image is already safe for html-to-image.
  if (
    originalSrc.startsWith("data:") ||
    originalSrc.startsWith("blob:")
  ) {
    return null;
  }

  try {
    const response = await fetch(originalSrc, {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Failed to load image: ${response.status} ${response.statusText}`
      );
    }

    const blob = await response.blob();
    const dataUrl = await blobToDataUrl(blob);

    return {
      image,
      originalSrc: image.getAttribute("src"),
      originalSrcSet: image.getAttribute("srcset"),
      dataUrl,
    };
  } catch (error) {
    console.error(
      "Could not prepare image for download:",
      originalSrc,
      error
    );

    return null;
  }
}

async function prepareImages(element) {
  const images = Array.from(element.querySelectorAll("img"));

  await Promise.all(images.map(waitForImage));

  const convertedImages = await Promise.all(
    images.map(convertImageToDataUrl)
  );

  const validImages = convertedImages.filter(Boolean);

  validImages.forEach(({ image, dataUrl }) => {
    // Remove srcset because Next.js may otherwise select the optimized URL.
    image.removeAttribute("srcset");
    image.src = dataUrl;
  });

  await Promise.all(images.map(waitForImage));

  return validImages;
}

function restoreImages(convertedImages) {
  convertedImages.forEach(
    ({ image, originalSrc, originalSrcSet }) => {
      if (originalSrc !== null) {
        image.setAttribute("src", originalSrc);
      }

      if (originalSrcSet !== null) {
        image.setAttribute("srcset", originalSrcSet);
      }
    }
  );
}

export async function downloadAsImage(
  element,
  filename = "member-card.png"
) {
  if (!element) {
    throw new Error("The card element was not found.");
  }

  let convertedImages = [];

  try {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    // Convert the member profile and other card images to Base64.
    convertedImages = await prepareImages(element);

    const width = element.scrollWidth;
    const height = element.scrollHeight;

    const dataUrl = await toPng(element, {
      cacheBust: false,
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

    const link = document.createElement("a");

    link.download = filename.toLowerCase().endsWith(".png")
      ? filename
      : `${filename}.png`;

    link.href = dataUrl;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Failed to download member card:", error);
    throw error;
  } finally {
    // Restore the original image URLs after downloading.
    restoreImages(convertedImages);
  }
}