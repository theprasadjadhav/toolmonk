import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { PdfToWord } from "@/components/tools/lazy-client";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("pdf-to-word");
const tool = TOOLS.find((t) => t.slug === "pdf-to-word" && t.category === "pdf-tools")!;

const howToSteps = [
  "Click the <strong>drop zone</strong> or drag a PDF file onto it. The file name will appear to confirm it has been selected.",
  "Click <strong>Convert</strong> to start the conversion. The process typically takes a few seconds depending on the document's size and complexity.",
  "Once conversion is complete, click <strong>Download</strong> to save the resulting DOCX file to your device.",
];

const faqs = [
  {
    question: "Is my file uploaded to a server?",
    answer:
      "No — all conversion happens <strong>entirely in your browser</strong>. Your PDF is never uploaded to any server. The file is processed locally using JavaScript and the result is generated on your device.",
  },
  {
    question: "Is formatting preserved during conversion?",
    answer:
      "Most <strong>text formatting</strong> — headings, bold, italic, lists, and tables — is preserved. Complex PDFs with multiple columns, special fonts, or intricate layouts may need minor manual adjustments in the resulting document.",
  },
  {
    question: "Is there a file size limit?",
    answer:
      "Files up to <strong>50 MB</strong> are supported.",
  },
  {
    question: "What types of PDFs convert best?",
    answer:
      "PDFs created from <strong>digital sources</strong> (exported from word processors, spreadsheets, or design tools) convert most accurately. Scanned PDFs that contain only images of text may produce limited results since the text is not digitally encoded in those files.",
  },
  {
    question: "Is this free?",
    answer: "Yes — completely free with no registration required.",
  },
  {
    question: "Can I edit the resulting DOCX file?",
    answer:
      "Yes. The output is a standard <strong>DOCX file</strong> that can be opened and edited in any word processing application on desktop or mobile.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About PDF and DOCX Files",
    content: `<p>A <strong>PDF (Portable Document Format)</strong> is designed for fixed-layout document sharing — it preserves visual appearance across all devices but is not designed for editing. A <strong>DOCX</strong> file is a word processing format designed for editable, reflowable text documents.</p><p>Converting PDF to DOCX allows you to extract and edit the content of a PDF using a standard word processor. The conversion process reads the text, layout, and formatting from the PDF and reconstructs them as editable document elements.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Converting PDF to Word is useful in many everyday situations:</p><ul><li><strong>Editing received documents:</strong> When someone sends you a PDF that you need to modify, converting it to DOCX lets you make changes without asking for the original source file.</li><li><strong>Extracting content:</strong> Pull text, tables, or sections from a PDF into a new document.</li><li><strong>Updating outdated files:</strong> Convert legacy PDFs into editable documents to refresh or repurpose their content.</li><li><strong>Collaborative editing:</strong> Share a DOCX version with colleagues who need to leave comments or make tracked changes.</li></ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>To get the cleanest conversion:</p><ul><li>Use PDFs that were <strong>digitally created</strong> (not scanned) for the most accurate text extraction.</li><li>After conversion, review the document for any <strong>formatting inconsistencies</strong>, particularly around tables, multi-column layouts, and text boxes.</li><li>If the PDF contains images or charts, these will appear as image objects in the DOCX — they cannot be converted into editable chart data.</li><li>For scanned PDFs, consider using an <strong>optical character recognition (OCR)</strong> tool first to make the text machine-readable before converting.</li></ul>`,
  },
];

export default function PdfToWordPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <PdfToWord />
    </ToolContainer>
  );
}
