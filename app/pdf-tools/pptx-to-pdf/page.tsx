import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { PowerpointToPdf } from "@/components/tools/shared/file-converters/PowerpointToPdf";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("pptx-to-pdf");
const tool = TOOLS.find((t) => t.slug === "pptx-to-pdf" && t.category === "pdf-tools")!;

const howToSteps = [
  "Click the <strong>drop zone</strong> or drag a PPT or PPTX file onto it. The file name will appear to confirm it has been selected.",
  "Click <strong>Convert</strong> to start the conversion. Larger presentations with many slides or embedded media may take a few extra seconds.",
  "Once conversion is complete, click <strong>Download</strong> to save the resulting PDF to your device.",
];

const faqs = [
  {
    question: "Is my file uploaded to a server?",
    answer:
      "Yes — conversion is handled <strong>server-side</strong>. Your file is processed in an isolated temporary directory and deleted immediately after the converted PDF is sent back. No files are stored.",
  },
  {
    question: "Are both .ppt and .pptx supported?",
    answer:
      "Yes. Both the <strong>legacy .ppt</strong> format and the modern <strong>.pptx</strong> format are supported.",
  },
  {
    question: "Are slide layouts and images preserved?",
    answer:
      "Slide <strong>content, images, text, and most formatting</strong> are preserved. Complex animations are converted to static content in the PDF — each slide is rendered as a fixed layout.",
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
    question: "Why would I convert a presentation to PDF?",
    answer:
      "Converting to PDF ensures your presentation looks the same on <strong>any device</strong> — regardless of whether the recipient has presentation software installed. PDFs are also easier to share via email, print, and distribute without worrying about font or layout differences.",
  },
  {
    question: "Will slide notes be included in the PDF?",
    answer:
      "By default, the conversion produces a standard <strong>slide-per-page PDF</strong> showing only the slide content. Speaker notes are not included in the output.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About PowerPoint and PDF Files",
    content: `<p>A <strong>PowerPoint file (.pptx)</strong> is a slide-based presentation format designed for live presentations. It stores slides, speaker notes, animations, transitions, and embedded media in an editable format that requires presentation software to display correctly.</p><p>A <strong>PDF</strong> is a fixed-layout document format that renders consistently on any device without requiring specialized software. Converting a presentation to PDF produces a static, printable version of each slide — ideal for sharing, archiving, or distributing to audiences who don't need to edit or present the content.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Converting presentations to PDF is useful in many professional situations:</p><ul><li><strong>Sharing slide decks:</strong> Send a PDF version so recipients can view the content without needing presentation software.</li><li><strong>Printing handouts:</strong> PDF is the most reliable format for printing presentation slides cleanly.</li><li><strong>Archiving:</strong> Store finalized presentations as PDFs for long-term reference without worrying about software compatibility changes.</li><li><strong>Embedding in documents:</strong> Combine a converted presentation PDF with other reports or documentation using the PDF Merger tool.</li></ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>To get the cleanest PDF from your presentation:</p><ul><li>Ensure all <strong>embedded fonts and images</strong> are included in the source file before converting.</li><li>Use standard system fonts in your slides for the most consistent rendering — custom or unusual fonts may substitute with alternates.</li><li>Check that <strong>image quality</strong> in the source presentation is sufficient — low-resolution images will appear blurry in the PDF output.</li><li>Review the converted PDF by zooming into text-heavy slides to confirm legibility before distributing.</li></ul>`,
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
