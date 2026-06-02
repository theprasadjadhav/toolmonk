import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { PdfRotate } from "@/components/tools/lazy-client";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("pdf-rotate");

const tool = TOOLS.find((t) => t.slug === "pdf-rotate")!;

const howToSteps = [
  "Drop a PDF onto the upload area or click to browse. <strong>All pages</strong> are shown as thumbnails so you can see which ones need rotating.",
  "Use the <strong>thumbnail grid</strong> to select the specific pages you want to rotate. You can select all pages or just the individual pages that are sideways or upside-down.",
  "Choose a <strong>rotation direction</strong>: 90° Left, 90° Right, or 180°. The rotation applies to all selected pages.",
  "Click <strong>Rotate</strong> — the thumbnails refresh to show the corrected orientation, and the updated PDF downloads automatically.",
];

const faqs = [
  {
    question: "Can I rotate only specific pages?",
    answer:
      "Yes — use the <strong>thumbnail selector</strong> to pick exactly which pages to rotate. Deselect any pages you want to leave unchanged. This is useful when only a few scanned pages came in sideways.",
  },
  {
    question: "Does rotation affect the PDF quality?",
    answer:
      "No. Rotation is a <strong>metadata operation</strong> — it updates the page orientation flag in the PDF structure without re-rendering or re-encoding any content. Text, images, and formatting are completely unaffected.",
  },
  {
    question: "What if a page is already rotated at an angle?",
    answer:
      "The tool <strong>adds</strong> the selected rotation to the page's current orientation. For example, a page already rotated 90° clockwise that you rotate another 90° right will end up at 180°. Rotating 90° left would bring it back to 0°.",
  },
  {
    question: "Are my files uploaded anywhere?",
    answer:
      "No. All rotation runs entirely in your <strong>browser</strong>. Your files never leave your device.",
  },
  {
    question: "Can I rotate all pages at once?",
    answer:
      "Yes — use the <strong>Select All</strong> option in the thumbnail grid to select every page, then apply the rotation. This is useful when an entire scanned document was fed into a scanner sideways.",
  },
  {
    question: "Will the rotation be saved permanently in the PDF?",
    answer:
      "Yes. The downloaded PDF file has the rotation <strong>permanently written</strong> into the page orientation data. Any PDF viewer will display the pages in the corrected orientation without needing to rotate manually.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Why Do PDFs Need Rotating?",
    content: `<p>PDFs frequently end up with incorrect page orientations for a few common reasons. Scanned documents are the most common culprit — if pages are placed in a scanner sideways or upside-down, the resulting PDF reflects that orientation. Similarly, some document creation tools export pages in landscape when the content is portrait, or vice versa.</p><p>Rotating a PDF corrects the orientation permanently. Unlike viewing a rotated page in a PDF reader (which only affects the display session), this tool writes the correct orientation into the file so every viewer shows it correctly without manual adjustment.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>PDF rotation is a practical task across many workflows:</p><ul><li><strong>Correcting scanned documents:</strong> Fix individual pages that were scanned at the wrong angle without re-scanning the entire document.</li><li><strong>Preparing documents for sharing:</strong> Ensure all recipients see pages in the correct orientation regardless of which PDF viewer they use.</li><li><strong>Fixing merged PDFs:</strong> After combining files with different orientations, rotate individual pages to create a consistent reading experience.</li><li><strong>Landscape charts and tables:</strong> Rotate specific pages containing wide tables or diagrams to landscape orientation within an otherwise portrait document.</li></ul>`,
  },
];

export default function PdfRotatePage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <PdfRotate />
    </ToolContainer>
  );
}
