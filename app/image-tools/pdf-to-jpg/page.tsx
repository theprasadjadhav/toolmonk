import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { PdfToJpg } from "@/components/tools/shared/file-converters/PdfToJpg";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("pdf-to-jpg");
const tool = TOOLS.find((t) => t.slug === "pdf-to-jpg" && t.category === "image-tools")!;

const howToSteps = [
  "Drop a <strong>PDF file</strong> onto the drop zone or click to browse and select it from your device.",
  "Choose the <strong>DPI (dots per inch)</strong> for the output images — higher DPI produces sharper images at the cost of larger file sizes.",
  "Click <strong>Convert</strong> — each page of the PDF is rendered and saved as a separate JPG image.",
  "Download <strong>individual pages</strong> or use the bulk download option to save all pages at once.",
];

const faqs = [
  {
    question: "What DPI should I use?",
    answer:
      "<strong>72–96 DPI</strong> is suitable for screen viewing and web use. <strong>150 DPI</strong> is a good general-purpose balance of quality and file size. <strong>300 DPI</strong> is recommended for print-quality output where fine text or detail must remain sharp.",
  },
  {
    question: "Does this work with multi-page PDFs?",
    answer:
      "Yes — <strong>each page of the PDF</strong> is converted to its own JPG file, named with the page number. You can download all pages at once or select individual pages.",
  },
  {
    question: "Is my file uploaded to a server?",
    answer:
      "Yes — PDF-to-image conversion is handled server-side. Your file is processed in an <strong>isolated temporary directory</strong> and deleted immediately after the converted images are returned to your browser.",
  },
  {
    question: "Why is the output a JPG and not a PNG?",
    answer:
      "JPG is used by default because it produces <strong>smaller file sizes</strong> for the photographic content typical in PDFs. If you need lossless output or transparency, consider using a PDF-to-PNG workflow — JPG does not support transparency.",
  },
  {
    question: "Will the text in my PDF be sharp in the output images?",
    answer:
      "Text sharpness depends on the <strong>DPI setting</strong>. At 96 DPI, fine text may appear slightly soft. Use <strong>150 DPI or higher</strong> for PDFs containing small text, tables, or technical diagrams to ensure readability.",
  },
  {
    question: "Is this free?",
    answer: "Yes — completely free with no limits imposed by this tool.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About PDF to JPG Conversion",
    content: `<p>PDFs are <strong>document containers</strong> that can hold text, vector graphics, and raster images. Converting a PDF to JPG renders each page as a flat raster image — all elements including text, graphics, and photos are merged into a single picture for each page.</p>
<p>This is useful when you need to <strong>use a PDF page as an image</strong> — for example, as a thumbnail, a slide background, or as content for a platform that accepts images but not PDFs. The conversion process rasterizes the page at the resolution you specify, which determines the sharpness of the output.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>PDF-to-JPG conversion is useful in many practical scenarios:</p>
<ul>
<li><strong>Extracting images from reports</strong> — pull charts, diagrams, or pages from a PDF report for use in presentations</li>
<li><strong>Creating PDF thumbnails</strong> — generate a preview image of the first page for document management systems</li>
<li><strong>Sharing on social media</strong> — convert a PDF infographic or poster to an image for sharing on platforms that do not support PDF</li>
<li><strong>Digitizing scanned documents</strong> — extract pages from a scanned PDF as individual image files</li>
<li><strong>Uploading to image-only platforms</strong> — submit PDF content to systems that only accept image file formats</li>
</ul>`,
  },
  {
    title: "Understanding DPI for PDF Conversion",
    content: `<p><strong>DPI (dots per inch)</strong> controls how many pixels are used to represent each inch of the PDF page. A higher DPI means more pixels, which produces a sharper image — but also a larger file size.</p>
<p>As a guide: <strong>96 DPI</strong> is appropriate for on-screen viewing only. <strong>150 DPI</strong> works well for general-purpose use including web publishing and document management. <strong>300 DPI</strong> is the minimum recommended for printing, where text and fine lines must remain crisp. For most web and digital uses, <strong>150 DPI strikes the best balance</strong> between image quality and file size.</p>`,
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
