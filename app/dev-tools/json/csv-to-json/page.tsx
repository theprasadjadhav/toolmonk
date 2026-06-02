import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { CsvToJson } from "@/components/tools/shared/data-formats/CsvToJson";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("csv-to-json");
const tool = TOOLS.find((t) => t.slug === "csv-to-json" && t.category === "dev-tools")!;

const howToSteps = [
  "Paste your <strong>CSV data</strong> into the left editor — each row represents one record and columns are separated by your chosen delimiter.",
  "Ensure <strong>First row is header</strong> is checked if your CSV includes column names; these become the keys in the output JSON objects.",
  "Choose the correct <strong>delimiter</strong> (comma, semicolon, tab, or pipe) that matches how your CSV file separates fields.",
  "The <strong>JSON array output</strong> updates instantly as you type — each CSV row becomes one JSON object in the array.",
  "Use the <strong>copy</strong> button to copy the JSON to your clipboard or download it for use in your project.",
];

const faqs = [
  {
    question: "Does it handle quoted fields with commas?",
    answer:
      "Yes. <strong>RFC 4180 quoted fields</strong> — including embedded commas, double quotes, and newlines inside quotes — are parsed correctly. The quotes are stripped and the content is preserved as-is.",
  },
  {
    question: "Are data types auto-detected?",
    answer:
      "Yes — <strong>numbers</strong>, <strong>booleans</strong> (true/false), and <strong>empty fields</strong> (null) are coerced automatically. If you need all values as strings, you can disable auto-detection.",
  },
  {
    question: "What if my CSV has no header row?",
    answer:
      "Uncheck <strong>First row is header</strong> and each row will be output as a <strong>JSON array</strong> rather than an object. This is useful for simple tabular data without column names.",
  },
  {
    question: "Is data sent to a server?",
    answer:
      "No. All parsing happens <strong>locally in your browser</strong>. Your CSV data never leaves your device.",
  },
  {
    question: "What is the difference between CSV and JSON?",
    answer:
      "<strong>CSV (Comma-Separated Values)</strong> is a flat, row-based format ideal for spreadsheets and tabular data. <strong>JSON</strong> supports nested structures, arrays, and mixed types, making it better suited for APIs and configuration files. Converting between them lets you bridge spreadsheet workflows with web services.",
  },
  {
    question: "Can I convert large CSV files?",
    answer:
      "Yes, but very large files (tens of thousands of rows) may take a moment to process since everything runs in the browser. For extremely large datasets, consider processing them server-side.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is CSV?",
    content: `<p><strong>CSV (Comma-Separated Values)</strong> is a plain-text format for storing tabular data. Each line represents a row, and values within a row are separated by a delimiter — most commonly a comma, but also semicolons, tabs, or pipes. The first row often contains column headers.</p>
<p>CSV is widely used for exporting data from spreadsheet tools and databases, and for bulk data exchange between systems. Its simplicity makes it easy to open in any text editor, but it has limitations: it cannot represent nested structures, and there is no standard way to encode data types.</p>`,
  },
  {
    title: "Why Convert CSV to JSON?",
    content: `<p>Most modern APIs and web applications expect data in <strong>JSON format</strong>. Converting CSV to JSON lets you:</p>
<ul>
<li>Import spreadsheet data into web applications and APIs</li>
<li>Prepare data for storage in document databases</li>
<li>Transform exported reports into structured data for further processing</li>
<li>Bridge legacy data systems with modern tooling</li>
</ul>
<p>JSON's support for <strong>nested objects and arrays</strong> also gives you more flexibility than CSV when the data has relationships between fields.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>CSV to JSON conversion is used across many workflows:</p>
<ul>
<li><strong>Data import:</strong> Load exported spreadsheet data into a web app or database</li>
<li><strong>API testing:</strong> Convert sample data into JSON request payloads</li>
<li><strong>Configuration:</strong> Turn tabular settings into structured config objects</li>
<li><strong>Analytics pipelines:</strong> Feed CSV exports from reporting tools into JSON-based processing scripts</li>
</ul>`,
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
