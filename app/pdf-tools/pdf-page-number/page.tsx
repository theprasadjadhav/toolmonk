import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { PdfPageNumber } from "@/components/tools/lazy-client";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("pdf-page-number");

const tool = TOOLS.find((t) => t.slug === "pdf-page-number")!;

const howToSteps = [
  "Drop a PDF onto the upload area or click to browse. <strong>Any PDF</strong> can have page numbers added regardless of its current content.",
  "Use the <strong>thumbnail grid</strong> to select which pages should receive a number. Deselect any pages — like cover pages or section dividers — where you don't want a number.",
  "Set the <strong>position</strong> (top-left, top-center, top-right, bottom-left, bottom-center, or bottom-right), choose a <strong>start number</strong>, adjust the font size and color, and add an optional prefix or suffix such as 'Page ' or ' of 10'.",
  "Check the <strong>live preview</strong> on the right to see exactly how the number will appear on the first page before committing.",
  "Click <strong>Add page numbers</strong> — the numbered PDF is generated and downloads automatically.",
];

const faqs = [
  {
    question: "Can I start numbering from a custom number?",
    answer:
      "Yes — set the <strong>Start number</strong> field to any value from 1 to 9999. This is useful when you're adding numbers to a section that continues from a previous document.",
  },
  {
    question: "Can I add text around the number, like 'Page 1 of 10'?",
    answer:
      "Yes — use the <strong>Prefix</strong> and <strong>Suffix</strong> fields. For 'Page 1 of 10', set the prefix to 'Page ' and the suffix to ' of 10'. The number is inserted between the prefix and suffix automatically.",
  },
  {
    question: "What font is used for the page numbers?",
    answer:
      "Page numbers are drawn using <strong>Helvetica</strong>, a standard built-in PDF font. It does not require font embedding, keeping file size minimal.",
  },
  {
    question: "Is my file uploaded anywhere?",
    answer:
      "No. All numbering runs entirely in your <strong>browser</strong>. Nothing is sent to a server. Your file never leaves your device.",
  },
  {
    question: "Can I skip numbering the first page (cover page)?",
    answer:
      "Yes — simply <strong>deselect the first page</strong> in the thumbnail grid. Page numbers will only be added to the pages you have checked, while other pages pass through unchanged.",
  },
  {
    question: "Can I change the color of the page numbers?",
    answer:
      "Yes — use the <strong>color picker</strong> to choose any color for the page number text. A color that contrasts well with the page background (such as dark gray or black on white) is recommended for readability.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Why Add Page Numbers to a PDF?",
    content: `<p>Page numbers are a fundamental element of professional documents. They make it easy to reference specific sections during presentations, meetings, or reviews. Numbered pages also help readers navigate long documents and allow precise citations in academic or legal contexts.</p><p>Many PDFs are created from sources that don't automatically include page numbers — scanned documents, exported reports, or merged files from multiple sources. Adding page numbers after the fact ensures the document is ready for distribution without needing to return to the original source.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Page numbering is needed across a wide range of document types:</p><ul><li><strong>Academic papers and theses:</strong> Universities and journals typically require specific page number placement and formatting.</li><li><strong>Legal documents:</strong> Court filings and contracts often require numbered pages for precise reference.</li><li><strong>Business reports:</strong> Numbered pages make it easy for stakeholders to refer to specific data during meetings.</li><li><strong>Manuals and guides:</strong> Instructional documents benefit from page numbers to support a table of contents and help users find their place.</li><li><strong>Merged PDFs:</strong> After combining multiple documents, adding continuous page numbers creates a unified reading experience.</li></ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>To achieve professional-looking page numbers:</p><ul><li>Use <strong>bottom-center</strong> positioning for most documents — it is the most widely recognized convention and does not interfere with header content.</li><li>Choose a <strong>font size</strong> between 9 and 11 points for readability without being visually dominant.</li><li>If the document has a cover page, <strong>deselect it</strong> from numbering and set the start number to 1 for the second page.</li><li>Use the <strong>live preview</strong> to verify position and appearance before processing the full document.</li></ul>`,
  },
];

export default function PdfPageNumberPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <PdfPageNumber />
    </ToolContainer>
  );
}
