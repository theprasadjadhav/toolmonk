import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { WordToPdf } from "@/components/tools/converters/file/WordToPdf";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("word-to-pdf");

const tool = TOOLS.find((t) => t.slug === "word-to-pdf")!;

const howToSteps = [
  "Click the <strong>drop zone</strong> or drag a DOC or DOCX file onto it to select your Word document.",
  "Click <strong>Convert</strong> to upload and process the file — conversion typically takes a few seconds.",
  "Click <strong>Download</strong> to save the converted <strong>PDF file</strong> to your device.",
];

const faqs = [
  {
    question: "Is my file uploaded to a server?",
    answer:
      "Yes — conversion is processed <strong>server-side</strong>. Your file is handled in an isolated temporary environment and <strong>deleted immediately</strong> after the converted PDF is returned to you. No files are stored.",
  },
  {
    question: "Are both .doc and .docx supported?",
    answer:
      "Yes. Both the older <strong>.doc</strong> (Word 97–2003) format and the modern <strong>.docx</strong> format are accepted as input.",
  },
  {
    question: "Is text and image formatting preserved?",
    answer:
      "Text styles, fonts, tables, images, headers, footers, and most layout elements are preserved in the output PDF. Very complex multi-column layouts or documents using uncommon fonts may render with minor differences.",
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
    question: "Why convert a Word document to PDF?",
    answer:
      "Converting to PDF ensures your document <strong>looks exactly the same</strong> for everyone who opens it, regardless of their operating system, fonts installed, or word processor. PDFs are the standard format for sharing contracts, reports, CVs, invoices, and any document that should not be accidentally modified.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About DOCX Files",
    content: `<p><strong>DOCX</strong> is the default format for Microsoft Word documents (Word 2007 and later). It stores text, formatting, images, and layout instructions in a compressed XML structure. DOCX is the most widely used document format in business, legal, and academic settings.</p><p>While DOCX is broadly supported, a document's appearance can vary between different versions of Word and other word processors due to differences in font rendering and feature support. Converting to PDF before sharing eliminates these inconsistencies.</p>`,
  },
  {
    title: "Why Share Documents as PDF?",
    content: `<p>Converting a Word document to PDF before sharing has several important advantages:</p><ul><li><strong>Consistent appearance</strong> — the document looks identical on every device, regardless of fonts or software installed</li><li><strong>Prevents accidental edits</strong> — recipients can view and print but cannot easily modify the content</li><li><strong>Universal compatibility</strong> — every device and operating system can open a PDF without needing Word</li><li><strong>Professional standard</strong> — CVs, contracts, invoices, and formal reports are conventionally shared as PDFs</li></ul>`,
  },
  {
    title: "About PDF Files",
    content: `<p><strong>PDF (Portable Document Format)</strong> is the world's most widely used document format, designed to display content identically on any device or operating system. A PDF embeds all the fonts, images, and layout information it needs — so it looks the same whether opened on a phone, tablet, or desktop, and whether viewed on Windows, macOS, or Linux.</p><p>PDFs are the standard for sharing final documents in professional, legal, and academic contexts.</p>`,
  },
];

export default function WordToPdfPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <WordToPdf />
    </ToolContainer>
  );
}
