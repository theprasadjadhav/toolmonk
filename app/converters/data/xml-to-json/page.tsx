import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { XmlToJson } from "@/components/tools/converters/XmlToJson";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("xml-to-json");

const tool = TOOLS.find((t) => t.slug === "xml-to-json")!;

const howToSteps = [
  "Paste or type <strong>valid XML</strong> into the left editor — the document must have a single root element and properly closed tags.",
  "The <strong>JSON output</strong> is generated instantly. Repeated sibling tags are automatically grouped into <strong>JSON arrays</strong>.",
  "Click <strong>Copy</strong> to copy the JSON output to your clipboard, ready to use in your application or API.",
];

const faqs = [
  {
    question: "How are XML attributes handled?",
    answer:
      "XML <strong>element attributes</strong> are included in the JSON output as keys prefixed with <code>@</code> — for example, an attribute <code>id=\"5\"</code> becomes <code>\"@id\": \"5\"</code> in the JSON object for that element.",
  },
  {
    question: "How are repeated elements handled?",
    answer:
      "Repeated sibling tags with the <strong>same name</strong> are automatically grouped into a <strong>JSON array</strong>. For example, multiple <code>&lt;item&gt;</code> elements inside a parent become an array of item objects.",
  },
  {
    question: "Are numeric values coerced?",
    answer:
      "Yes — text content that looks like a <strong>number</strong> is coerced to a JSON number, and <strong>true/false</strong> text is coerced to a JSON boolean, reducing the need for manual post-processing.",
  },
  {
    question: "Is data sent to a server?",
    answer:
      "No. Parsing uses the browser's built-in XML parser. Your data stays <strong>entirely on your device</strong>.",
  },
  {
    question: "What happens to XML namespaces?",
    answer:
      "Namespace prefixes are preserved as part of the key name (e.g. <code>ns:element</code> becomes the key <code>\"ns:element\"</code>). Namespace declaration attributes (<code>xmlns</code>) are treated as regular attributes.",
  },
  {
    question: "What is XML used for?",
    answer:
      "<strong>XML</strong> is used for configuration files, RSS/Atom feeds, SOAP web service responses, Microsoft Office document internals, and data exchange in enterprise systems. Converting XML to JSON makes this data usable in modern web applications and APIs that expect JSON.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is XML?",
    content: `<p><strong>XML (Extensible Markup Language)</strong> is a text-based format for structured data that uses nested tags to represent hierarchical information. Unlike HTML, XML has no predefined tags — you define your own to suit your data. A valid XML document has a single root element, and every opened tag must be properly closed.</p><p>XML is still widely used in enterprise software, government data feeds, document formats, RSS feeds, and many configuration systems. Converting XML to JSON is often necessary when you receive XML from a legacy service but need to process it in a modern application.</p>`,
  },
  {
    title: "XML vs. JSON — Key Differences",
    content: `<p>Both formats represent hierarchical data, but they differ in important ways:</p><ul><li><strong>Verbosity</strong> — XML requires opening and closing tags, making it significantly more verbose than the equivalent JSON</li><li><strong>Attributes</strong> — XML elements can have attributes in addition to text content; JSON objects only have key-value pairs</li><li><strong>Data types</strong> — JSON has native types (number, boolean, null, array); XML stores everything as text</li><li><strong>Comments</strong> — XML supports inline comments; JSON does not</li><li><strong>Adoption</strong> — JSON is the dominant format for modern web APIs; XML remains standard for enterprise and legacy systems</li></ul>`,
  },
  {
    title: "Common Use Cases for XML to JSON Conversion",
    content: `<p>Converting XML to JSON is a common step in data integration workflows:</p><ul><li>Processing <strong>SOAP web service responses</strong> in a modern application that works with JSON</li><li>Parsing <strong>RSS or Atom feeds</strong> to display news or content updates</li><li>Reading <strong>configuration files</strong> that use XML format (Maven, Ant, server configs)</li><li>Migrating data from a <strong>legacy enterprise system</strong> that exports XML into a modern database or API</li></ul>`,
  },
];

export default function XmlToJsonPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <XmlToJson />
    </ToolContainer>
  );
}
