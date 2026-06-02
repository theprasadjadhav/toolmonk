import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { SyntaxDiff } from "@/components/tools/comparators/SyntaxDiff";
import { notFound } from "next/navigation";

const tool = TOOLS.find((t) => t.path === "/comparators/ts-diff")!;

export const metadata = generateToolMetadata("", "/comparators/ts-diff");

const howToSteps = [
  "Paste the <strong>original TypeScript</strong> into the left panel.",
  "Paste the <strong>modified TypeScript</strong> into the right panel.",
  "Changes in types, interfaces, and logic are highlighted with full TypeScript syntax highlighting.",
  "Use <strong>swap</strong> to reverse panels or <strong>clear</strong> to reset.",
];

const faqs = [
  {
    question: "Does it type-check or validate TypeScript?",
    answer: "No — the tool compares TypeScript source as text with syntax highlighting. It does not run the TypeScript compiler.",
  },
  {
    question: "Can I compare .tsx files?",
    answer: "Yes. Paste the content of .tsx files — JSX syntax is supported by the TypeScript language mode in Monaco.",
  },
  {
    question: "Is my code sent to a server?",
    answer: "No. Comparison runs entirely in your browser.",
  },
];

export default function TsDiffPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs}>
      <SyntaxDiff language="typescript" uploadAccept=".ts,.tsx" placeholder="paste TypeScript into both panels to compare" />
    </ToolContainer>
  );
}
