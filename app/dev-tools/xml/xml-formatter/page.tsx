import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { XmlFormatter } from "@/components/tools/xml/XmlFormatter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("xml-formatter");

const tool = TOOLS.find((t) => t.slug === "xml-formatter")!;

const howToSteps = [
  "Paste or type your <strong>XML</strong> into the input panel on the left — it can be minified, poorly indented, or already partially formatted.",
  "The formatter <strong>validates and prettifies</strong> your XML automatically as you type, applying consistent indentation and line breaks to every element.",
  "Choose between <strong>2-space or 4-space indentation</strong> using the toolbar selector to match the style required by your project or team.",
  "Use <strong>minify</strong> to collapse the XML back into a single compact line with all whitespace removed when you need the smallest possible output.",
  "Click <strong>copy</strong> to copy the formatted output to your clipboard, ready to paste into your editor or configuration file.",
];

const faqs = [
  {
    question: "What is an XML Formatter?",
    answer:
      "An <strong>XML Formatter</strong> (also called XML Beautifier) takes minified or poorly-indented XML and outputs it with consistent indentation and line breaks, making it much easier to read, debug, and edit. It also validates the XML and reports syntax errors.",
  },
  {
    question: "Does this validate XML too?",
    answer:
      "Yes. The formatter <strong>validates your XML as you type</strong>. If there is a syntax error — such as a missing closing tag, malformed attribute, or mismatched element — it shows the exact error message so you can fix it immediately.",
  },
  {
    question: "Is my XML data sent to a server?",
    answer:
      "No. All formatting and validation happens <strong>entirely in your browser</strong>. Your XML never leaves your device.",
  },
  {
    question: "What is the difference between format and minify?",
    answer:
      "<strong>Formatting</strong> adds indentation and line breaks to make XML human-readable. <strong>Minifying</strong> removes all unnecessary whitespace to produce the smallest possible output, ideal for production systems and data transfer.",
  },
  {
    question: "What is the difference between well-formed and valid XML?",
    answer:
      "<strong>Well-formed XML</strong> follows the basic syntax rules — all tags are properly opened and closed, attributes are quoted, and there is a single root element. <strong>Valid XML</strong> additionally conforms to a specific schema (DTD or XSD). This formatter checks well-formedness.",
  },
  {
    question: "Can I format XML with an XML declaration?",
    answer:
      "Yes. The formatter preserves the <strong>XML declaration</strong> (<code>&lt;?xml version=\"1.0\" encoding=\"UTF-8\"?&gt;</code>) at the top of the document when present.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is XML?",
    content: `<p><strong>XML (Extensible Markup Language)</strong> is a structured text format that uses nested tags to represent data. It is widely used for configuration files, enterprise data exchange, document formats, and web services. XML must follow strict syntax rules: every tag must be closed, attributes must be quoted, and the document must have a single root element.</p>
<p>Raw or minified XML can be nearly impossible to read. Formatting adds <strong>consistent indentation</strong> to make the hierarchy immediately visible, making it much easier to understand and edit.</p>`,
  },
  {
    title: "Why Format XML?",
    content: `<p>Formatted XML is easier to work with in every way:</p>
<ul>
<li><strong>Readability:</strong> Indentation reveals the nesting structure at a glance</li>
<li><strong>Debugging:</strong> Spot missing closing tags, misplaced attributes, or incorrect nesting quickly</li>
<li><strong>Code review:</strong> Readable XML in diffs is far easier to review than a single-line blob</li>
<li><strong>Collaboration:</strong> Consistent indentation style reduces friction when multiple people edit the same file</li>
</ul>`,
  },
  {
    title: "XML Best Practices",
    content: `<p>Following XML conventions leads to more maintainable documents:</p>
<ul>
<li>Always include an <strong>XML declaration</strong> with the encoding: <code>&lt;?xml version="1.0" encoding="UTF-8"?&gt;</code></li>
<li>Use <strong>lowercase element names</strong> with hyphens for readability (e.g. <code>&lt;user-profile&gt;</code>)</li>
<li>Prefer <strong>child elements</strong> for data and <strong>attributes</strong> for metadata</li>
<li>Keep nesting shallow — deeply nested XML is harder to read and process</li>
<li>Use a <strong>schema</strong> (XSD or DTD) to enforce structure for data exchanged between systems</li>
</ul>`,
  },
];

export default function XmlFormatterPage() {
  if (!tool) notFound();

  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <XmlFormatter />
    </ToolContainer>
  );
}
