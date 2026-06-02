import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { SyntaxDiff } from "@/components/tools/comparators/SyntaxDiff";
import { notFound } from "next/navigation";

const tool = TOOLS.find((t) => t.path === "/comparators/markdown-diff")!;

export const metadata = generateToolMetadata("", "/comparators/markdown-diff");

const howToSteps = [
  "Paste the <strong>original Markdown</strong> into the left panel.",
  "Paste the <strong>modified Markdown</strong> into the right panel.",
  "Changes in headings, links, lists, and formatting are highlighted instantly.",
  "Use <strong>swap</strong> to reverse panels or <strong>clear</strong> to reset.",
];

const faqs = [
  {
    question: "Can I compare README files?",
    answer: "Yes. Paste the content of any .md file. The diff is purely text-based with Markdown syntax highlighting.",
  },
  {
    question: "Does it render the Markdown?",
    answer: "No — the tool compares Markdown source. For rendered preview, use the Markdown Preview tool.",
  },
  {
    question: "Is my content sent to a server?",
    answer: "No. Comparison runs entirely in your browser.",
  },
];

export default function MarkdownDiffPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs}>
      <SyntaxDiff language="markdown" uploadAccept=".md,.markdown" placeholder="paste Markdown into both panels to compare" />
    </ToolContainer>
  );
}
