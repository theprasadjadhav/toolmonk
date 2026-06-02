import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { CsvToJson } from "@/components/tools/converters/CsvToJson";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("csv-to-json");

const tool = TOOLS.find((t) => t.slug === "csv-to-json")!;

const howToSteps = [
  "Paste your <strong>CSV data</strong> into the left editor, or click the folder icon to load a file from your device.",
  "If your CSV has <strong>column names in the first row</strong>, keep the 'First row is header' checkbox enabled — each JSON object will use those names as keys.",
  "Choose the correct <strong>delimiter</strong> for your data: comma, semicolon, tab, or pipe.",
  "The <strong>JSON array output</strong> updates instantly — copy or download it using the buttons above the right panel.",
];

const faqs = [
  {
    question: "Does it handle quoted fields with commas inside them?",
    answer:
      "Yes. The parser follows <strong>RFC 4180</strong>, so quoted fields containing commas, newlines, or embedded quote characters are all parsed correctly. For example, <code>\"Smith, John\"</code> is treated as a single field.",
  },
  {
    question: "Are data types auto-detected?",
    answer:
      "Yes — <strong>numbers</strong>, <strong>booleans</strong> (true/false), and <strong>empty fields</strong> (converted to null) are coerced automatically. If a field contains only digits, it becomes a JSON number; if it contains 'true' or 'false', it becomes a JSON boolean.",
  },
  {
    question: "What if my CSV has no header row?",
    answer:
      "Uncheck <strong>'First row is header'</strong> and each row will be output as a <strong>JSON array</strong> of values rather than a named object.",
  },
  {
    question: "Is data sent to a server?",
    answer:
      "No. All parsing happens <strong>locally in your browser</strong>. Your data never leaves your device.",
  },
  {
    question: "What is the difference between CSV and JSON?",
    answer:
      "<strong>CSV</strong> (Comma-Separated Values) is a flat tabular format ideal for spreadsheets and simple data exports. <strong>JSON</strong> (JavaScript Object Notation) is a hierarchical format preferred by APIs, databases, and configuration files. Converting CSV to JSON makes tabular data compatible with modern web services.",
  },
  {
    question: "Can I change the delimiter?",
    answer:
      "Yes. The tool supports <strong>comma</strong>, <strong>semicolon</strong>, <strong>tab</strong>, and <strong>pipe (|)</strong> delimiters. Some European spreadsheet applications export CSV with semicolons by default — use the semicolon option in that case.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is CSV?",
    content: `<p><strong>CSV (Comma-Separated Values)</strong> is one of the oldest and most widely supported data exchange formats. Each line represents a record, and each field within a line is separated by a delimiter — most commonly a comma. The first line often contains column headers.</p><p>CSV files are universally supported by spreadsheet applications, databases, and data-processing tools, making them a common export format. However, CSV has no standard way to represent nested data, data types, or null values — which is why converting to JSON is often necessary before loading data into modern APIs or applications.</p>`,
  },
  {
    title: "What is JSON?",
    content: `<p><strong>JSON (JavaScript Object Notation)</strong> is a lightweight, human-readable data format built on two structures: <strong>objects</strong> (key-value pairs) and <strong>arrays</strong> (ordered lists). It is the dominant format for web APIs and configuration files because it maps naturally to data structures used by nearly every programming language.</p><p>When you convert CSV to JSON, each row typically becomes a JSON object and the collection of rows becomes a JSON array. This makes it straightforward to load the data into any API, database, or front-end application.</p>`,
  },
  {
    title: "Common Use Cases for CSV to JSON Conversion",
    content: `<p>Converting CSV to JSON is useful in many real-world scenarios:</p><ul><li><strong>Loading spreadsheet data into a web application</strong> — export from Excel or Google Sheets, then convert to JSON for use in charts or tables</li><li><strong>Feeding data into an API</strong> — most REST APIs accept JSON payloads, not CSV</li><li><strong>Database imports</strong> — document databases accept JSON documents directly</li><li><strong>Data transformation pipelines</strong> — JSON is easier to filter, reshape, and merge than flat CSV</li></ul>`,
  },
];

export default function CsvToJsonPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <CsvToJson />
    </ToolContainer>
  );
}
