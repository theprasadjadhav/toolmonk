import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { SyntaxDiff } from "@/components/tools/comparators/SyntaxDiff";
import { notFound } from "next/navigation";

const tool = TOOLS.find((t) => t.path === "/comparators/html-diff")!;

export const metadata = generateToolMetadata("", "/comparators/html-diff");

const howToSteps = [
  "Paste the <strong>original HTML</strong> into the left panel.",
  "Paste the <strong>modified HTML</strong> into the right panel.",
  "Changes in tags, attributes, and text content are highlighted instantly.",
  "Use <strong>swap</strong> to reverse panels or <strong>clear</strong> to reset.",
];

const faqs = [
  {
    question: "Does the HTML diff validate markup?",
    answer: "No. The tool compares HTML as text with syntax highlighting — it does not parse or validate the HTML structure. Use a dedicated HTML validator if you need well-formedness checks.",
  },
  {
    question: "Is my HTML sent to a server?",
    answer: "No. Comparison runs entirely in your browser using Monaco Editor.",
  },
  {
    question: "Can I compare HTML templates?",
    answer: "Yes. Paste two versions of an HTML template — including templating syntax like Jinja, Handlebars, or EJS — and see exactly what changed.",
  },
];

export default function HtmlDiffPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs}>
      <SyntaxDiff language="html" uploadAccept=".html,.htm" placeholder="paste HTML into both panels to compare" />
    </ToolContainer>
  );
}
