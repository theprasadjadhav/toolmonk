import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { XlsxToOds } from "@/components/tools/converters/file/XlsxToOds";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("xlsx-to-ods");

const tool = TOOLS.find((t) => t.slug === "xlsx-to-ods")!;

const howToSteps = [
  "Click the <strong>drop zone</strong> or drag an XLS or XLSX file onto it to select your Excel spreadsheet.",
  "Click <strong>Convert</strong> to upload and process the file — conversion typically takes a few seconds.",
  "Click <strong>Download</strong> to save the converted <strong>ODS file</strong> to your device.",
];

const faqs = [
  {
    question: "Is my file uploaded to a server?",
    answer:
      "Yes — conversion is processed <strong>server-side</strong>. Your file is handled in an isolated temporary environment and <strong>deleted immediately</strong> after the converted file is returned to you. No files are stored.",
  },
  {
    question: "What is ODS format?",
    answer:
      "<strong>ODS (OpenDocument Spreadsheet)</strong> is the open international standard for spreadsheet files, used natively by LibreOffice Calc, Apache OpenOffice Calc, and other open-source office applications. It is a royalty-free, vendor-neutral format designed for long-term document accessibility.",
  },
  {
    question: "Are both .xls and .xlsx supported?",
    answer:
      "Yes. Both the older <strong>.xls</strong> (Excel 97–2003) format and the modern <strong>.xlsx</strong> format are accepted as input.",
  },
  {
    question: "Are formulas and formatting preserved?",
    answer:
      "Most <strong>cell values, basic formulas, and formatting</strong> are preserved. Advanced Excel-specific features — such as Power Query, Power Pivot, or certain Excel-only functions — may not have direct ODS equivalents.",
  },
  {
    question: "Is there a file size limit?",
    answer: "Files up to <strong>50 MB</strong> are supported.",
  },
  {
    question: "Is this free?",
    answer: "Yes — completely free with <strong>no registration</strong> required.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About XLSX Files",
    content: `<p><strong>XLSX</strong> is the default format for Microsoft Excel spreadsheets (Excel 2007 and later). It stores data, formulas, charts, and formatting in a compressed XML structure. XLSX is the most widely used spreadsheet format in business and data workflows worldwide.</p><p>While XLSX is broadly supported, it is a proprietary format with some features exclusive to Excel. Converting to ODS produces an open-standard file for use in LibreOffice and other open-source tools.</p>`,
  },
  {
    title: "About ODS Files",
    content: `<p><strong>ODS (OpenDocument Spreadsheet)</strong> is the spreadsheet format of the OpenDocument standard (ISO/IEC 26300). It is an open, royalty-free format used by LibreOffice Calc, Apache OpenOffice Calc, and other applications. ODS ensures your spreadsheet can be opened and edited without any proprietary software license.</p><p>ODS is particularly valued in government, education, and open-source environments where document interoperability and long-term archiving are priorities.</p>`,
  },
  {
    title: "When to Convert XLSX to ODS",
    content: `<p>Converting Excel files to ODS is useful when:</p><ul><li>You need to open or edit the spreadsheet using <strong>LibreOffice Calc</strong> or another open-source office suite</li><li>Your organization requires data files in an <strong>open standard format</strong> for compliance or long-term archiving</li><li>You are sharing the spreadsheet with someone who does not have access to Microsoft Excel</li><li>You are submitting data to a system or authority that requires <strong>OpenDocument format</strong></li></ul>`,
  },
];

export default function XlsxToOdsPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <XlsxToOds />
    </ToolContainer>
  );
}
