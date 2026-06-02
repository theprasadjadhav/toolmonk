import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { SyntaxDiff } from "@/components/tools/comparators/SyntaxDiff";
import { notFound } from "next/navigation";

const tool = TOOLS.find((t) => t.path === "/comparators/java-diff")!;

export const metadata = generateToolMetadata("", "/comparators/java-diff");

const howToSteps = [
  "Paste the <strong>original Java source</strong> into the left panel.",
  "Paste the <strong>modified Java source</strong> into the right panel.",
  "Changes in classes, methods, and annotations are highlighted with Java syntax highlighting.",
  "Use <strong>swap</strong> to reverse panels or <strong>clear</strong> to reset.",
];

const faqs = [
  {
    question: "Does it compile or validate Java?",
    answer: "No — the tool compares Java source as text with syntax highlighting. It does not compile or analyse the code.",
  },
  {
    question: "Can I compare Spring Boot or Android code?",
    answer: "Yes. Any Java source file can be compared — framework-specific annotations and syntax are supported through Monaco's Java language mode.",
  },
  {
    question: "Is my code sent to a server?",
    answer: "No. Comparison runs entirely in your browser using Monaco Editor.",
  },
];

export default function JavaDiffPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs}>
      <SyntaxDiff language="java" uploadAccept=".java" placeholder="paste Java into both panels to compare" />
    </ToolContainer>
  );
}
