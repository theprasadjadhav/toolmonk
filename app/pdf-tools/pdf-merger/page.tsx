import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { PdfMerger } from "@/components/tools/lazy-client";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("pdf-merger");

const tool = TOOLS.find((t) => t.slug === "pdf-merger")!;

const howToSteps = [
  "Drop one or more PDF files onto the upload area, or click to browse. You can <strong>add multiple files</strong> at once — each becomes a card in the file list.",
  "Drag the <strong>file cards</strong> up or down to set the order in which they will appear in the merged document.",
  "Use the <strong>thumbnail grid</strong> for each file to deselect any individual pages you want to exclude from the merged output.",
  "Click <strong>Merge</strong> — the combined PDF is assembled and downloads automatically to your device.",
];

const faqs = [
  {
    question: "How many PDFs can I merge at once?",
    answer:
      "There is no hard limit on the number of files. Each individual file can be up to <strong>200 MB</strong>. Performance depends on your device's available memory — very large merges may take a moment.",
  },
  {
    question: "Can I exclude specific pages from each file?",
    answer:
      "Yes — each uploaded PDF shows a <strong>thumbnail grid</strong>. Uncheck any pages you don't want included in the merged output. Only the checked pages will appear in the final document.",
  },
  {
    question: "Is the merged PDF identical in quality to the originals?",
    answer:
      "Yes. Pages are copied <strong>losslessly</strong> — no re-encoding or quality loss occurs. Text, images, fonts, and annotations are preserved exactly as they appear in the source files.",
  },
  {
    question: "Does this upload my files to a server?",
    answer:
      "No. All processing runs entirely in your <strong>browser</strong>. Your files never leave your device.",
  },
  {
    question: "Can I merge password-protected PDFs?",
    answer:
      "Password-protected PDFs must be <strong>unlocked first</strong> using the PDF Unlock tool. Once the protection is removed, the file can be uploaded and merged normally.",
  },
  {
    question: "Will bookmarks and hyperlinks be preserved in the merged PDF?",
    answer:
      "Internal hyperlinks within each source PDF are generally preserved. Document-level bookmarks and cross-document links may not carry over, depending on how the originals were created.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is PDF Merging?",
    content: `<p><strong>PDF merging</strong> is the process of combining two or more separate PDF files into a single document. The resulting file contains all the pages from the source files, arranged in the order you choose.</p><p>Merging is a purely structural operation — the content of each page is copied as-is into the new document. No re-rendering or quality loss occurs. This makes it ideal for combining related materials such as a cover page, main report, and appendix into one clean, shareable file.</p>`,
  },
  {
    title: "Common Use Cases for Merging PDFs",
    content: `<p>PDF merging is one of the most frequently needed document tasks:</p><ul><li><strong>Combining reports:</strong> Merge a cover page, table of contents, chapters, and appendix into one submission-ready document.</li><li><strong>Invoice batching:</strong> Combine monthly invoices into a single file for record-keeping or client delivery.</li><li><strong>Application packages:</strong> Job applications, grant submissions, and university applications often require a single PDF containing a cover letter, resume, and supporting documents.</li><li><strong>Archiving:</strong> Consolidate related scanned documents (contracts, receipts, correspondence) into one organized file.</li></ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>For a clean, professional merged document:</p><ul><li>Arrange files in the correct order <strong>before merging</strong> — drag the file cards to set the final page sequence.</li><li>Use the <strong>page thumbnail grid</strong> to remove blank, duplicate, or unwanted pages from each source file before merging.</li><li>If source PDFs have different page sizes or orientations, the merged document will reflect those differences — consider standardizing page size upstream if uniformity is needed.</li><li>After merging, run the result through the <strong>PDF Compressor</strong> if the combined file is larger than desired.</li></ul>`,
  },
];

export default function PdfMergerPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <PdfMerger />
    </ToolContainer>
  );
}
