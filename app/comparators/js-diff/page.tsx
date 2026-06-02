import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { SyntaxDiff } from "@/components/tools/comparators/SyntaxDiff";
import { notFound } from "next/navigation";

const tool = TOOLS.find((t) => t.path === "/comparators/js-diff")!;

export const metadata = generateToolMetadata("", "/comparators/js-diff");

const howToSteps = [
  "Paste the <strong>original JavaScript</strong> into the left panel.",
  "Paste the <strong>modified JavaScript</strong> into the right panel.",
  "Changes in functions, variables, and logic are highlighted with full JS syntax highlighting.",
  "Use <strong>swap</strong> to reverse panels or <strong>clear</strong> to reset.",
];

const faqs = [
  {
    question: "Does it validate JavaScript syntax?",
    answer: "No — the tool compares JavaScript as text with syntax highlighting. It does not execute or lint the code.",
  },
  {
    question: "Can I compare minified JavaScript?",
    answer: "Yes. The diff works on any text. For a more readable comparison, format both inputs with consistent indentation first.",
  },
  {
    question: "Is my code sent to a server?",
    answer: "No. Comparison runs entirely in your browser using Monaco Editor — the same engine that powers VS Code.",
  },
];

export default function JsDiffPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs}>
      <SyntaxDiff language="javascript" uploadAccept=".js,.mjs,.cjs" placeholder="paste JavaScript into both panels to compare" />
    </ToolContainer>
  );
}
