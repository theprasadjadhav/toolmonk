import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { JsonToXml } from "@/components/tools/converters/JsonToXml";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("json-to-xml");

const tool = TOOLS.find((t) => t.slug === "json-to-xml")!;

const howToSteps = [
  "Paste or type <strong>valid JSON</strong> into the left editor — click the <strong>Sample</strong> button to load a demonstration if you want to see the format first.",
  "The <strong>XML output</strong> is generated instantly. Objects are wrapped in a <code>&lt;root&gt;</code> element, and array items are wrapped in <code>&lt;item&gt;</code> tags.",
  "Click <strong>Copy</strong> to copy the XML output to your clipboard, ready to paste into any system that requires XML input.",
];

const faqs = [
  {
    question: "What root element name is used?",
    answer:
      "A top-level <strong>JSON object</strong> is wrapped in a <code>&lt;root&gt;</code> element. A top-level <strong>JSON array</strong> is wrapped in an <code>&lt;items&gt;</code> element, with each item rendered as an <code>&lt;item&gt;</code> child.",
  },
  {
    question: "Are JSON keys sanitized for XML?",
    answer:
      "Yes — characters that are invalid in <strong>XML tag names</strong> (such as spaces, @, $, and digits at the start) are replaced with underscores so the output is always well-formed XML.",
  },
  {
    question: "Does it handle nested objects and arrays?",
    answer:
      "Yes. <strong>Nested JSON objects</strong> become nested XML elements, and <strong>JSON arrays</strong> produce repeated sibling elements of the same tag name, which is the standard XML pattern for lists.",
  },
  {
    question: "Is data sent to a server?",
    answer:
      "No. All conversion happens <strong>entirely in your browser</strong>. Your data never leaves your device.",
  },
  {
    question: "What is XML used for?",
    answer:
      "<strong>XML</strong> (Extensible Markup Language) is widely used for configuration files, data exchange between enterprise systems, RSS/Atom feeds, SOAP web services, and document formats such as DOCX and XLSX. Converting JSON to XML is often needed when integrating with older systems that do not accept JSON.",
  },
  {
    question: "Can I control the XML element names?",
    answer:
      "Element names come directly from your <strong>JSON keys</strong>. To control the element names in the output, rename the keys in your JSON before converting.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is XML?",
    content: `<p><strong>XML (Extensible Markup Language)</strong> is a text-based format for storing and transporting structured data. It uses nested tags — similar to HTML — to represent hierarchical information. Unlike HTML, XML has no predefined tags; you define your own tag names to describe your data.</p><p>XML is the standard format for many enterprise systems, government data feeds, document formats (such as Word and Excel files internally), and older web services. Even though JSON has largely replaced XML in new web APIs, XML remains essential for integrating with legacy systems and certain industries.</p>`,
  },
  {
    title: "JSON vs. XML — Key Differences",
    content: `<p>Both formats represent hierarchical data, but they differ in several ways:</p><ul><li><strong>Verbosity</strong> — XML requires opening and closing tags, making it more verbose than JSON for the same data</li><li><strong>Attributes</strong> — XML supports element attributes in addition to content; JSON has no direct equivalent</li><li><strong>Data types</strong> — JSON has native types (number, boolean, null); XML represents everything as text</li><li><strong>Readability</strong> — JSON is generally easier for developers to read and write by hand</li><li><strong>Compatibility</strong> — XML is required by many enterprise tools, SOAP services, and older standards</li></ul>`,
  },
  {
    title: "Common Use Cases for JSON to XML Conversion",
    content: `<p>Converting JSON to XML is typically needed when:</p><ul><li>Sending data to a <strong>SOAP web service</strong> or enterprise integration platform that requires XML</li><li>Generating <strong>configuration files</strong> for tools that use XML-based config (e.g. Maven, Ant, many server configs)</li><li>Creating <strong>RSS or Atom feeds</strong> from a JSON data source</li><li>Exporting data into an XML-based document format or archiving system</li></ul>`,
  },
];

export default function JsonToXmlPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <JsonToXml />
    </ToolContainer>
  );
}
