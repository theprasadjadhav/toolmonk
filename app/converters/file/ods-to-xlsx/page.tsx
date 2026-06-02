import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { OdsToXlsx } from "@/components/tools/converters/file/OdsToXlsx";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("ods-to-xlsx");

const tool = TOOLS.find((t) => t.slug === "ods-to-xlsx")!;

const howToSteps = [
  "Click the <strong>drop zone</strong> or drag an ODS file onto it to select your OpenDocument spreadsheet.",
  "Click <strong>Convert</strong> to upload and process the file — conversion typically completes in a few seconds.",
  "Click <strong>Download</strong> to save the converted <strong>XLSX file</strong> to your device.",
];

const faqs = [
  {
    question: "Is my file uploaded to a server?",
    answer:
      "Yes — conversion is processed <strong>server-side</strong>. Your file is handled in an isolated temporary environment and <strong>deleted immediately</strong> after the converted file is returned to you. No files are stored.",
  },
  {
    question: "Will the XLSX open correctly in Microsoft Excel?",
    answer:
      "Yes. The output is a standard <strong>.xlsx file</strong> compatible with Excel 2007 and later, as well as Google Sheets and other applications that support the format.",
  },
  {
    question: "Are formulas and formatting preserved?",
    answer:
      "<strong>Cell values, basic formulas, and formatting</strong> are preserved during conversion. Some advanced ODS-specific formulas may not have a direct XLSX equivalent and could require manual adjustment.",
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
    question: "What is ODS format?",
    answer:
      "<strong>ODS (OpenDocument Spreadsheet)</strong> is the open international standard for spreadsheet files, used by LibreOffice Calc and other open-source office suites. Converting ODS to XLSX makes the spreadsheet compatible with Microsoft Excel and the broader ecosystem of tools that support the XLSX format.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About ODS Files",
    content: `<p><strong>ODS (OpenDocument Spreadsheet)</strong> is the spreadsheet format of the OpenDocument standard (ISO/IEC 26300). It is the native format of LibreOffice Calc and is designed for maximum interoperability between different office applications without requiring proprietary software.</p><p>ODS is common in open-source, government, and academic environments. Converting to XLSX is necessary when sharing spreadsheets with colleagues or clients who use Microsoft Excel or other tools that do not support ODS natively.</p>`,
  },
  {
    title: "About XLSX Files",
    content: `<p><strong>XLSX</strong> is the default spreadsheet format for Microsoft Excel (Excel 2007 and later). It stores data, formulas, charts, and formatting in a compressed XML-based structure. XLSX is the most universally supported spreadsheet format — Excel, Google Sheets, LibreOffice Calc, Apple Numbers, and virtually every data tool can read it.</p><p>XLSX supports a wide range of features including multiple worksheets, pivot tables, data validation, conditional formatting, and a large library of built-in formulas.</p>`,
  },
];

export default function OdsToXlsxPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <OdsToXlsx />
    </ToolContainer>
  );
}
