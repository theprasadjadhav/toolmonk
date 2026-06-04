import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { ImageToPdf } from "@/components/tools/converters/file/ImageToPdf";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("image-to-pdf");

const tool = TOOLS.find((t) => t.slug === "image-to-pdf" && t.category === "converters")!;

const howToSteps = [
  "Drop one or more <strong>JPG, PNG, or WebP images</strong> onto the drop zone, or click to browse and select files from your device.",
  "Add more images if needed — <strong>each image will be converted to its own individual PDF file</strong>.",
  "Click <strong>Convert</strong> to process all selected images.",
  "Download each resulting <strong>PDF file</strong> individually using the download buttons.",
];

const faqs = [
  {
    question: "Does each image become a separate PDF?",
    answer:
      "Yes. Each image is converted to its <strong>own PDF file</strong>. Download each one individually using the download button next to it.",
  },
  {
    question: "What image formats are supported?",
    answer:
      "The tool accepts <strong>JPG, JPEG, PNG, WebP, BMP, and TIFF</strong> images as input.",
  },
  {
    question: "Is my file uploaded to a server?",
    answer:
      "Yes — conversion is processed <strong>server-side</strong>. Files are handled in an isolated temporary environment and <strong>deleted immediately</strong> after the converted PDF is returned to you. No files are stored.",
  },
  {
    question: "Is there a file size limit?",
    answer: "Files up to <strong>50 MB per image</strong> are supported.",
  },
  {
    question: "Will the PDF be the same size as my image?",
    answer:
      "The PDF page is sized to match the <strong>dimensions of the original image</strong>, so the image fills the page without cropping or letterboxing.",
  },
  {
    question: "Why convert an image to PDF?",
    answer:
      "PDF is a universally accepted format for sharing documents that need to look consistent across all devices and platforms. Converting images to PDF is useful for <strong>submitting documents</strong> (scanned forms, photos of receipts), creating <strong>printable pages</strong>, or combining multiple images into a portable format.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Why Convert Images to PDF?",
    content: `<p><strong>PDF (Portable Document Format)</strong> is the standard format for sharing files that need to display consistently on any device or operating system. Unlike image files, PDFs are not easily edited or resized accidentally — making them ideal for official documents, submissions, and archives.</p><p>Common reasons to convert an image to PDF include: submitting a scanned document or signed form, sharing a photo of a receipt or certificate in a format every email client can open, or preparing images for professional printing.</p>`,
  },
  {
    title: "About PDF Files",
    content: `<p>A <strong>PDF (Portable Document Format)</strong> file encapsulates text, fonts, images, and layout information in a single self-contained document. Originally developed to ensure documents look identical regardless of the software, hardware, or operating system used to view them, PDF has become the world's most widely used document format.</p><p>PDFs can contain multiple pages, embedded images, vector graphics, and searchable text. When you convert an image to PDF, the image is embedded as a page in the PDF document, preserving its original quality and dimensions.</p>`,
  },
];

export default function ImageToPdfPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <ImageToPdf />
    </ToolContainer>
  );
}
