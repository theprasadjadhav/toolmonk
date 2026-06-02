import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { PptxToOdp } from "@/components/tools/converters/file/PptxToOdp";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("pptx-to-odp");

const tool = TOOLS.find((t) => t.slug === "pptx-to-odp")!;

const howToSteps = [
  "Click the <strong>drop zone</strong> or drag a PPT or PPTX file onto it to select your PowerPoint presentation.",
  "Click <strong>Convert</strong> to upload and process the file — conversion typically takes a few seconds.",
  "Click <strong>Download</strong> to save the converted <strong>ODP file</strong> to your device.",
];

const faqs = [
  {
    question: "Is my file uploaded to a server?",
    answer:
      "Yes — conversion is processed <strong>server-side</strong>. Your file is handled in an isolated temporary environment and <strong>deleted immediately</strong> after the converted file is returned to you. No files are stored.",
  },
  {
    question: "What is ODP format?",
    answer:
      "<strong>ODP (OpenDocument Presentation)</strong> is the open international standard for presentation files. It is the native format of LibreOffice Impress and other open-source office suites. Converting PPTX to ODP makes the presentation compatible with open-source software without requiring Microsoft PowerPoint.",
  },
  {
    question: "Are both .ppt and .pptx supported?",
    answer:
      "Yes. Both the older <strong>.ppt</strong> (PowerPoint 97–2003) format and the modern <strong>.pptx</strong> format are accepted as input.",
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
    question: "Is formatting preserved?",
    answer:
      "Slide content, text, images, and most layout elements are preserved. <strong>Animations, transitions, and advanced effects</strong> specific to PowerPoint may not fully carry over to ODP format.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About PPTX Files",
    content: `<p><strong>PPTX</strong> is the default format for Microsoft PowerPoint presentations (PowerPoint 2007 and later). It stores slides, images, text, animations, and transitions in a compressed XML-based structure. PPTX is the most widely used presentation format in business and education.</p><p>While PPTX is broadly supported, it is a proprietary format. Some features are specific to Microsoft PowerPoint and may not render identically in other applications. Converting to ODP produces an open-standard file for use with LibreOffice and other open-source tools.</p>`,
  },
  {
    title: "About ODP Files",
    content: `<p><strong>ODP (OpenDocument Presentation)</strong> is the presentation format of the OpenDocument standard (ISO/IEC 26300). It is the native format of LibreOffice Impress and Apache OpenOffice Impress, and is an open, royalty-free standard designed to ensure long-term document accessibility.</p><p>ODP is used in environments that prefer open-source software, require documents in an open standard, or need presentations that work without proprietary software licenses.</p>`,
  },
];

export default function PptxToOdpPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <PptxToOdp />
    </ToolContainer>
  );
}
