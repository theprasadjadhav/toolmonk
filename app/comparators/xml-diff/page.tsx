import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { XmlComparator } from "@/components/tools/comparators/XmlComparator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

const tool = TOOLS.find((t) => t.path === "/comparators/xml-diff")!;

export const metadata = generateToolMetadata("", "/comparators/xml-diff");

const howToSteps = [
  "Paste your <strong>original XML</strong> into the left panel (XML A).",
  "Paste the <strong>modified XML</strong> into the right panel (XML B).",
  "If either input contains malformed XML, the status bar shows the parser error.",
  "Added lines appear in <strong>green</strong>, removed lines in <strong>red</strong>.",
  "Use <strong>swap</strong> to reverse A and B, or <strong>clear</strong> to reset both panels.",
];

const faqs = [
  {
    question: "How is XML validated?",
    answer: "The browser's built-in DOMParser validates each input. If the XML is not well-formed — missing closing tags, invalid characters, mismatched elements — the parser returns an error that is shown in the status bar.",
  },
  {
    question: "What happens if one input is malformed XML?",
    answer: "The status bar shows the exact parser error for that panel. The diff still runs but the error is prominently displayed.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. Validation uses the browser's native DOMParser and comparison uses Monaco Editor — everything runs locally in your browser.",
  },
  {
    question: "Can I compare XML with different formatting?",
    answer: "Yes. The diff is purely text-based, so reformatted XML will show whitespace differences. For a structure-only comparison, normalize both inputs to the same format first.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "When to Use XML Diff",
    content: `<p>XML is used for configuration files, data exchange formats (SOAP, RSS, OPML), and document markup (SVG, XHTML). Comparing two XML documents helps you spot changes in element structure, attribute values, and text content.</p>
<p>The tool validates both inputs using the browser's native XML parser before showing the diff, so you can be confident the comparison reflects real structural differences rather than parsing ambiguities.</p>`,
  },
];

export default function XmlDiffPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <XmlComparator />
    </ToolContainer>
  );
}
