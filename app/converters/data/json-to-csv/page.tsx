import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { JsonToCsv } from "@/components/tools/converters/JsonToCsv";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("json-to-csv");

const tool = TOOLS.find((t) => t.slug === "json-to-csv" && t.category === "converters")!;

const howToSteps = [
  "Paste a <strong>JSON array of objects</strong> into the left editor — the keys from the first object will automatically become the <strong>CSV column headers</strong>.",
  "Toggle <strong>'Flatten nested'</strong> to expand nested objects into dot-notation columns (e.g. <code>address.city</code>), making them compatible with spreadsheet tools.",
  "Use the <strong>Download</strong> button to save the CSV file directly to your device, or click <strong>Copy</strong> to copy the output to your clipboard.",
];

const faqs = [
  {
    question: "What JSON structure is expected?",
    answer:
      "The tool expects a <strong>JSON array of objects</strong>, for example <code>[{\"name\":\"Alice\",\"age\":30},{\"name\":\"Bob\",\"age\":25}]</code>. A single object (not wrapped in an array) is also accepted and will produce a one-row CSV.",
  },
  {
    question: "How are nested objects handled?",
    answer:
      "With <strong>'Flatten nested'</strong> enabled, a nested object like <code>{ \"address\": { \"city\": \"London\" } }</code> becomes a column named <code>address.city</code>. Without flattening, the nested object is serialized as a JSON string inside the cell.",
  },
  {
    question: "How are values with commas or quotes handled?",
    answer:
      "Values containing commas, double-quotes, or newlines are <strong>automatically quoted</strong> and internal double-quotes are escaped by doubling them, in full compliance with <strong>RFC 4180</strong>.",
  },
  {
    question: "Is data sent to a server?",
    answer:
      "No. All conversion happens <strong>entirely in your browser</strong>. Your data never leaves your device.",
  },
  {
    question: "What happens if objects have different keys?",
    answer:
      "The <strong>union of all keys</strong> across all objects is used as the header row. Objects missing a particular key will have an empty cell in that column.",
  },
  {
    question: "Can I change the delimiter?",
    answer:
      "The default output uses <strong>commas</strong> as the delimiter (standard CSV). If your spreadsheet application requires a different separator, you can manually replace commas after downloading, or use a text editor.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is JSON?",
    content: `<p><strong>JSON (JavaScript Object Notation)</strong> is a lightweight, text-based data interchange format. It organizes data as <strong>key-value pairs</strong> (objects) or <strong>ordered lists</strong> (arrays), and supports strings, numbers, booleans, null, and nesting. JSON is the standard format for web APIs and application configuration.</p><p>Because JSON supports nested structures and mixed data types, it is more expressive than CSV — but that flexibility also makes JSON harder to view in a spreadsheet. Converting JSON to CSV flattens the data into a tabular form that any spreadsheet application can open.</p>`,
  },
  {
    title: "What is CSV?",
    content: `<p><strong>CSV (Comma-Separated Values)</strong> is a plain-text format that stores tabular data — rows and columns — using a delimiter (usually a comma) to separate fields. It is one of the most universally supported file formats: spreadsheet applications, databases, reporting tools, and data pipelines all read CSV natively.</p><p>CSV is ideal when you need to share structured data with non-technical users, import into a spreadsheet, or feed data into a reporting tool that does not accept JSON.</p>`,
  },
  {
    title: "Common Use Cases for JSON to CSV Conversion",
    content: `<p>Converting JSON to CSV is common in many data workflows:</p><ul><li><strong>Reporting and analytics</strong> — export API response data into a spreadsheet for pivot tables or charts</li><li><strong>Database exports</strong> — convert JSON query results into a CSV file for import into another system</li><li><strong>Sharing data</strong> — CSV is easier for non-developers to open and read than raw JSON</li><li><strong>Data cleaning</strong> — review and edit records in a spreadsheet before re-importing</li></ul>`,
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
