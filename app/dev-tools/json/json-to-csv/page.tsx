import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { JsonToCsv } from "@/components/tools/shared/data-formats/JsonToCsv";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("json-to-csv");
const tool = TOOLS.find((t) => t.slug === "json-to-csv" && t.category === "dev-tools")!;

const howToSteps = [
  "Paste a <strong>JSON array of objects</strong> into the left editor — each object in the array becomes one row in the CSV output.",
  "<strong>Keys from the first object</strong> are used as the CSV column headers, so ensure your first object contains all the fields you want as columns.",
  "Toggle <strong>Flatten nested</strong> to expand nested objects into <strong>dot-notation columns</strong> (e.g., <code>address.city</code>) instead of being omitted.",
  "Use the <strong>download button</strong> to save the CSV file directly to your computer.",
  "Use the <strong>copy button</strong> to copy the CSV text to your clipboard for immediate use.",
];

const faqs = [
  {
    question: "What JSON structure is expected?",
    answer:
      "An <strong>array of objects</strong> is expected, e.g. <code>[{\"name\":\"Alice\"},{\"name\":\"Bob\"}]</code>. Single objects are also accepted and will produce a one-row CSV. Arrays of primitives (strings, numbers) are not supported.",
  },
  {
    question: "How are nested objects handled?",
    answer:
      "With <strong>Flatten nested</strong> enabled, a nested object like <code>{ address: { city: 'London' } }</code> becomes an <code>address.city</code> column in the output. Without flattening, nested objects are serialized as a JSON string in a single cell.",
  },
  {
    question: "How are values with commas or quotes handled?",
    answer:
      "They are automatically <strong>quoted</strong> and internal double-quotes are escaped per <strong>RFC 4180</strong>. This ensures the CSV remains valid and can be opened correctly in spreadsheet tools.",
  },
  {
    question: "Is data sent to a server?",
    answer:
      "No. All conversion happens <strong>in your browser</strong>. Your data never leaves your device.",
  },
  {
    question: "What if different objects have different keys?",
    answer:
      "The column headers are derived from the <strong>union of all keys</strong> across all objects. Objects that are missing a particular key will have an empty cell in the corresponding column.",
  },
  {
    question: "Can I open the downloaded CSV in a spreadsheet tool?",
    answer:
      "Yes. The output uses <strong>standard comma-separated format with UTF-8 encoding</strong>, which is compatible with spreadsheet applications. If your data contains non-ASCII characters, make sure to select UTF-8 encoding when opening the file.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is CSV?",
    content: `<p><strong>CSV (Comma-Separated Values)</strong> is a plain-text format for storing tabular data. Each line is a row, and values are separated by a delimiter — most commonly a comma. The first row typically contains column headers.</p>
<p>CSV is the universal format for data exchange with spreadsheet tools and data analysis software. It is simple, compact, and supported by virtually every data tool available.</p>`,
  },
  {
    title: "Why Convert JSON to CSV?",
    content: `<p>JSON is the standard format for APIs and web applications, but when you need to analyze or share data, <strong>CSV is often more practical</strong>:</p>
<ul>
<li><strong>Spreadsheet analysis:</strong> Open data in a spreadsheet tool for sorting, filtering, and charting</li>
<li><strong>Data exports:</strong> Generate downloadable reports from API data</li>
<li><strong>Database imports:</strong> Many databases accept bulk data imports via CSV</li>
<li><strong>Sharing with non-technical users:</strong> CSV is easier to work with than JSON for business users</li>
</ul>`,
  },
];

export default function JsonToCsvPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <JsonToCsv />
    </ToolContainer>
  );
}
