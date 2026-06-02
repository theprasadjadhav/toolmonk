import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { ExcelToPdf } from "@/components/tools/converters/file/ExcelToPdf";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("xlsx-to-pdf");

const tool = TOOLS.find((t) => t.slug === "xlsx-to-pdf")!;

const howToSteps = [
  "Click the <strong>drop zone</strong> or drag an XLS or XLSX file onto it to select your Excel spreadsheet.",
  "Click <strong>Convert</strong> to upload and process the file — conversion typically takes a few seconds.",
  "Click <strong>Download</strong> to save the converted <strong>PDF file</strong> to your device.",
];

const faqs = [
  {
    question: "Is my file uploaded to a server?",
    answer:
      "Yes — conversion is processed <strong>server-side</strong>. Your file is handled in an isolated temporary environment and <strong>deleted immediately</strong> after the converted PDF is returned to you. No files are stored.",
  },
  {
    question: "Are both .xls and .xlsx supported?",
    answer:
      "Yes. Both the older <strong>.xls</strong> (Excel 97–2003) format and the modern <strong>.xlsx</strong> format are accepted as input.",
  },
  {
    question: "Are tables and charts preserved?",
    answer:
      "<strong>Cell values, formatting, and charts</strong> are preserved in the PDF output. Complex Excel-specific features — such as pivot tables and certain conditional formatting rules — may render differently in the PDF.",
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
    question: "Why convert an Excel spreadsheet to PDF?",
    answer:
      "Converting to PDF ensures the spreadsheet <strong>looks the same for everyone</strong> who opens it — preserving column widths, fonts, and layout without requiring the recipient to have Excel. PDFs are the standard format for sharing reports, invoices, financial summaries, and data exports that should not be edited.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About XLSX Files",
    content: `<p><strong>XLSX</strong> is the default format for Microsoft Excel spreadsheets (Excel 2007 and later). It stores data, formulas, charts, and formatting in a compressed XML structure. XLSX is the most widely used format for tabular data and financial information in business environments.</p><p>While XLSX is broadly supported, the spreadsheet's appearance can vary between different versions of Excel and other applications depending on available fonts and feature support. Converting to PDF before sharing eliminates these inconsistencies.</p>`,
  },
  {
    title: "Why Share Spreadsheets as PDF?",
    content: `<p>Converting an Excel file to PDF before sharing has several advantages:</p><ul><li><strong>Consistent appearance</strong> — column widths, fonts, and page layout are preserved exactly as designed</li><li><strong>Prevents accidental edits</strong> — recipients can read but cannot modify formulas or data</li><li><strong>Universal compatibility</strong> — every device can open a PDF without needing Excel</li><li><strong>Print-ready</strong> — PDFs honor Excel's print area and page settings, making them ideal for printing reports and invoices</li></ul>`,
  },
  {
    title: "About PDF Files",
    content: `<p><strong>PDF (Portable Document Format)</strong> is the world's most widely used document format, designed to display content identically on any device or operating system. PDFs embed all fonts, images, and layout instructions they need — ensuring the document looks the same on a phone, tablet, or desktop, on Windows, macOS, or Linux.</p><p>PDFs are the standard for sharing final reports, invoices, financial summaries, and any document where layout consistency and read-only presentation matter.</p>`,
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
