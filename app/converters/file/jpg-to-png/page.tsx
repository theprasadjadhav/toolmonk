import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { JpgToPng } from "@/components/tools/converters/file/JpgToPng";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("jpg-to-png");

const tool = TOOLS.find((t) => t.slug === "jpg-to-png")!;

const howToSteps = [
  "Drop one or more <strong>JPG or JPEG images</strong> onto the drop zone, or click to browse your device for files.",
  "Click <strong>Convert</strong> to convert all selected images to <strong>PNG format</strong> in one batch.",
  "Download each <strong>PNG file</strong> individually using the download button next to each result.",
];

const faqs = [
  {
    question: "Why convert JPG to PNG?",
    answer:
      "<strong>PNG is a lossless format</strong> that supports transparency (transparent backgrounds). Use it for logos, icons, UI graphics, screenshots, and any image where you need <strong>pixel-perfect quality</strong> or a transparent background. JPG does not support transparency.",
  },
  {
    question: "Will quality be lost?",
    answer:
      "The output PNG is <strong>lossless</strong> — no additional quality loss occurs during conversion. However, any compression artifacts already present in the source JPG are baked in and cannot be removed by converting to PNG.",
  },
  {
    question: "Can I convert multiple files at once?",
    answer:
      "Yes. Select or drag <strong>multiple JPG files</strong> and they will all be converted in one batch, each producing its own PNG download.",
  },
  {
    question: "Does my image leave my device?",
    answer:
      "No. Conversion happens <strong>entirely in your browser</strong> using the device's built-in image processing capabilities. Your images are never uploaded to any server.",
  },
  {
    question: "Will the PNG file be larger than the JPG?",
    answer:
      "Usually yes. PNG uses lossless compression, which typically produces <strong>larger files than JPG</strong> for photographic images. For non-photographic content (logos, screenshots, flat illustrations), the size difference is smaller.",
  },
  {
    question: "When should I keep the JPG format instead?",
    answer:
      "Keep JPG for <strong>photographs and complex images</strong> where file size matters and transparency is not needed. JPG compression is much more efficient for photos than PNG.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About JPG Files",
    content: `<p><strong>JPG (JPEG)</strong> is the most widely used image format for photographs and complex images. It uses lossy compression — meaning some image data is discarded to achieve smaller file sizes. The compression level is adjustable: higher compression = smaller file but more visible artifacts.</p><p>JPG is ideal for photos and images with smooth color gradients, but it does not support transparent backgrounds. Each time you save a JPG, it is re-compressed and quality degrades slightly.</p>`,
  },
  {
    title: "About PNG Files",
    content: `<p><strong>PNG (Portable Network Graphics)</strong> is a lossless image format that preserves every pixel exactly as it was saved. It supports full transparency (alpha channel), making it the preferred format for logos, icons, screenshots, and UI graphics where a clean background is required.</p><p>PNG files are typically larger than JPGs for photographic content, but the quality never degrades when saved — you can open, edit, and re-save a PNG repeatedly without any quality loss.</p>`,
  },
  {
    title: "JPG vs. PNG — Which Format to Use",
    content: `<p>Choosing between JPG and PNG depends on the content and use case:</p><ul><li><strong>Use JPG</strong> for photographs, product images, and any complex image where file size is important and transparency is not needed</li><li><strong>Use PNG</strong> for logos, icons, UI elements, screenshots, illustrations, and any image that needs a transparent background</li><li><strong>Convert JPG to PNG</strong> when you need to place a photograph on a different background and require a transparent layer, or when you need to do further editing without quality loss</li></ul>`,
  },
];

export default function JpgToPngPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <JpgToPng />
    </ToolContainer>
  );
}
