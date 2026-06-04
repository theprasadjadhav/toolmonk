import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { PdfToJpg } from "@/components/tools/converters/file/PdfToJpg";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("pdf-to-jpg");

const tool = TOOLS.find((t) => t.slug === "pdf-to-jpg" && t.category === "converters")!;

const howToSteps = [
  "Drop a <strong>PDF file</strong> onto the drop zone, or click to browse and select it from your device.",
  "Choose the <strong>DPI (resolution)</strong> for the output images — higher DPI means sharper images but larger file sizes.",
  "Click <strong>Convert</strong> — each page of the PDF is converted to a separate <strong>JPG image</strong>.",
  "Download <strong>individual pages</strong> using the per-image download buttons, or download all at once.",
];

const faqs = [
  {
    question: "What DPI should I use?",
    answer:
      "<strong>72–96 DPI</strong> is suitable for screen viewing and web use. <strong>150 DPI</strong> is a good balance between quality and file size. <strong>300 DPI</strong> produces print-quality output with high sharpness.",
  },
  {
    question: "Does this work with multi-page PDFs?",
    answer:
      "Yes. Each page of the PDF is converted to a <strong>separate JPG file</strong>, named with the page number (page-1.jpg, page-2.jpg, etc.).",
  },
  {
    question: "Is my file uploaded to a server?",
    answer:
      "Yes — conversion is processed <strong>server-side</strong>. Your file is handled in an isolated temporary environment and <strong>deleted immediately</strong> after the images are returned to you. No files are stored.",
  },
  {
    question: "Is this free?",
    answer: "Yes — completely free with <strong>no limits</strong> imposed by this tool.",
  },
  {
    question: "Why convert PDF to JPG?",
    answer:
      "Converting PDF pages to JPG images is useful when you need to <strong>embed PDF content in a document or presentation</strong> that does not support PDFs, share a single page as an image, use PDF content on a website, or preview pages as thumbnails.",
  },
  {
    question: "Will text in the PDF be readable in the JPG?",
    answer:
      "Yes, as long as you use a <strong>sufficient DPI</strong>. At 150 DPI or higher, text is typically sharp and legible. At very low DPI (below 72), small text may become blurry.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About PDF Files",
    content: `<p><strong>PDF (Portable Document Format)</strong> is the world's most widely used document format, designed to display content identically across all devices and operating systems. A PDF can contain text, fonts, images, vector graphics, and interactive elements — all in a single self-contained file.</p><p>PDFs are designed to be viewed, not edited. When you need to extract the visual content of a PDF page as an image — for use on a website, in a presentation, or as a thumbnail — converting to JPG is the most practical approach.</p>`,
  },
  {
    title: "Understanding DPI for PDF to JPG Conversion",
    content: `<p><strong>DPI (dots per inch)</strong> determines the resolution and sharpness of the output JPG image. When converting a PDF to an image, DPI controls how many pixels are used to represent each inch of the original PDF page:</p><ul><li><strong>72–96 DPI</strong> — standard screen resolution, good for web previews and thumbnails, small file size</li><li><strong>150 DPI</strong> — good balance of sharpness and file size, suitable for most uses</li><li><strong>300 DPI</strong> — high resolution, suitable for printing, archiving, or zooming into document content</li></ul><p>For most digital uses, 150 DPI is sufficient. Use 300 DPI when the output needs to be printed or when the PDF contains small text or fine details.</p>`,
  },
];

export default function PdfToJpgPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <PdfToJpg />
    </ToolContainer>
  );
}
