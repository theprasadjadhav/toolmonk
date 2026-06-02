import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { PowerpointToPdf } from "@/components/tools/converters/file/PowerpointToPdf";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("pptx-to-pdf");

const tool = TOOLS.find((t) => t.slug === "pptx-to-pdf")!;

const howToSteps = [
  "Click the <strong>drop zone</strong> or drag a PPT or PPTX file onto it to select your PowerPoint presentation.",
  "Click <strong>Convert</strong> to upload and process the file — each slide becomes a page in the output PDF.",
  "Click <strong>Download</strong> to save the converted <strong>PDF file</strong> to your device.",
];

const faqs = [
  {
    question: "Is my file uploaded to a server?",
    answer:
      "Yes — conversion is processed <strong>server-side</strong>. Your file is handled in an isolated temporary environment and <strong>deleted immediately</strong> after the converted PDF is returned to you. No files are stored.",
  },
  {
    question: "Are both .ppt and .pptx supported?",
    answer:
      "Yes. Both the older <strong>.ppt</strong> (PowerPoint 97–2003) format and the modern <strong>.pptx</strong> format are accepted as input.",
  },
  {
    question: "Are slide layouts and images preserved?",
    answer:
      "Slide content, text, images, and most layout formatting are preserved in the PDF. <strong>Animations and transitions</strong> are not carried over — each slide renders as a static page.",
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
    question: "Why convert a PowerPoint presentation to PDF?",
    answer:
      "Converting to PDF ensures your presentation <strong>looks exactly the same</strong> on any device, regardless of whether the recipient has PowerPoint installed. PDFs cannot be accidentally edited and are universally openable — making them the preferred format for sharing final presentations.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About PPTX Files",
    content: `<p><strong>PPTX</strong> is the standard Microsoft PowerPoint presentation format (PowerPoint 2007 and later). It stores slides as XML with embedded images, fonts, and layout information. While PPTX is widely supported, the presentation may look different if the recipient uses a different version of PowerPoint or a different office application.</p><p>Converting to PDF before sharing eliminates font substitution, layout shifts, and formatting differences — ensuring everyone sees the presentation exactly as you designed it.</p>`,
  },
  {
    title: "Why Share Presentations as PDF?",
    content: `<p>Sharing a presentation as a PDF rather than a PPTX file has several practical advantages:</p><ul><li><strong>Universal viewing</strong> — any device can open a PDF without requiring office software</li><li><strong>Consistent appearance</strong> — fonts, colors, and layouts display identically everywhere</li><li><strong>Prevents accidental editing</strong> — recipients can view but not modify the content</li><li><strong>Smaller file size</strong> — PDFs are often smaller than the equivalent PPTX, especially for image-heavy presentations</li></ul>`,
  },
  {
    title: "About PDF Files",
    content: `<p><strong>PDF (Portable Document Format)</strong> is the world's most widely used document format. It is designed to display content identically across all devices and operating systems. PDFs can contain text, images, vector graphics, and multiple pages — all in a single self-contained file that can be viewed, printed, and shared without requiring the original software.</p>`,
  },
];

export default function PptxToPdfPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <PowerpointToPdf />
    </ToolContainer>
  );
}
