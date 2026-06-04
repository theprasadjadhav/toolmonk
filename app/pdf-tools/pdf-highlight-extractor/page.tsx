import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { PdfHighlightExtractor } from "@/components/tools/lazy-client";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("pdf-highlight-extractor");

const tool = TOOLS.find((t) => t.slug === "pdf-highlight-extractor")!;

const howToSteps = [
  "Upload a PDF by dropping it onto the upload area or clicking to browse. The tool checks for selectable text — scanned image PDFs won't work.",
  "Draw highlight rectangles over any text by clicking and dragging. Use the <strong>color swatches</strong> to switch between yellow, green, blue, and pink. Press <strong>H</strong> to switch to the highlight tool.",
  "To remove a highlight, switch to the <strong>Erase tool</strong> (press <strong>E</strong>), then click any existing highlight. Hovering shows a red outline before you click. Use <strong>Ctrl+Z</strong> to undo.",
  "Click <strong>Export</strong> to open the export panel. Choose <strong>Full PDF</strong> to download the original PDF as-is, or <strong>Highlights Only</strong> to export just the marked passages. For highlights, pick a format: DOCX (colors preserved in Word), PDF (colored blocks), TXT (plain text), or Print. Your session is auto-saved — close the tab and resume later.",
];

const faqs = [
  {
    question: "Why doesn't my PDF work?",
    answer:
      "The PDF Highlight Extractor only works with PDFs that contain <strong>selectable text</strong>. If your PDF is a scanned document (an image inside a PDF container), the text cannot be extracted. Try selecting text in your PDF reader — if you can't select anything, it's a scanned PDF. To make a scanned PDF work, run it through OCR software first (e.g. Adobe Acrobat, online OCR tools).",
  },
  {
    question: "Is my PDF uploaded to a server?",
    answer:
      "No. Everything runs entirely in your browser. Your PDF never leaves your device — it's loaded into browser memory, and your highlights are saved to your browser's local storage (IndexedDB). Nothing is transmitted anywhere.",
  },
  {
    question: "What happens if I close the tab?",
    answer:
      "Your session is <strong>automatically saved</strong> in your browser as you work. When you return to the PDF Highlight Extractor, a banner appears offering to resume your last session — including the PDF and all highlights exactly as you left them.",
  },
  {
    question: "What do the export formats include?",
    answer:
      "The export panel offers two modes. <strong>Full PDF:</strong> downloads the original PDF exactly as loaded — useful for saving a clean copy. <strong>Highlights Only</strong> exports just the marked passages in your chosen format: <strong>DOCX</strong> preserves highlight colors as native Word highlighting, organized by page. <strong>PDF</strong> produces a new PDF with colored text blocks per page. <strong>TXT</strong> gives plain text with page headings — ideal for notes or pasting elsewhere. <strong>Print</strong> opens the browser print dialog; choose 'Save as PDF' to get a quick PDF without creating a file first.",
  },
  {
    question: "How does the text extraction work for columns and tables?",
    answer:
      "The tool analyzes the spatial positions of text characters in your highlight area. It detects <strong>multi-column layouts</strong> (common in academic papers and newspapers) and reads each column separately. For <strong>tables</strong>, it detects aligned rows and columns and formats the output as a Markdown-style table. Single-column documents extract with paragraph breaks preserved.",
  },
  {
    question: "Can I highlight across multiple pages?",
    answer:
      "Yes — scroll through the PDF and highlight on any page. The export collects highlights from all pages, organized by page number.",
  },
  {
    question: "Is there a file size limit?",
    answer:
      "There is no strict limit since processing runs in your browser. Very large PDFs (over 50 MB) may be slow to load depending on your device. The tool lazy-renders pages, so only visible pages are processed at any given time.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "How PDF text extraction works",
    content: `<p>PDFs store text as individually positioned characters and words — not as flowing paragraphs like a Word document. This tool uses <strong>PDF.js</strong> to render each page and extract the exact coordinates of every text item. When you draw a highlight rectangle, it finds all text items whose bounding boxes intersect that rectangle.</p><p>The result is then reconstructed into readable text by grouping characters into lines, detecting paragraph breaks (by measuring vertical gaps between lines), and handling special layouts like two-column academic papers and data tables.</p>`,
  },
  {
    title: "Multi-column and table detection",
    content: `<p>Standard left-to-right text extraction fails on multi-column layouts — it mixes up left column and right column text. This tool detects column boundaries by looking for consistent <strong>horizontal gaps</strong> that appear across multiple rows of text. When a gap is found, each column is extracted independently and combined in reading order.</p><p>For tables, the tool looks for rows where text items are <strong>consistently aligned</strong> at the same X positions across rows. Detected tables are formatted with aligned columns separated by pipes — compatible with Markdown and readable in plain text.</p>`,
  },
  {
    title: "When to use each export format",
    content: `<ul><li><strong>Full PDF:</strong> Downloads the original PDF exactly as loaded. Use this when you need the complete document alongside your highlights.</li><li><strong>DOCX (Highlights Only):</strong> Best for research notes, study guides, and quotes you'll edit in Word or Google Docs. Highlight colors are preserved as native Word highlighting, organized by page.</li><li><strong>PDF (Highlights Only):</strong> Best for sharing a clean summary. The output is a new standalone PDF containing only the highlighted passages with colored backgrounds.</li><li><strong>TXT (Highlights Only):</strong> Best for pasting into Notion, Obsidian, email, or any plain-text field. No formatting — just clean text with page references.</li><li><strong>Print:</strong> Opens the browser print dialog. Choose "Save as PDF" to get a quick PDF without creating a separate file first.</li></ul>`,
  },
];

export default function PdfHighlightExtractorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <PdfHighlightExtractor />
    </ToolContainer>
  );
}
