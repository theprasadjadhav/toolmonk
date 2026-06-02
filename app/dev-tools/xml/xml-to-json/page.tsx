import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { XmlToJson } from "@/components/tools/shared/data-formats/XmlToJson";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("xml-to-json");
const tool = TOOLS.find((t) => t.slug === "xml-to-json" && t.category === "dev-tools")!;

const howToSteps = [
  "Paste or type <strong>valid XML</strong> into the left editor — the document must be well-formed with a single root element.",
  "The <strong>JSON output</strong> is generated instantly in the right panel, preserving the element hierarchy as nested objects.",
  "<strong>Repeated sibling tags</strong> with the same name are automatically converted to JSON arrays.",
  "Copy the <strong>JSON output</strong> using the copy button to use it in your application or API.",
];

const faqs = [
  {
    question: "How are XML attributes handled?",
    answer:
      "Attributes are included in the JSON as keys <strong>prefixed with @</strong> (e.g. <code>@id</code>, <code>@class</code>). This makes it easy to distinguish attribute values from child element values in the output.",
  },
  {
    question: "How are repeated elements handled?",
    answer:
      "Repeated sibling tags with the same name are automatically <strong>grouped into a JSON array</strong>. This is the standard convention for representing XML lists in JSON.",
  },
  {
    question: "Are numeric values coerced?",
    answer:
      "Yes — text content that looks like a <strong>number or boolean</strong> is coerced to the native JSON type. If you need to keep all values as strings, be aware of this automatic type detection.",
  },
  {
    question: "Is data sent to a server?",
    answer:
      "No. Parsing uses the <strong>browser's built-in XML parser</strong>. Your data never leaves your device.",
  },
  {
    question: "How are XML namespaces handled?",
    answer:
      "Namespace prefixes are preserved as part of the element or attribute name in the JSON output (e.g. <code>ns:element</code> becomes a key <code>ns:element</code>). Namespace declarations (<code>xmlns</code> attributes) are included with the <code>@xmlns</code> prefix.",
  },
  {
    question: "What is the difference between XML and JSON?",
    answer:
      "<strong>XML</strong> uses nested tags with attributes and supports schemas, namespaces, and comments. <strong>JSON</strong> is more compact and directly maps to data structures in most programming languages. Converting XML to JSON makes data easier to work with in modern web APIs and applications.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is XML?",
    content: `<p><strong>XML (Extensible Markup Language)</strong> is a structured text format that uses nested tags to represent data. It is widely used in enterprise systems, configuration files, SOAP web services, and document formats such as SVG and Office files.</p>
<p>XML is verbose but powerful — it supports <strong>attributes, namespaces, schemas, and transformation languages</strong>. Converting XML to JSON simplifies the data and makes it easier to work with in modern web applications.</p>`,
  },
  {
    title: "Why Convert XML to JSON?",
    content: `<p>Most modern APIs and web applications use JSON as their native data format. Converting XML to JSON enables you to:</p>
<ul>
<li><strong>Consume legacy services:</strong> Work with data from SOAP or XML-based APIs using modern JSON tooling</li>
<li><strong>Simplify data structures:</strong> JSON's compact format is easier to read, query, and manipulate</li>
<li><strong>Store in document databases:</strong> JSON-native databases require JSON input</li>
<li><strong>Integrate with web apps:</strong> Modern frontends and APIs work natively with JSON</li>
</ul>`,
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
