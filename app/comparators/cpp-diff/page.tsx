import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { SyntaxDiff } from "@/components/tools/comparators/SyntaxDiff";
import { notFound } from "next/navigation";

const tool = TOOLS.find((t) => t.path === "/comparators/cpp-diff")!;

export const metadata = generateToolMetadata("", "/comparators/cpp-diff");

const howToSteps = [
  "Paste the <strong>original C++ source</strong> into the left panel.",
  "Paste the <strong>modified C++ source</strong> into the right panel.",
  "Changes in classes, templates, and methods are highlighted with C++ syntax highlighting.",
  "Use <strong>swap</strong> to reverse panels or <strong>clear</strong> to reset.",
];

const faqs = [
  {
    question: "Does it compile or analyse C++ code?",
    answer: "No — the tool compares C++ source as text with syntax highlighting only.",
  },
  {
    question: "Can I compare header files (.hpp)?",
    answer: "Yes. Paste the contents of any .cpp or .hpp file and compare them.",
  },
  {
    question: "Is my code sent to a server?",
    answer: "No. Comparison runs entirely in your browser.",
  },
];

export default function CppDiffPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs}>
      <SyntaxDiff language="cpp" uploadAccept=".cpp,.cc,.cxx,.hpp,.h" placeholder="paste C++ into both panels to compare" />
    </ToolContainer>
  );
}
