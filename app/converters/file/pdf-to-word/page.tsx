import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { PdfToWord } from "@/components/tools/converters/file/PdfToWord";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("pdf-to-word");

const tool = TOOLS.find((t) => t.slug === "pdf-to-word")!;

const howToSteps = [
  "Click the <strong>drop zone</strong> or drag a PDF file onto it to select the document you want to convert.",
  "Click <strong>Convert</strong> to upload and process the file — conversion time depends on the PDF's size and complexity.",
  "Click <strong>Download</strong> to save the converted <strong>DOCX file</strong> to your device, ready to open and edit in any word processor.",
];

const faqs = [
  {
    question: "Is my file uploaded to a server?",
    answer:
      "Yes — conversion is processed <strong>server-side</strong>. Your file is handled in an isolated temporary environment and <strong>deleted immediately</strong> after the converted file is returned to you. No files are stored.",
  },
  {
    question: "Is formatting preserved?",
    answer:
      "Most text formatting is preserved, including <strong>headings, paragraphs, fonts, and basic layout</strong>. Complex PDFs with multiple columns, custom fonts, or intricate page layouts may require minor manual adjustments after conversion.",
  },
  {
    question: "Is there a file size limit?",
    answer: "Files up to <strong>50 MB</strong> are supported.",
  },
  {
    question: "Is this free?",
    answer: "Yes — completely free with <strong>no registration</strong> required.",
  },
  {
    question: "Will the converted DOCX be fully editable?",
    answer:
      "Yes. The output DOCX contains editable text and standard Word formatting, so you can <strong>modify, reformat, and add content</strong> just like any other Word document.",
  },
  {
    question: "What if my PDF is a scanned image?",
    answer:
      "If the PDF consists of scanned images rather than real text, the conversion will produce a document with <strong>embedded images rather than editable text</strong>. Text recognition from scanned PDFs requires a dedicated OCR tool.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About PDF Files",
    content: `<p><strong>PDF (Portable Document Format)</strong> is the world's most widely used document format. PDFs preserve exact layout, fonts, and formatting — making them ideal for sharing finalized documents. However, PDFs are designed to be read, not edited.</p><p>When you receive a PDF that you need to modify — updating contract text, revising a report, or extracting content — converting it to a Word document (DOCX) gives you a fully editable version you can work with in any word processor.</p>`,
  },
  {
    title: "PDF to Word — What to Expect",
    content: `<p>The quality of PDF-to-Word conversion depends on how the original PDF was created:</p><ul><li><strong>Text-based PDFs</strong> (created from a Word document or other editable source) convert well — text, headings, and most formatting transfer accurately</li><li><strong>Scanned PDFs</strong> (photographs of physical pages) contain images, not real text. The output DOCX will contain those images rather than editable text. An OCR tool is needed to extract text from scanned documents</li><li><strong>Complex layouts</strong> (multi-column, intricate tables, custom fonts) may require some reformatting after conversion</li></ul>`,
  },
  {
    title: "Common Use Cases for PDF to Word Conversion",
    content: `<p>Converting PDF to DOCX is useful in many situations:</p><ul><li>Editing a <strong>contract, report, or form</strong> you received as a PDF</li><li>Repurposing content from a PDF into a <strong>new document or presentation</strong></li><li>Extracting tables or data from a PDF to <strong>work with in a spreadsheet</strong></li><li>Updating an older document that only exists as a PDF, where the original editable file has been lost</li></ul>`,
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
