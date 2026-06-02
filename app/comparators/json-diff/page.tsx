import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { JsonDiff } from "@/components/tools/json/JsonDiff";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

const tool = TOOLS.find((t) => t.path === "/comparators/json-diff")!;

export const metadata = generateToolMetadata("", "/comparators/json-diff");

const howToSteps = [
  "Paste your <strong>original JSON</strong> into the left panel (JSON A) — this is the baseline.",
  "Paste the <strong>modified JSON</strong> into the right panel (JSON B) — this is the updated version.",
  "If either input contains a syntax error, the status bar shows the exact error message.",
  "Use <strong>format</strong> to normalize both inputs with consistent indentation before diffing.",
  "Added lines appear in <strong>green</strong>, removed lines in <strong>red</strong>.",
];

const faqs = [
  {
    question: "Does it understand JSON structure or just compare text?",
    answer: "Both inputs are parsed and re-formatted before comparing. This means key ordering differences in objects won't create false positives — only genuine data changes are highlighted.",
  },
  {
    question: "What happens if one input is invalid JSON?",
    answer: "The status bar shows the exact parse error for that panel. The diff will not run until both inputs are valid JSON.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All parsing and comparison happens entirely in your browser. Your JSON never leaves your device.",
  },
  {
    question: "Can I compare API responses?",
    answer: "Yes. Paste the JSON from two API calls — before and after a code change — to instantly spot what changed in the returned data.",
  },
  {
    question: "What does a line that is both red and green mean?",
    answer: "When a value at a key changes, the old value appears in red (removed) and the new value in green (added) at the same position. This makes it easy to see what was modified.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Why Compare JSON?",
    content: `<p>Comparing JSON documents is essential in many real-world workflows:</p>
<ul>
<li><strong>API debugging:</strong> Spot regressions between two API responses</li>
<li><strong>Config auditing:</strong> Review changes between two versions of a config file</li>
<li><strong>Data migration:</strong> Verify that transformed data matches the expected structure</li>
</ul>`,
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
