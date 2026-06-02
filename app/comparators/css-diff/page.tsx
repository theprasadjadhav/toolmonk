import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { SyntaxDiff } from "@/components/tools/comparators/SyntaxDiff";
import { notFound } from "next/navigation";

const tool = TOOLS.find((t) => t.path === "/comparators/css-diff")!;

export const metadata = generateToolMetadata("", "/comparators/css-diff");

const howToSteps = [
  "Paste the <strong>original CSS</strong> into the left panel.",
  "Paste the <strong>modified CSS</strong> into the right panel.",
  "Changes in selectors, properties, and values are highlighted instantly.",
  "Use <strong>swap</strong> to reverse panels or <strong>clear</strong> to reset.",
];

const faqs = [
  {
    question: "Can I compare SCSS or Less?",
    answer: "You can paste SCSS or Less content and compare it as text — syntax highlighting is optimised for standard CSS, but the diff engine works on any text.",
  },
  {
    question: "Is my CSS sent to a server?",
    answer: "No. Comparison runs entirely in your browser using Monaco Editor.",
  },
  {
    question: "Can I upload CSS files?",
    answer: "Yes. Each panel has an upload button that loads a local .css file directly into the editor.",
  },
];

export default function CssDiffPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs}>
      <SyntaxDiff language="css" uploadAccept=".css" placeholder="paste CSS into both panels to compare" />
    </ToolContainer>
  );
}
