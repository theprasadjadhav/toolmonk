import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { XmlDiff } from "@/components/tools/xml/XmlDiff";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("xml-diff");

const tool = TOOLS.find((t) => t.slug === "xml-diff")!;

const howToSteps = [
  "Paste your <strong>original XML</strong> into the left panel (XML A) — this is the baseline document you are comparing from.",
  "Paste the <strong>modified XML</strong> into the right panel (XML B) — this is the updated version you want to compare against the original.",
  "<strong>Lines that differ</strong> are highlighted in red in both panels, so you can immediately see what changed.",
  "Use <strong>format</strong> to normalize indentation in both panels before comparing, so whitespace-only differences are not shown as changes.",
  "Use <strong>swap</strong> to reverse A and B, or <strong>clear</strong> to reset both panels and start fresh.",
];

const faqs = [
  {
    question: "How does the XML diff work?",
    answer:
      "Both XML inputs are compared <strong>line-by-line</strong>. Differing lines are highlighted in red so you can quickly locate changes, additions, and removals between the two documents.",
  },
  {
    question: "Should I format before diffing?",
    answer:
      "Yes, if your XML files have <strong>different indentation styles</strong>. Click <strong>format</strong> to normalize both files first, so only meaningful data differences are highlighted rather than whitespace changes.",
  },
  {
    question: "Is my data sent to a server?",
    answer:
      "No. All comparison happens <strong>entirely in your browser</strong>. Your XML never leaves your device.",
  },
  {
    question: "Can I use this to compare XML API responses?",
    answer:
      "Yes. Paste two XML API responses to <strong>quickly spot structural or value differences</strong> — for example, when debugging a regression between two versions of a service.",
  },
  {
    question: "What does it mean when a line appears in both red and the other panel?",
    answer:
      "Red lines in each panel represent the <strong>old version</strong> of that line (in XML A) and the <strong>new version</strong> (in XML B). Reading both together shows exactly what changed.",
  },
  {
    question: "Does the diff understand XML structure or just text?",
    answer:
      "The diff operates on <strong>text lines</strong>. For the most meaningful results, format both documents to consistent indentation first — this ensures structural changes map cleanly to line differences.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is XML?",
    content: `<p><strong>XML (Extensible Markup Language)</strong> is a structured text format that uses nested tags to represent data. It is widely used in enterprise systems, configuration files, document formats, and SOAP web services.</p>
<p>An XML document consists of elements (tags), attributes (metadata on tags), and text content. All tags must be properly closed, and the document must have a <strong>single root element</strong>. These strict rules make XML ideal for validation and schema enforcement.</p>`,
  },
  {
    title: "Why Compare XML Documents?",
    content: `<p>Comparing two XML documents manually is time-consuming and error-prone. A visual diff tool highlights changes instantly:</p>
<ul>
<li><strong>Configuration auditing:</strong> See what changed between two versions of an XML config file</li>
<li><strong>API debugging:</strong> Compare XML responses from two endpoints or two points in time</li>
<li><strong>Data migration:</strong> Verify that transformed XML output matches the expected structure</li>
<li><strong>Schema changes:</strong> Review additions, removals, or renamed elements across document versions</li>
</ul>`,
  },
];

export default function XmlDiffPage() {
  if (!tool) notFound();

  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <XmlDiff />
    </ToolContainer>
  );
}
