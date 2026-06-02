import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { SyntaxDiff } from "@/components/tools/comparators/SyntaxDiff";
import { notFound } from "next/navigation";

const tool = TOOLS.find((t) => t.path === "/comparators/python-diff")!;

export const metadata = generateToolMetadata("", "/comparators/python-diff");

const howToSteps = [
  "Paste the <strong>original Python script</strong> into the left panel.",
  "Paste the <strong>modified Python script</strong> into the right panel.",
  "Changes in functions, classes, and logic are highlighted with full Python syntax highlighting.",
  "Use <strong>swap</strong> to reverse panels or <strong>clear</strong> to reset.",
];

const faqs = [
  {
    question: "Does it check Python syntax?",
    answer: "No — the tool compares Python source code as text with syntax highlighting. It does not execute or lint the code.",
  },
  {
    question: "Does indentation affect the diff?",
    answer: "Yes. Python is indentation-sensitive, and indentation differences will be flagged as changed lines. This is intentional — indentation changes in Python often have semantic meaning.",
  },
  {
    question: "Is my code sent to a server?",
    answer: "No. Comparison runs entirely in your browser using Monaco Editor.",
  },
];

export default function PythonDiffPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs}>
      <SyntaxDiff language="python" uploadAccept=".py" placeholder="paste Python into both panels to compare" />
    </ToolContainer>
  );
}
