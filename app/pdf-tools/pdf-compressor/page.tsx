import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { PdfCompressor } from "@/components/tools/lazy-client";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("pdf-compressor");

const tool = TOOLS.find((t) => t.slug === "pdf-compressor")!;

const howToSteps = [
  "Drop a PDF onto the upload area or click to browse your files. <strong>Any PDF file</strong> is accepted, regardless of how it was created.",
  "Try <strong>Tier 1 (Lossless)</strong> first — it rewrites the PDF using compressed object streams, a standard PDF feature that shrinks the file structure without touching any content. The result is instant and the document remains fully intact.",
  "If Tier 1 doesn't reduce the size enough, switch to <strong>Tier 2 (Aggressive)</strong> — every page is re-rendered as a compressed image at reduced resolution. This can cut file size by 50–80%, but text will no longer be selectable or searchable in the output.",
  "After compression finishes, the <strong>before and after file sizes</strong> are shown side by side. Click <strong>Download</strong> to save the compressed PDF to your device.",
];

const faqs = [
  {
    question: "What does Tier 1 (Lossless) compression do?",
    answer:
      "<strong>Tier 1</strong> rewrites the PDF using cross-reference (object) streams — a PDF 1.5 feature that compresses the internal file structure. It is completely lossless: no content, fonts, or images are modified. Text remains selectable and searchable.",
  },
  {
    question: "What does Tier 2 (Aggressive) compression do?",
    answer:
      "<strong>Tier 2</strong> re-renders every page at 75% resolution, saves each page as a JPEG image, and assembles a new PDF from those images. This typically reduces file size by 50–80% but the resulting text is a rasterized image — it cannot be selected, searched, or copied.",
  },
  {
    question: "Why didn't Tier 1 reduce my file size?",
    answer:
      "Some PDFs are already optimized or were created with tools that compress the file structure by default. In those cases, Tier 1 will have little or no effect. Try <strong>Tier 2</strong> for a more aggressive reduction, or consider removing embedded fonts and images upstream.",
  },
  {
    question: "Are my files uploaded anywhere?",
    answer:
      "No. All compression runs entirely in your <strong>browser</strong>. Nothing is sent to a server. Your files never leave your device.",
  },
  {
    question: "Will compression affect my PDF's visual appearance?",
    answer:
      "<strong>Tier 1</strong> produces no visible changes — the output looks identical to the original. <strong>Tier 2</strong> may introduce slight image quality loss due to JPEG compression, especially noticeable in documents with sharp text or fine graphics.",
  },
  {
    question: "Is there a file size limit?",
    answer:
      "There is no strict server-side limit since processing happens in your browser. Very large PDFs (over 100 MB) may be slow depending on your device's memory and processing power.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is a PDF?",
    content: `<p><strong>PDF (Portable Document Format)</strong> is a file format designed to present documents consistently across all devices and operating systems. A PDF captures text, images, fonts, and layout in a single file that looks the same whether opened on a phone, tablet, or desktop computer.</p><p>PDFs can contain multiple layers of data — embedded fonts, vector graphics, raster images, metadata, and form fields — which is why their file sizes can grow large. Compressing a PDF reduces the size of these internal components without changing the document's appearance (when done losslessly) or by converting pages to compressed images (aggressive mode).</p>`,
  },
  {
    title: "Common Use Cases for PDF Compression",
    content: `<p>Reducing PDF file size is useful in many everyday situations:</p><ul><li><strong>Email attachments:</strong> Most email services cap attachments at 10–25 MB. Compressing a PDF makes it easier to send without workarounds.</li><li><strong>Web uploads:</strong> Many government portals, job application systems, and university submissions impose strict file size limits.</li><li><strong>Saving storage:</strong> Archiving large collections of scanned documents takes significant disk or cloud space. Compression reduces long-term storage costs.</li><li><strong>Faster sharing:</strong> Smaller files upload and download faster, improving the experience for recipients on slower connections.</li></ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>To get the most out of PDF compression:</p><ul><li>Use <strong>Tier 1</strong> for documents where text must remain searchable and selectable — reports, contracts, forms, and resumes.</li><li>Use <strong>Tier 2</strong> for scanned documents or image-heavy PDFs where text is already non-selectable, or when sharing a read-only visual copy.</li><li>If the original PDF contains large embedded images, consider reducing image resolution before creating the PDF for the best results.</li><li>Check the compressed file visually before distributing — zoom into image areas to verify the quality meets your needs.</li></ul>`,
  },
];

export default function PdfCompressorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <PdfCompressor />
    </ToolContainer>
  );
}
