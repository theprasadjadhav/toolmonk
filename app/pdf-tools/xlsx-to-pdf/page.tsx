import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { ExcelToPdf } from "@/components/tools/shared/file-converters/ExcelToPdf";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("xlsx-to-pdf");
const tool = TOOLS.find((t) => t.slug === "xlsx-to-pdf" && t.category === "pdf-tools")!;

const howToSteps = [
  "Click the <strong>drop zone</strong> or drag an XLS or XLSX file onto it. The file name will appear to confirm it has been selected.",
  "Click <strong>Convert</strong> to start the conversion. The time required depends on the number of sheets and the amount of data.",
  "Once conversion is complete, click <strong>Download</strong> to save the resulting PDF to your device.",
];

const faqs = [
  {
    question: "Is my file uploaded to a server?",
    answer:
      "Yes — conversion is handled <strong>server-side</strong>. Your file is processed in an isolated temporary directory and deleted immediately after the converted PDF is sent back. No files are stored.",
  },
  {
    question: "Are both .xls and .xlsx supported?",
    answer:
      "Yes. Both the <strong>legacy .xls</strong> format and the modern <strong>.xlsx</strong> format are supported.",
  },
  {
    question: "Are tables and charts preserved?",
    answer:
      "<strong>Cell values, formatting, borders, and charts</strong> are preserved in the conversion. Some Excel-specific features such as pivot tables or advanced conditional formatting may render differently in the PDF output.",
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
    question: "Are all worksheets included in the PDF?",
    answer:
      "All <strong>visible worksheets</strong> in the spreadsheet are included in the converted PDF. Each sheet typically appears as one or more pages depending on the amount of data and the print area settings in the source file.",
  },
  {
    question: "Why would I convert a spreadsheet to PDF?",
    answer:
      "Converting to PDF ensures your spreadsheet data is <strong>viewable by anyone</strong> without requiring spreadsheet software. PDFs also prevent accidental edits to data and preserve the layout exactly as it appears — useful for sharing financial reports, invoices, or data tables.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About Excel and PDF Files",
    content: `<p>An <strong>Excel spreadsheet (.xlsx)</strong> is a grid-based file format used for organizing, calculating, and analyzing data. It is designed to be interactive and editable, with support for formulas, charts, and multiple sheets.</p><p>A <strong>PDF</strong> is a fixed-layout format that presents content consistently across all devices. Converting a spreadsheet to PDF produces a static, printable version of the data — ideal for sharing reports, distributing data summaries, or archiving records without allowing recipients to modify the underlying values.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Converting spreadsheets to PDF is common across finance, operations, and administration:</p><ul><li><strong>Financial reports:</strong> Share budget summaries, income statements, or expense reports as read-only PDFs.</li><li><strong>Invoices:</strong> Convert invoice templates to PDF before sending to clients to prevent accidental edits.</li><li><strong>Data exports:</strong> Produce a clean, printable version of a dataset for review in meetings or as part of a report package.</li><li><strong>Archiving:</strong> Store finalized spreadsheet data as PDFs for long-term records that don't depend on software compatibility.</li></ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>For the cleanest spreadsheet-to-PDF conversion:</p><ul><li>Set the <strong>print area</strong> in the source file before converting so only the relevant data is included in the PDF.</li><li>Adjust <strong>column widths</strong> to prevent data from being cut off — very wide tables may need to be scaled down or split across pages.</li><li>Consider using <strong>freeze panes</strong> or headers in the source file to ensure column labels appear at the top of each page in the output.</li><li>Review the PDF at 100% zoom to confirm that all cells, numbers, and labels are legible before distributing.</li></ul>`,
  },
];

export default function XlsxToPdfPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <ExcelToPdf />
    </ToolContainer>
  );
}
