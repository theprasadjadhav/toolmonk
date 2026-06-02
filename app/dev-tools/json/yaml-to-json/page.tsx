import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { YamlToJson } from "@/components/tools/shared/data-formats/YamlToJson";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("yaml-to-json");
const tool = TOOLS.find((t) => t.slug === "yaml-to-json" && t.category === "dev-tools")!;

const howToSteps = [
  "Paste or type <strong>valid YAML</strong> into the left editor — mappings, sequences, multi-line strings, and anchors are all supported.",
  "The <strong>JSON output</strong> is generated instantly in the right panel, with the data structure preserved exactly as defined in the YAML.",
  "Adjust the <strong>indent size</strong> (2 or 4 spaces) to match the formatting style required by your project.",
  "Copy the <strong>JSON output</strong> using the copy button to use it in your API, configuration, or data pipeline.",
];

const faqs = [
  {
    question: "What YAML features are supported?",
    answer:
      "Full <strong>YAML 1.2</strong> is supported, including anchors and aliases (for reusing values), multi-line strings (literal and folded block scalars), complex nested types, and all standard data types.",
  },
  {
    question: "Can I convert configuration files?",
    answer:
      "Yes. Configuration files from container orchestration tools, CI/CD pipelines, and infrastructure-as-code platforms are all valid YAML and can be converted, <strong>as long as they do not use custom non-standard YAML tags</strong>.",
  },
  {
    question: "Are YAML types coerced to JSON types?",
    answer:
      "Yes — YAML <strong>true/false</strong> become JSON booleans, numeric values become JSON numbers, and YAML null values map to JSON <code>null</code>. Strings are preserved as-is.",
  },
  {
    question: "Is data sent to a server?",
    answer:
      "No. All conversion happens <strong>in your browser</strong>. Your data never leaves your device.",
  },
  {
    question: "What happens to YAML comments?",
    answer:
      "YAML <strong>comments</strong> (lines starting with <code>#</code>) are stripped during conversion because JSON has no equivalent. All data values and structure are preserved, but comments are not included in the output.",
  },
  {
    question: "What is the difference between YAML and JSON?",
    answer:
      "<strong>YAML</strong> is designed for human-written configuration — it uses indentation for structure, supports comments, and has a more flexible syntax. <strong>JSON</strong> is designed for machine-to-machine data exchange — it uses explicit delimiters, has strict syntax, and is universally supported by APIs and data tools.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is YAML?",
    content: `<p><strong>YAML (YAML Ain't Markup Language)</strong> is a human-readable data serialization format commonly used for configuration files. It represents data using <strong>indentation-based structure</strong> rather than brackets and braces, making it more readable than JSON or XML for hand-written files.</p>
<p>YAML supports all the same data types as JSON, plus additional features like <strong>comments</strong>, <strong>anchors and aliases</strong> for reusing values, and <strong>multi-line strings</strong>. It is widely used in DevOps, infrastructure tools, and application configuration.</p>`,
  },
  {
    title: "Why Convert YAML to JSON?",
    content: `<p>YAML is great for writing configuration, but many systems and APIs require data in <strong>JSON format</strong>. Converting YAML to JSON lets you:</p>
<ul>
<li><strong>Integrate with APIs:</strong> Most REST APIs accept JSON, not YAML</li>
<li><strong>Validate structure:</strong> JSON validators and schema tools are more widely available</li>
<li><strong>Debug configuration:</strong> View your YAML as formatted JSON to spot unexpected values</li>
<li><strong>Process programmatically:</strong> JSON is easier to manipulate with data processing tools</li>
</ul>`,
  },
];

export default function YamlToJsonPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <YamlToJson />
    </ToolContainer>
  );
}
