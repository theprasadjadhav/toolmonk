import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { DocxToOdt } from "@/components/tools/converters/file/DocxToOdt";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("docx-to-odt");

const tool = TOOLS.find((t) => t.slug === "docx-to-odt")!;

const howToSteps = [
  "Click the <strong>drop zone</strong> or drag a DOC or DOCX file onto it to select your Word document for conversion.",
  "Click <strong>Convert</strong> to upload and process the file — conversion typically takes a few seconds depending on file size.",
  "Click <strong>Download</strong> to save the converted <strong>ODT file</strong> to your device.",
];

const faqs = [
  {
    question: "Is my file uploaded to a server?",
    answer:
      "Yes — conversion is processed <strong>server-side</strong>. Your file is handled in an isolated temporary environment and <strong>deleted immediately</strong> after the converted file is returned to you. No files are stored.",
  },
  {
    question: "What is ODT format?",
    answer:
      "<strong>ODT (OpenDocument Text)</strong> is the open international standard for word-processing documents. It is the native format of LibreOffice Writer, Apache OpenOffice, and other open-source office suites. Because it is an open standard, ODT files can be opened by any conforming application without licensing restrictions.",
  },
  {
    question: "Is formatting preserved?",
    answer:
      "Most formatting is preserved during conversion, including <strong>text styles, fonts, tables, and embedded images</strong>. Very complex layouts — such as multi-column section formatting or advanced Word-specific features — may require minor manual adjustment after conversion.",
  },
  {
    question: "Are both .doc and .docx files supported?",
    answer:
      "Yes. Both the older <strong>.doc</strong> (Word 97–2003) format and the modern <strong>.docx</strong> format are accepted as input.",
  },
  {
    question: "Is there a file size limit?",
    answer: "Files up to <strong>50 MB</strong> are supported.",
  },
  {
    question: "Is this free?",
    answer: "Yes — completely free with <strong>no registration</strong> required.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About DOCX Files",
    content: `<p><strong>DOCX</strong> is the default format for Microsoft Word documents (Word 2007 and later). It is actually a compressed archive containing XML files that describe the document's content, styles, images, and formatting. DOCX is the most widely used word-processing format in business and education.</p><p>While DOCX is universally supported, it is a proprietary format — some features are specific to Microsoft Word and may not render identically in other applications. Converting to ODT produces an open-standard document that any conforming office suite can open without a Microsoft Office license.</p>`,
  },
  {
    title: "About ODT Files",
    content: `<p><strong>ODT (OpenDocument Text)</strong> is the word-processing format of the OpenDocument standard (ISO/IEC 26300), developed to ensure long-term accessibility of documents without vendor lock-in. It is the native format of LibreOffice Writer and is supported by Google Docs, Apache OpenOffice, and many other applications.</p><p>ODT is particularly valued in government, education, and open-source environments where document interoperability and long-term archiving are priorities.</p>`,
  },
  {
    title: "When to Convert DOCX to ODT",
    content: `<p>Converting DOCX to ODT is useful when:</p><ul><li>You need to open or edit a Word document using <strong>LibreOffice</strong> or another open-source office suite</li><li>Your organization requires documents in an <strong>open standard format</strong> for archiving or compliance</li><li>You want to share a document with someone who does not have access to Microsoft Word</li><li>You are submitting documents to a government or academic system that requires <strong>OpenDocument format</strong></li></ul>`,
  },
];

export default function DocxToOdtPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <DocxToOdt />
    </ToolContainer>
  );
}
