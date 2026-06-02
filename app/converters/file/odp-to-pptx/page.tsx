import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { OdpToPptx } from "@/components/tools/converters/file/OdpToPptx";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("odp-to-pptx");

const tool = TOOLS.find((t) => t.slug === "odp-to-pptx")!;

const howToSteps = [
  "Click the <strong>drop zone</strong> or drag an ODP file onto it to select your OpenDocument presentation.",
  "Click <strong>Convert</strong> to upload and process the file — conversion usually takes a few seconds.",
  "Click <strong>Download</strong> to save the converted <strong>PPTX file</strong> to your device.",
];

const faqs = [
  {
    question: "Is my file uploaded to a server?",
    answer:
      "Yes — conversion is processed <strong>server-side</strong>. Your file is handled in an isolated temporary environment and <strong>deleted immediately</strong> after the converted file is returned to you. No files are stored.",
  },
  {
    question: "Will the PPTX open correctly in Microsoft PowerPoint?",
    answer:
      "Yes. The output is a standard <strong>.pptx file</strong> compatible with PowerPoint 2007 and later, as well as Google Slides and other applications that support the format.",
  },
  {
    question: "Is formatting preserved?",
    answer:
      "Slide content, text, images, and most layout elements are preserved during conversion. <strong>Animations and transitions</strong> may not carry over perfectly, as ODP and PPTX handle these differently.",
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
    question: "What is ODP format?",
    answer:
      "<strong>ODP (OpenDocument Presentation)</strong> is the open international standard for presentation files, used by LibreOffice Impress, Apache OpenOffice, and other open-source office suites. Converting ODP to PPTX makes the presentation compatible with Microsoft PowerPoint and other widely used presentation tools.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About ODP Files",
    content: `<p><strong>ODP (OpenDocument Presentation)</strong> is the presentation format of the OpenDocument standard (ISO/IEC 26300). It is the native format of LibreOffice Impress and is an open, royalty-free standard designed for long-term document interoperability.</p><p>ODP files are used in environments that prefer open-source software or require documents in an open standard. Converting to PPTX is needed when sharing presentations with colleagues or clients who use Microsoft PowerPoint.</p>`,
  },
  {
    title: "About PPTX Files",
    content: `<p><strong>PPTX</strong> is the default format for Microsoft PowerPoint presentations (PowerPoint 2007 and later). Like DOCX and XLSX, it is a compressed archive of XML files. PPTX is the most widely used presentation format in business and education worldwide.</p><p>PPTX is supported not just by PowerPoint but also by Google Slides, Apple Keynote (with some formatting differences), and many other presentation tools, making it the best format for sharing presentations broadly.</p>`,
  },
];

export default function OdpToPptxPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <OdpToPptx />
    </ToolContainer>
  );
}
