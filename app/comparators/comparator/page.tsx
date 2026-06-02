import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { MasterComparator } from "@/components/tools/comparators/MasterComparator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

const tool = TOOLS.find((t) => t.path === "/comparators/comparator")!;

export const metadata = generateToolMetadata("", "/comparators/comparator");

const howToSteps = [
  "Select your <strong>language</strong> from the dropdown in the toolbar — this sets Monaco's syntax highlighting for both panels.",
  "Paste the <strong>original version</strong> of your code or text into the left panel (A).",
  "Paste the <strong>modified version</strong> into the right panel (B).",
  "Added lines are highlighted in <strong>green</strong>, removed lines in <strong>red</strong> — differences are visible instantly.",
  "Use <strong>swap</strong> to reverse A and B, or <strong>clear</strong> to reset both panels.",
];

const faqs = [
  {
    question: "What languages does the comparator support?",
    answer: "The comparator supports 20+ languages including JSON, YAML, XML, HTML, CSS, JavaScript, TypeScript, Python, Java, C, C++, Go, Rust, SQL, Markdown, Bash, PHP, Ruby, Kotlin, Swift, and Dockerfile. Language selection controls Monaco's syntax highlighting and diff rendering.",
  },
  {
    question: "Does it validate the code I paste?",
    answer: "The master comparator does not validate content — it compares any text using the selected language for syntax highlighting. If you need validation (parse errors flagged before diffing), use the dedicated JSON Diff, YAML Diff, or XML Diff tools.",
  },
  {
    question: "Is my code sent to a server?",
    answer: "No. All comparison happens entirely in your browser using the Monaco editor. Nothing you paste is sent to any server.",
  },
  {
    question: "Can I upload files to compare?",
    answer: "Yes. Each panel has an upload button that lets you load a local file directly into the editor.",
  },
  {
    question: "What does the diff count mean?",
    answer: "The status bar shows how many lines differ between the two panels. A line is counted once regardless of how many characters changed within it.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Why use a code comparator?",
    content: `<p>A side-by-side diff view is the fastest way to understand what changed between two versions of a file. Instead of reading both documents and trying to spot differences manually, a diff tool highlights every change instantly — additions in green, removals in red.</p>
<p>Common use cases include:</p>
<ul>
<li><strong>Code review:</strong> Understand what changed between two versions of a function or class</li>
<li><strong>Config auditing:</strong> Compare two configuration files before deploying</li>
<li><strong>Documentation:</strong> Review changes between two drafts of a document</li>
<li><strong>Debugging:</strong> Compare the output of two runs to find regressions</li>
</ul>`,
  },
];

export default function MasterComparatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <MasterComparator />
    </ToolContainer>
  );
}
