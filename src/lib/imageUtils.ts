import { SlideImage } from "./types";

export async function processImageFile(
  file: File,
  slideWidth: number,
  slideHeight: number
): Promise<SlideImage> {
  const dataUrl = await compressImage(file);
  const dimensions = await getImageDimensions(dataUrl);
  const aspectRatio = dimensions.width / dimensions.height;

  // Default: 400px wide, centered on slide
  const width = 400;
  const height = width / aspectRatio;
  const x = (slideWidth - width) / 2;
  const y = (slideHeight - height) / 2;

  return { dataUrl, x, y, width, height, aspectRatio };
}

function compressImage(file: File, maxDimension = 1200, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      const format = file.type === "image/png" ? "image/png" : "image/jpeg";
      const result = canvas.toDataURL(format, quality);
      URL.revokeObjectURL(img.src);
      resolve(result);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Failed to load image"));
    };
    img.src = URL.createObjectURL(file);
  });
}

function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = dataUrl;
  });
}

export async function removeImageBackground(dataUrl: string): Promise<string> {
  const { removeBackground } = await import("@imgly/background-removal");
  // Convert data URL to blob for the library
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const resultBlob = await removeBackground(blob, {
    output: { format: "image/png" },
  });
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(resultBlob);
  });
}
