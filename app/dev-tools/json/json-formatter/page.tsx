import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { JsonFormatter } from "@/components/tools/json/JsonFormatter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("json-formatter");

const tool = TOOLS.find((t) => t.slug === "json-formatter")!;

const howToSteps = [
  "Paste or type your <strong>JSON</strong> into the input panel on the left — it can be minified, partially indented, or already formatted.",
  "The formatter <strong>validates and prettifies</strong> your JSON automatically as you type, applying consistent indentation and line breaks.",
  "Choose between <strong>2-space or 4-space indentation</strong> using the toolbar buttons to match your project's style guide.",
  "Use <strong>minify</strong> to collapse the JSON back into a single compact line when you need the smallest possible output.",
  "Click <strong>copy</strong> to copy the formatted output to your clipboard, ready to paste into your code or editor.",
];

const faqs = [
  {
    question: "What is a JSON Formatter?",
    answer:
      "A <strong>JSON Formatter</strong> (also called JSON Beautifier or JSON Prettifier) takes minified or unformatted JSON and outputs it with proper indentation and line breaks, making it easier to read and debug. It also validates the JSON and reports any syntax errors.",
  },
  {
    question: "Does this validate JSON too?",
    answer:
      "Yes. The formatter <strong>validates your JSON as you type</strong>. If there is a syntax error — such as a missing bracket, trailing comma, or unquoted key — it shows the exact error message so you can fix it immediately.",
  },
  {
    question: "Is my JSON data sent to a server?",
    answer:
      "No. All formatting happens <strong>entirely in your browser</strong>. Your data never leaves your device.",
  },
  {
    question: "What is the difference between format and minify?",
    answer:
      "<strong>Formatting</strong> adds indentation and line breaks to make JSON human-readable. <strong>Minifying</strong> removes all whitespace to produce the smallest possible string, ideal for APIs and data transfer.",
  },
  {
    question: "Why does my JSON sometimes look different after formatting?",
    answer:
      "The formatter <strong>parses and re-serializes</strong> your JSON, which normalizes key order within objects and removes any redundant whitespace. The data content is unchanged — only the presentation is standardized.",
  },
  {
    question: "What is trailing comma and why does it cause an error?",
    answer:
      "A <strong>trailing comma</strong> is a comma after the last item in an object or array, such as <code>[1, 2, 3,]</code>. The JSON standard does not allow trailing commas, so they cause a syntax error. The formatter will highlight this and other similar mistakes.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is JSON?",
    content: `<p><strong>JSON (JavaScript Object Notation)</strong> is a lightweight, human-readable data interchange format. It represents structured data as key-value pairs (objects) and ordered lists (arrays). JSON is the standard format for web APIs, configuration files, and data storage in many modern systems.</p>
<p>A well-formed JSON document follows strict syntax rules: strings must be double-quoted, keys must be strings, and trailing commas are not allowed. Formatting tools help you quickly spot and fix these issues.</p>`,
  },
  {
    title: "Why Format JSON?",
    content: `<p>Raw or minified JSON is often a single long line with no whitespace — nearly impossible to read by eye. Formatting adds <strong>consistent indentation and line breaks</strong> so you can clearly see the structure, spot missing fields, and debug data issues.</p>
<ul>
<li><strong>Debugging:</strong> Formatted JSON makes it easy to scan nested structures and find incorrect values</li>
<li><strong>Code review:</strong> Readable JSON in diffs is much easier to review than minified blobs</li>
<li><strong>Documentation:</strong> Pretty-printed JSON is standard in API documentation examples</li>
<li><strong>Validation:</strong> The formatter immediately surfaces syntax errors so you can fix them before they cause problems</li>
</ul>`,
  },
  {
    title: "JSON Best Practices",
    content: `<p>Following consistent JSON conventions makes your data easier to work with:</p>
<ul>
<li>Use <strong>camelCase</strong> for key names (e.g. <code>firstName</code>, not <code>first_name</code>) in web APIs</li>
<li>Always use <strong>double quotes</strong> for strings — single quotes are not valid JSON</li>
<li>Avoid <strong>trailing commas</strong> — they are not part of the JSON standard</li>
<li>Use <strong>null</strong> for missing values rather than empty strings or omitting the key entirely</li>
<li>Keep nesting shallow where possible — deeply nested JSON is harder to read and process</li>
</ul>`,
  },
];

export default function JsonFormatterPage() {
  if (!tool) notFound();

  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <JsonFormatter />
    </ToolContainer>
  );
}
