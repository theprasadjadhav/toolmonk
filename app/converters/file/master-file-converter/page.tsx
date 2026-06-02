import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { MasterFileConverter } from "@/components/tools/converters/file/MasterFileConverter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("master-file-converter");

const tool = TOOLS.find((t) => t.slug === "master-file-converter")!;

const howToSteps = [
  "Select your <strong>input file format</strong> from the format grid (e.g. DOCX, PDF, PNG) — this tells the tool what kind of file you are uploading.",
  "Select the <strong>output format</strong> you want to convert to from the available targets for your chosen input.",
  "For <strong>PDF to JPG</strong> conversions, choose the output resolution in DPI — higher DPI means sharper images but larger file sizes.",
  "Upload your file by <strong>dropping it onto the drop zone</strong> or clicking to browse, then click <strong>Convert</strong>.",
  "Download the converted file when processing completes — multi-page PDFs produce one image per page.",
];

const faqs = [
  {
    question: "What formats are supported?",
    answer:
      "<strong>Documents:</strong> DOC, DOCX, ODT. <strong>Presentations:</strong> PPT, PPTX, ODP. <strong>Spreadsheets:</strong> XLS, XLSX, ODS. <strong>PDF.</strong> <strong>Images:</strong> JPG, PNG, WebP, BMP, TIFF. Not all input-to-output combinations are available — the tool shows only valid targets for the selected input.",
  },
  {
    question: "Is my file uploaded to a server?",
    answer:
      "Document, spreadsheet, presentation, and PDF conversions are processed <strong>server-side</strong> — files are deleted immediately after conversion. <strong>Image-to-image conversions</strong> (e.g. PNG to WebP, JPG to PNG) run entirely in your browser and are never uploaded.",
  },
  {
    question: "What is the file size limit?",
    answer:
      "Up to <strong>50 MB</strong> for server-side conversions. Browser-based image conversions are limited only by your device's available memory.",
  },
  {
    question: "Can I convert multi-page PDFs to JPEG?",
    answer:
      "Yes. PDF to JPG converts <strong>every page</strong> to a separate JPEG image, named with the page number. You can download them individually or all at once.",
  },
  {
    question: "Is this free?",
    answer: "Yes — completely free with <strong>no registration</strong> required.",
  },
  {
    question: "Why are some format combinations not available?",
    answer:
      "Only <strong>meaningful and supported conversions</strong> are offered. For example, converting a spreadsheet directly to a presentation would not produce a useful result. The tool limits choices to conversions that produce a practical, usable output file.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Supported Format Groups",
    content: `<p>This tool handles conversions across four main file categories:</p><ul><li><strong>Documents</strong> — Word documents (DOC, DOCX) and OpenDocument text (ODT) can be converted to PDF or to each other</li><li><strong>Spreadsheets</strong> — Excel files (XLS, XLSX) and OpenDocument spreadsheets (ODS) convert to PDF or to each other</li><li><strong>Presentations</strong> — PowerPoint files (PPT, PPTX) and OpenDocument presentations (ODP) convert to PDF or to each other</li><li><strong>Images</strong> — JPG, PNG, WebP, BMP, and TIFF convert between formats; PDFs can be converted to JPG pages</li></ul>`,
  },
  {
    title: "Server-Side vs. Browser-Based Conversion",
    content: `<p>This tool uses two different conversion methods depending on the file type:</p><ul><li><strong>Browser-based</strong> — image-to-image conversions (e.g. JPG to PNG, PNG to WebP) happen entirely on your device. Your file is never uploaded anywhere.</li><li><strong>Server-side</strong> — document, spreadsheet, presentation, and PDF conversions are processed on a secure server. Files are handled in isolated temporary directories and deleted immediately after conversion.</li></ul><p>For server-side conversions, only the file you upload and the converted output are transferred — no metadata is retained.</p>`,
  },
  {
    title: "Common File Conversion Use Cases",
    content: `<p>File conversion is needed in many everyday situations:</p><ul><li><strong>Word to PDF</strong> — share a document that looks the same on any device</li><li><strong>PDF to Word</strong> — extract and edit content from a PDF you received</li><li><strong>PPTX to PDF</strong> — share a presentation without requiring PowerPoint to be installed</li><li><strong>XLSX to PDF</strong> — produce a print-ready version of a spreadsheet</li><li><strong>PNG to WebP</strong> — reduce image file size for faster web page loading</li></ul>`,
  },
];

export default function MasterFileConverterPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <MasterFileConverter />
    </ToolContainer>
  );
}
