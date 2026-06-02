import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { ImageToPdf } from "@/components/tools/shared/file-converters/ImageToPdf";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("image-to-pdf");
const tool = TOOLS.find((t) => t.slug === "image-to-pdf" && t.category === "image-tools")!;

const howToSteps = [
  "Drop one or more <strong>JPG, PNG, or WebP images</strong> onto the drop zone, or click to browse and select them from your device.",
  "Add additional images if needed — <strong>each image converts into its own separate PDF</strong> file.",
  "Click <strong>Convert</strong> to start the conversion process.",
  "Download each resulting <strong>PDF file</strong> individually once the conversion is complete.",
];

const faqs = [
  {
    question: "Does each image become a separate PDF?",
    answer:
      "Yes — <strong>each image produces its own PDF file</strong>. Download each one individually. If you need multiple images combined into a single PDF, convert them one at a time and use a PDF merge tool to combine the results.",
  },
  {
    question: "What image formats are supported?",
    answer:
      "<strong>JPG, JPEG, PNG, WebP, BMP, and TIFF</strong> are all supported as input formats.",
  },
  {
    question: "Is my file uploaded to a server?",
    answer:
      "Yes — conversion is handled server-side. Files are processed in an <strong>isolated temporary directory</strong> and deleted immediately after the converted PDF is sent back to your browser.",
  },
  {
    question: "Is there a file size limit?",
    answer:
      "Files up to <strong>50 MB per image</strong> are supported. For best results, use images at the resolution you need in the final PDF — very high resolution images will result in larger PDF files.",
  },
  {
    question: "What page size will the PDF be?",
    answer:
      "The PDF page is sized to <strong>match the image dimensions</strong>. The image is placed to fill the page, so the PDF will be the same proportions as the original image rather than a fixed paper size like A4.",
  },
  {
    question: "Why convert an image to PDF?",
    answer:
      "PDF is a universally accepted document format for <strong>sharing, printing, and archiving</strong>. Converting an image to PDF makes it easier to send as a formal document, attach to email in a standard format, or include in a multi-page document workflow.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Why Convert Images to PDF?",
    content: `<p><strong>PDF (Portable Document Format)</strong> is the standard format for sharing documents that need to look the same on any device or operating system. Unlike raw image files, PDFs are universally associated with documents and are expected by many workflows — including email attachments, form submissions, and archiving systems.</p>
<p>Converting an image to PDF is often required when a form asks for a document in PDF format, when you need to combine multiple image scans into a single file, or when you want to protect the image from being easily edited by the recipient.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Image-to-PDF conversion is a frequent task in many professional and personal contexts:</p>
<ul>
<li><strong>Document submission</strong> — submit photo IDs, utility bills, and scanned forms as PDFs to institutions that require the format</li>
<li><strong>Scanning workflows</strong> — convert phone-camera scans of receipts or documents into proper PDF files</li>
<li><strong>Invoice and report creation</strong> — turn image-based invoices into PDFs for email or accounting software</li>
<li><strong>Photo books and portfolios</strong> — package images into PDF documents for easy sharing and printing</li>
<li><strong>Archiving</strong> — convert images to PDF for long-term storage in document management systems</li>
</ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>To get the best quality PDFs from your images:</p>
<ul>
<li>Use <strong>higher resolution images</strong> (at least 150 DPI) if the PDF will be printed — low-resolution images look blurry when printed.</li>
<li>For scanned documents, ensure the image is <strong>well-lit, flat, and in focus</strong> before converting. Skewed or shadow-heavy scans are harder to read in PDF form.</li>
<li>If you need a <strong>compact PDF</strong>, compress the image first using the Image Compressor, then convert to PDF.</li>
<li>Use <strong>PNG for images with text or sharp edges</strong> (like screenshots or diagrams) to avoid compression artifacts — JPEG compression can make text look blurry.</li>
</ul>`,
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
