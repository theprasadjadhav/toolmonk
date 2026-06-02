import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { JsonToYaml } from "@/components/tools/shared/data-formats/JsonToYaml";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("json-to-yaml");
const tool = TOOLS.find((t) => t.slug === "json-to-yaml" && t.category === "dev-tools")!;

const howToSteps = [
  "Paste or type <strong>valid JSON</strong> into the left editor — objects, arrays, nested structures, and all primitive types are supported.",
  "The <strong>YAML output</strong> is generated instantly in the right panel as you type, using clean 2-space indentation.",
  "Click <strong>sample</strong> to load a realistic configuration example if you want to see the conversion in action before pasting your own data.",
  "Copy the <strong>YAML output</strong> using the copy button to paste it directly into your configuration file.",
];

const faqs = [
  {
    question: "What YAML version is produced?",
    answer:
      "The output is <strong>YAML 1.2 compatible</strong> with 2-space indentation. This format is broadly supported across tools, platforms, and configuration systems.",
  },
  {
    question: "Are all JSON types supported?",
    answer:
      "Yes — <strong>objects, arrays, strings, numbers, booleans, and null</strong> all convert correctly. JSON strings become YAML scalars, arrays become YAML sequences, and objects become YAML mappings.",
  },
  {
    question: "Can I use this for configuration files?",
    answer:
      "Yes. The output is <strong>standard YAML</strong> suitable for any configuration file format, including those used by container orchestration platforms, CI/CD systems, and infrastructure-as-code tools.",
  },
  {
    question: "Is data sent to a server?",
    answer:
      "No. All conversion happens <strong>in your browser</strong>. Your data never leaves your device.",
  },
  {
    question: "What is the main difference between JSON and YAML?",
    answer:
      "<strong>YAML</strong> uses indentation and human-friendly syntax (no braces or quotes for simple values), making it more readable for configuration files. <strong>JSON</strong> uses explicit braces, brackets, and quotes, making it more predictable for programmatic processing. Both represent the same data structures.",
  },
  {
    question: "Does YAML support features that JSON does not?",
    answer:
      "Yes. YAML supports <strong>comments</strong> (lines starting with #), <strong>anchors and aliases</strong> for reusing values, and <strong>multi-line strings</strong>. None of these have direct JSON equivalents, so they are not present in output converted from JSON.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is YAML?",
    content: `<p><strong>YAML (YAML Ain't Markup Language)</strong> is a human-readable data serialization format designed for configuration files and data exchange. Unlike JSON, YAML uses <strong>indentation</strong> to represent structure rather than braces and brackets, resulting in cleaner, more readable documents.</p>
<p>YAML supports all the same data types as JSON — objects, arrays, strings, numbers, booleans, and null — plus additional features like comments, multi-line strings, and anchors for reusing values.</p>`,
  },
  {
    title: "JSON vs YAML",
    content: `<p>Both JSON and YAML represent the same data structures, but they serve different purposes:</p>
<ul>
<li><strong>JSON</strong> is better for machine-to-machine communication: strict syntax, no ambiguity, universally supported by APIs</li>
<li><strong>YAML</strong> is better for human-written configuration: readable syntax, supports comments, less visual noise</li>
<li>YAML is a <strong>superset of JSON</strong> — all valid JSON is also valid YAML</li>
<li>YAML's indentation-based syntax can introduce errors if spacing is inconsistent, while JSON's explicit delimiters make structure unambiguous</li>
</ul>`,
  },
];

export default function JsonToYamlPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <JsonToYaml />
    </ToolContainer>
  );
}
