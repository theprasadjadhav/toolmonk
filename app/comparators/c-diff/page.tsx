import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { SyntaxDiff } from "@/components/tools/comparators/SyntaxDiff";
import { notFound } from "next/navigation";

const tool = TOOLS.find((t) => t.path === "/comparators/c-diff")!;

export const metadata = generateToolMetadata("", "/comparators/c-diff");

const howToSteps = [
  "Paste the <strong>original C source</strong> into the left panel.",
  "Paste the <strong>modified C source</strong> into the right panel.",
  "Changes in functions, structs, and macros are highlighted with C syntax highlighting.",
  "Use <strong>swap</strong> to reverse panels or <strong>clear</strong> to reset.",
];

const faqs = [
  {
    question: "Does it compile or analyse C code?",
    answer: "No — the tool compares C source as text with syntax highlighting only. It does not run a compiler or static analyser.",
  },
  {
    question: "Can I compare header files (.h)?",
    answer: "Yes. Paste the contents of any .h or .c file and compare them.",
  },
  {
    question: "Is my code sent to a server?",
    answer: "No. Comparison runs entirely in your browser.",
  },
];

export default function CDiffPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs}>
      <SyntaxDiff language="c" uploadAccept=".c,.h" placeholder="paste C into both panels to compare" />
    </ToolContainer>
  );
}
