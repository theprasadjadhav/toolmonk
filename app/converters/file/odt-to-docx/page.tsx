import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { OdtToDocx } from "@/components/tools/converters/file/OdtToDocx";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("odt-to-docx");

const tool = TOOLS.find((t) => t.slug === "odt-to-docx")!;

const howToSteps = [
  "Click the <strong>drop zone</strong> or drag an ODT file onto it to select your OpenDocument text file.",
  "Click <strong>Convert</strong> to upload and process the file — conversion typically takes a few seconds.",
  "Click <strong>Download</strong> to save the converted <strong>DOCX file</strong> to your device.",
];

const faqs = [
  {
    question: "Is my file uploaded to a server?",
    answer:
      "Yes — conversion is processed <strong>server-side</strong>. Your file is handled in an isolated temporary environment and <strong>deleted immediately</strong> after the converted file is returned to you. No files are stored.",
  },
  {
    question: "Will the DOCX open correctly in Microsoft Word?",
    answer:
      "Yes. The output is a standard <strong>.docx file</strong> compatible with Microsoft Word 2007 and later, as well as Google Docs and other applications that support the format.",
  },
  {
    question: "Is formatting preserved?",
    answer:
      "Most formatting is preserved during conversion, including <strong>text styles, fonts, tables, and embedded images</strong>. Complex or custom ODT styles may require minor manual adjustment after opening in Word.",
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
    question: "Why would I need to convert ODT to DOCX?",
    answer:
      "ODT is the native format of LibreOffice and other open-source office suites. Converting to <strong>DOCX</strong> makes the document compatible with <strong>Microsoft Word</strong>, which is the most widely used word processor in business and professional environments.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About ODT Files",
    content: `<p><strong>ODT (OpenDocument Text)</strong> is the word-processing format of the OpenDocument standard (ISO/IEC 26300). It is the native format of LibreOffice Writer and is an open, royalty-free standard. ODT is widely used in open-source, government, and academic environments as an alternative to proprietary formats.</p><p>Because ODT is an open standard, it ensures documents can be opened and edited without purchasing specific software. However, many business environments and professional workflows use Microsoft Word exclusively, making DOCX conversion necessary for sharing.</p>`,
  },
  {
    title: "About DOCX Files",
    content: `<p><strong>DOCX</strong> is the default format for Microsoft Word documents (Word 2007 and later). It is based on the Office Open XML standard and is the most widely used word-processing format in business, legal, and academic settings. DOCX is supported by Microsoft Word, Google Docs, Apple Pages, LibreOffice, and virtually every word processor.</p><p>Converting ODT to DOCX ensures your document is compatible with the broadest possible range of recipients and professional workflows.</p>`,
  },
];

export default function OdtToDocxPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <OdtToDocx />
    </ToolContainer>
  );
}
