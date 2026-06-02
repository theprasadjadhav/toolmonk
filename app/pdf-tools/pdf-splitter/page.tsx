import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { PdfSplitter } from "@/components/tools/lazy-client";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("pdf-splitter");

const tool = TOOLS.find((t) => t.slug === "pdf-splitter")!;

const howToSteps = [
  "Drop a PDF onto the upload area or click to browse. <strong>Page thumbnails</strong> are shown so you can preview the document before splitting.",
  "Choose a <strong>split mode</strong>: Page ranges (custom sections), Every N pages (equal chunks), or Select specific pages (individual page extraction).",
  "Configure the mode — enter ranges like <strong>1-3, 4-7</strong> for custom sections, set the chunk size N, or check individual pages in the thumbnail grid.",
  "Click <strong>Split PDF</strong> — each section downloads as a separate PDF, or as a single ZIP archive if multiple files are produced.",
];

const faqs = [
  {
    question: "What does 'Page ranges' mode do?",
    answer:
      "Each comma-separated range (e.g. <strong>1-3, 4-7, 8-10</strong>) becomes a separate PDF file. Pages not included in any range are excluded from the output entirely.",
  },
  {
    question: "What does 'Every N pages' mode do?",
    answer:
      "The PDF is divided into <strong>consecutive groups of N pages</strong>. For example, a 10-page PDF split every 3 pages produces files covering pages 1-3, 4-6, 7-9, and a final file with page 10.",
  },
  {
    question: "What does 'Select pages' mode do?",
    answer:
      "Each page you check in the <strong>thumbnail grid</strong> becomes its own individual 1-page PDF file. All extracted pages are bundled into a single ZIP archive for download.",
  },
  {
    question: "Does this work offline?",
    answer:
      "Yes — all splitting runs entirely in your <strong>browser</strong>. Your PDF is never uploaded to any server.",
  },
  {
    question: "Can I split a password-protected PDF?",
    answer:
      "Password-protected PDFs must be <strong>unlocked first</strong> using the PDF Unlock tool. Once the encryption is removed, the file can be uploaded and split normally.",
  },
  {
    question: "Are the split files identical in quality to the original?",
    answer:
      "Yes. Pages are copied <strong>losslessly</strong> from the original — no re-encoding, compression, or quality loss occurs. Each output file is an exact copy of the relevant pages.",
  },
  {
    question: "What is the maximum file size supported?",
    answer:
      "There is no strict server-side limit since all processing happens in your browser. Very large PDFs may require more time and memory depending on your device.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is PDF Splitting?",
    content: `<p><strong>PDF splitting</strong> is the process of dividing a single PDF document into two or more separate files. The split can be based on custom page ranges, equal-sized chunks, or individually selected pages.</p><p>Splitting is the reverse operation of merging — instead of combining multiple PDFs into one, you are extracting portions of one PDF into multiple files. Like merging, splitting is a lossless operation: each output file contains exact copies of the original pages with no quality reduction.</p>`,
  },
  {
    title: "Common Use Cases for Splitting PDFs",
    content: `<p>There are many practical reasons to split a PDF:</p><ul><li><strong>Extracting individual chapters:</strong> Split a large report or book into separate files for easier distribution or reading.</li><li><strong>Separating invoices or receipts:</strong> A batch-exported PDF containing multiple invoices can be split into individual files for record-keeping or client delivery.</li><li><strong>Meeting file size limits:</strong> Split a large PDF into smaller parts to comply with email attachment limits or upload size restrictions.</li><li><strong>Sharing selective content:</strong> Extract only the relevant pages from a document to share with specific audiences without distributing the full file.</li></ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>To split PDFs effectively:</p><ul><li>Use <strong>Page ranges</strong> mode when you know the exact page boundaries of each section — for example, chapters in a report.</li><li>Use <strong>Every N pages</strong> to quickly divide a long document into equal-sized parts without specifying exact ranges.</li><li>Use <strong>Select pages</strong> when you need to extract a handful of specific pages rather than contiguous sections.</li><li>Preview the <strong>page thumbnails</strong> before splitting to confirm you have the correct pages selected, especially for scanned documents where pages may not be in an obvious order.</li></ul>`,
  },
];

export default function PdfSplitterPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <PdfSplitter />
    </ToolContainer>
  );
}
