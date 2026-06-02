import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { JsonDiff } from "@/components/tools/json/JsonDiff";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("json-diff");

const tool = TOOLS.find((t) => t.slug === "json-diff")!;

const howToSteps = [
  "Paste your <strong>original JSON</strong> into the left panel (JSON A) — this is the baseline you are comparing from.",
  "Paste the <strong>modified JSON</strong> into the right panel (JSON B) — this is the updated version you want to compare against the original.",
  "The <strong>diff view</strong> below highlights added lines in green and removed lines in red, making changes immediately visible.",
  "Use <strong>swap</strong> to flip A and B if you want to see the diff from the opposite direction.",
  "Lines with <strong>no changes</strong> are shown in a neutral color so you can focus only on what differs.",
];

const faqs = [
  {
    question: "How does the JSON diff work?",
    answer:
      "Both JSON inputs are <strong>formatted with consistent indentation</strong>, then compared line-by-line. This means the comparison is based on normalized structure, so minor formatting differences do not create false positives.",
  },
  {
    question: "Does it understand JSON structure or just text?",
    answer:
      "The diff is <strong>structure-aware</strong>: both inputs are parsed and re-formatted before comparing. This means key ordering differences won't create false positives — only genuine data changes are highlighted.",
  },
  {
    question: "Is my data sent to a server?",
    answer:
      "No. All comparison happens <strong>entirely in your browser</strong>. Your JSON never leaves your device.",
  },
  {
    question: "What does it mean when a line is both red and green?",
    answer:
      "When a value at a specific key changes, the old value appears in <strong>red</strong> (removed) and the new value appears in <strong>green</strong> (added) at the same position. This makes it easy to see exactly what was modified.",
  },
  {
    question: "Can I use this to compare API responses?",
    answer:
      "Yes. Paste the JSON responses from two different API calls — for example, before and after a code change — to quickly spot differences in the returned data structure or values.",
  },
  {
    question: "What happens if one of the inputs is invalid JSON?",
    answer:
      "If either input contains a <strong>syntax error</strong>, the tool will display an error message and the diff will not be generated until both inputs are valid JSON.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is JSON?",
    content: `<p><strong>JSON (JavaScript Object Notation)</strong> is a lightweight, human-readable data format used to represent structured information as key-value pairs, arrays, and nested objects. It is the standard format for data exchange between web services, APIs, and configuration files.</p>
<p>A JSON document is made up of <strong>objects</strong> (curly braces containing key-value pairs) and <strong>arrays</strong> (square brackets containing ordered lists). Values can be strings, numbers, booleans, null, objects, or arrays.</p>`,
  },
  {
    title: "Why Compare JSON?",
    content: `<p>Comparing two JSON documents is essential in many real-world workflows:</p>
<ul>
<li><strong>API debugging:</strong> Spot changes between two API responses to find regressions</li>
<li><strong>Configuration auditing:</strong> Review what changed between two versions of a config file</li>
<li><strong>Data migration:</strong> Verify that transformed data matches the expected structure</li>
<li><strong>Code review:</strong> Understand exactly what data changed when reviewing pull requests</li>
</ul>
<p>A visual diff is far faster than reading two documents side by side and trying to spot differences manually.</p>`,
  },
];

export default function JsonDiffPage() {
  if (!tool) notFound();

  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <JsonDiff />
    </ToolContainer>
  );
}
