import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { JsonMinifier } from "@/components/tools/json/JsonMinifier";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("json-minifier");

const tool = TOOLS.find((t) => t.slug === "json-minifier")!;

const howToSteps = [
  "Paste your <strong>formatted or prettified JSON</strong> into the input panel — it can have any amount of indentation or whitespace.",
  "The <strong>minified output</strong> appears instantly in the right panel, with all unnecessary spaces, tabs, and newlines removed.",
  "Check the <strong>size savings</strong> shown in the status bar to see how much smaller the output is compared to the original.",
  "Click <strong>copy output</strong> to copy the minified JSON to your clipboard, ready to use in your API call, config file, or build process.",
];

const faqs = [
  {
    question: "What is JSON minification?",
    answer:
      "<strong>JSON minification</strong> removes all unnecessary whitespace — spaces, tabs, and newlines — from a JSON string. The result is semantically identical to the original but smaller in size, making it faster to transmit and store.",
  },
  {
    question: "How much space does minification save?",
    answer:
      "Savings vary depending on how much whitespace is in the original. <strong>Heavily indented JSON</strong> can shrink by 30–60%. Minification is most impactful for large API responses or configuration files.",
  },
  {
    question: "Is my data processed on the server?",
    answer:
      "No. Everything runs <strong>in your browser</strong>. Your JSON never leaves your device.",
  },
  {
    question: "When should I use minification vs formatting?",
    answer:
      "Use <strong>minification</strong> when you need the smallest possible output for production use — such as embedding JSON in an API response or a build artifact. Use <strong>formatting</strong> when you need to read, debug, or share the JSON with other people.",
  },
  {
    question: "Does minification change the data?",
    answer:
      "No. Minification only removes <strong>whitespace characters</strong> — the actual data, keys, values, and structure are completely unchanged. The minified JSON is fully equivalent to the original.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is JSON Minification?",
    content: `<p><strong>JSON minification</strong> is the process of removing all whitespace characters — spaces, tabs, and line breaks — that are not part of the actual data. The resulting string is compact and takes up less space, but is functionally identical to the formatted version.</p>
<p>Minified JSON is typically used in <strong>production environments</strong> where reducing payload size matters: faster network transfers, lower bandwidth costs, and smaller storage footprints. Human readability is sacrificed for efficiency.</p>`,
  },
  {
    title: "Why Minify JSON?",
    content: `<p>Minifying JSON has measurable benefits in production systems:</p>
<ul>
<li><strong>Faster API responses:</strong> Smaller payloads transfer quicker, especially on mobile networks</li>
<li><strong>Reduced bandwidth:</strong> Lower data transfer costs when serving high volumes of API requests</li>
<li><strong>Smaller build artifacts:</strong> Config files and data embedded in builds take less disk space</li>
<li><strong>Cache efficiency:</strong> Smaller values fit better in caches with size limits</li>
</ul>
<p>For development and debugging, always keep a formatted version. Minify only at the point of deployment or transmission.</p>`,
  },
];

export default function JsonMinifierPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <JsonMinifier />
    </ToolContainer>
  );
}
