import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { XmlValidator } from "@/components/tools/xml/XmlValidator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("xml-validator");

const tool = TOOLS.find((t) => t.slug === "xml-validator")!;

const howToSteps = [
  "Paste your <strong>XML</strong> into the editor — the document can include an XML declaration, namespaces, and nested elements.",
  "The validator <strong>checks your XML instantly as you type</strong>, with no need to press a button.",
  "A <strong>green banner</strong> confirms the XML is well-formed and shows the root element name and total element count.",
  "A <strong>red banner</strong> shows the exact error message from the parser — including the location of the error — so you can find and fix it quickly.",
  "<strong>Fix the reported error</strong> and the status updates immediately to confirm the document is now valid.",
];

const faqs = [
  {
    question: "What does XML validation check?",
    answer:
      "This tool checks that your XML is <strong>well-formed</strong>: all tags are properly opened and closed, attributes are correctly quoted, and the document has a single root element. It uses the browser's built-in XML parser for accurate results.",
  },
  {
    question: "What is the difference between well-formed and valid XML?",
    answer:
      "<strong>Well-formed XML</strong> follows the basic syntax rules — correct tags, nesting, and quoting. <strong>Valid XML</strong> additionally conforms to a specific schema (DTD or XSD). This tool checks for well-formedness.",
  },
  {
    question: "Is my XML sent to a server?",
    answer:
      "No. Validation runs <strong>entirely in your browser</strong> using the native XML parser. Your XML never leaves your device.",
  },
  {
    question: "What are the most common XML errors?",
    answer:
      "The most frequent XML errors are: <strong>missing closing tags</strong>, <strong>mismatched tags</strong> (e.g. opening <code>&lt;div&gt;</code> and closing <code>&lt;/div2&gt;</code>), <strong>unquoted attributes</strong>, <strong>multiple root elements</strong>, and <strong>unescaped special characters</strong> (use <code>&amp;amp;</code> for &amp;, <code>&amp;lt;</code> for &lt;).",
  },
  {
    question: "Does this tool validate against a schema?",
    answer:
      "No. This tool validates that the XML is <strong>syntactically well-formed</strong>. Schema validation (checking that required elements and attributes are present) requires an XSD or DTD file and is a separate process.",
  },
  {
    question: "What special characters need to be escaped in XML?",
    answer:
      "Five characters have special meaning in XML and must be escaped inside text content and attribute values: <strong>&amp;</strong> → <code>&amp;amp;</code>, <strong>&lt;</strong> → <code>&amp;lt;</code>, <strong>&gt;</strong> → <code>&amp;gt;</code>, <strong>&quot;</strong> → <code>&amp;quot;</code>, <strong>&apos;</strong> → <code>&amp;apos;</code>.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is XML?",
    content: `<p><strong>XML (Extensible Markup Language)</strong> is a structured text format that uses nested tags to represent data. It must follow strict syntax rules to be well-formed: every element must be properly closed, attributes must be quoted, and the document must have exactly one root element.</p>
<p>XML is used in configuration files, enterprise data exchange, SOAP web services, and document formats. A validator immediately tells you whether your XML follows these rules.</p>`,
  },
  {
    title: "Well-Formed vs Valid XML",
    content: `<p>There are two levels of XML correctness:</p>
<ul>
<li><strong>Well-formed:</strong> The XML follows the basic syntax rules — all tags closed, attributes quoted, single root element, special characters escaped. Any XML processor can parse a well-formed document.</li>
<li><strong>Valid:</strong> The XML conforms to a specific schema (XSD or DTD) — required elements are present, data types match, element order is correct. Validation requires both a document and a schema.</li>
</ul>
<p>This tool checks <strong>well-formedness</strong>, which is the first and most fundamental requirement before any further processing.</p>`,
  },
  {
    title: "Common XML Syntax Errors",
    content: `<p>Understanding common XML errors saves debugging time:</p>
<ul>
<li><strong>Missing closing tag:</strong> Every <code>&lt;element&gt;</code> must have a matching <code>&lt;/element&gt;</code> or be self-closing (<code>&lt;element /&gt;</code>)</li>
<li><strong>Unescaped ampersand:</strong> Use <code>&amp;amp;</code> instead of a bare <code>&amp;</code> in content</li>
<li><strong>Multiple root elements:</strong> An XML document must have exactly one root element wrapping all others</li>
<li><strong>Unquoted attributes:</strong> Attribute values must always be enclosed in single or double quotes</li>
<li><strong>Case mismatch:</strong> XML is case-sensitive — <code>&lt;Item&gt;</code> and <code>&lt;item&gt;</code> are different elements</li>
</ul>`,
  },
];

export default function XmlValidatorPage() {
  if (!tool) notFound();

  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <XmlValidator />
    </ToolContainer>
  );
}
