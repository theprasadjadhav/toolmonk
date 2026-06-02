import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { WordToPdf } from "@/components/tools/shared/file-converters/WordToPdf";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("word-to-pdf");
const tool = TOOLS.find((t) => t.slug === "word-to-pdf" && t.category === "pdf-tools")!;

const howToSteps = [
  "Click the <strong>drop zone</strong> or drag a DOC or DOCX file onto it. The file name will appear to confirm it has been selected.",
  "Click <strong>Convert</strong> to start the conversion. The process typically takes a few seconds depending on the document's length and content.",
  "Once conversion is complete, click <strong>Download</strong> to save the resulting PDF to your device.",
];

const faqs = [
  {
    question: "Is my file uploaded to a server?",
    answer:
      "Yes — conversion is handled <strong>server-side</strong>. Your file is processed in an isolated temporary directory and deleted immediately after the converted PDF is sent back. No files are stored.",
  },
  {
    question: "Are both .doc and .docx supported?",
    answer:
      "Yes. Both the <strong>legacy .doc</strong> format and the modern <strong>.docx</strong> format are supported.",
  },
  {
    question: "Is text and image formatting preserved?",
    answer:
      "Yes. <strong>Text styles, headings, bold and italic formatting, tables, images, and most layout elements</strong> are preserved when converting to PDF. Complex custom styles or very advanced layouts may need minor review.",
  },
  {
    question: "Is there a file size limit?",
    answer: "Files up to <strong>50 MB</strong> are supported.",
  },
  {
    question: "Is this free?",
    answer: "Yes — completely free with no registration required.",
  },
  {
    question: "Why should I convert a Word document to PDF?",
    answer:
      "Converting to PDF ensures your document looks <strong>identical on every device</strong> — fonts, spacing, and layout are locked in. PDFs are also harder to accidentally edit, making them ideal for final versions of contracts, resumes, reports, and official documents.",
  },
  {
    question: "Can I convert a Word document with tracked changes to PDF?",
    answer:
      "The conversion will render the document as it currently appears. If tracked changes are <strong>visible</strong> (not accepted or rejected), they will appear in the PDF. It is recommended to accept or reject all changes before converting if you want a clean final output.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About Word and PDF Files",
    content: `<p>A <strong>Word document (.docx)</strong> is an editable file format for word processing. It stores text, formatting, images, and styles in a structure designed for easy editing. The way a Word document looks can vary depending on the software version, operating system, and fonts available on the device it is opened on.</p><p>A <strong>PDF</strong> is a fixed-layout format that presents content identically across all devices and operating systems. Converting Word to PDF locks the layout and ensures the document looks exactly the same for every reader, regardless of what software they use to open it.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Converting Word documents to PDF is one of the most common document tasks:</p><ul><li><strong>Resumes and CVs:</strong> Submit your resume as a PDF to ensure your formatting is preserved exactly as intended.</li><li><strong>Contracts and agreements:</strong> PDFs are harder to accidentally modify, making them more suitable for signed or finalized documents.</li><li><strong>Reports and proposals:</strong> Share polished, print-ready documents with clients or stakeholders.</li><li><strong>Academic submissions:</strong> Many universities and journals require submissions in PDF format.</li></ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>To get the cleanest PDF from your Word document:</p><ul><li>Accept or reject any <strong>tracked changes</strong> before converting so the final PDF shows only the intended content.</li><li>Use standard system fonts in your document — custom or uncommon fonts may be substituted if not available during conversion.</li><li>Ensure all <strong>embedded images</strong> are at a sufficient resolution for the intended viewing or printing use.</li><li>Review the PDF at 100% zoom to confirm that text, tables, and images appear as expected before distributing.</li></ul>`,
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
