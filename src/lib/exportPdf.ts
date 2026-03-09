import { toPng, toJpeg } from "html-to-image";
import { jsPDF } from "jspdf";

export type ExportQuality = "high" | "medium" | "low";

interface QualityConfig {
  pixelRatio: number;
  format: "PNG" | "JPEG";
  jpegQuality: number;
  label: string;
  description: string;
}

export const EXPORT_QUALITIES: Record<ExportQuality, QualityConfig> = {
  high: {
    pixelRatio: 2,
    format: "JPEG",
    jpegQuality: 0.92,
    label: "High",
    description: "Best quality (~4-8 MB)",
  },
  medium: {
    pixelRatio: 1,
    format: "JPEG",
    jpegQuality: 0.92,
    label: "Medium",
    description: "Good quality (~1-2 MB)",
  },
  low: {
    pixelRatio: 1,
    format: "JPEG",
    jpegQuality: 0.7,
    label: "Low",
    description: "Smallest file (~0.5 MB)",
  },
};

export async function exportCarouselAsPdf(
  slideElements: HTMLElement[],
  filename: string = "linkedin-carousel",
  quality: ExportQuality = "high"
) {
  const config = EXPORT_QUALITIES[quality];
  const firstEl = slideElements[0];
  const slideWidth = firstEl.offsetWidth;
  const slideHeight = firstEl.offsetHeight;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [slideWidth, slideHeight],
  });

  const toImage = config.format === "PNG" ? toPng : toJpeg;

  for (let i = 0; i < slideElements.length; i++) {
    const el = slideElements[i];

    const dataUrl = await toImage(el, {
      width: slideWidth,
      height: slideHeight,
      pixelRatio: config.pixelRatio,
      quality: config.jpegQuality,
      cacheBust: true,
      style: {
        transform: "scale(1)",
        transformOrigin: "top left",
      },
    });

    if (i > 0) {
      pdf.addPage([slideWidth, slideHeight]);
    }

    pdf.addImage(dataUrl, config.format, 0, 0, slideWidth, slideHeight);
  }

  pdf.save(`${filename}.pdf`);
}

export async function exportSlideAsPng(
  slideElement: HTMLElement,
  filename: string = "slide"
) {
  const dataUrl = await toPng(slideElement, {
    width: 1080,
    height: 1080,
    pixelRatio: 2,
    cacheBust: true,
    style: {
      transform: "scale(1)",
      transformOrigin: "top left",
    },
  });

  const link = document.createElement("a");
  link.download = `${filename}.png`;
  link.href = dataUrl;
  link.click();
}
