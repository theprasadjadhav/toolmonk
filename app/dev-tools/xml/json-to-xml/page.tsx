import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { JsonToXml } from "@/components/tools/shared/data-formats/JsonToXml";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("json-to-xml");
const tool = TOOLS.find((t) => t.slug === "json-to-xml" && t.category === "dev-tools")!;

const howToSteps = [
  "Paste or type <strong>valid JSON</strong> into the left editor — objects, arrays, and all primitive types are supported.",
  "The <strong>XML output</strong> is generated instantly in the right panel, with each JSON key becoming an XML element.",
  "Click <strong>sample</strong> to load a demonstration with a realistic nested structure so you can see how the conversion works.",
  "Copy the <strong>XML output</strong> using the copy button to use it in your application, data pipeline, or configuration system.",
];

const faqs = [
  {
    question: "What root element name is used?",
    answer:
      "Objects use <code>&lt;root&gt;</code> as the wrapping element. Arrays use <code>&lt;items&gt;</code> with each element wrapped in <code>&lt;item&gt;</code>. This produces a valid, well-formed XML document.",
  },
  {
    question: "Are JSON keys sanitized for XML?",
    answer:
      "Yes — <strong>invalid XML tag characters</strong> (such as spaces, colons, and special symbols) are replaced with underscores to ensure the output is valid XML.",
  },
  {
    question: "Does it handle nested objects and arrays?",
    answer:
      "Yes. <strong>Nested objects</strong> become nested XML elements. <strong>Arrays</strong> produce repeated sibling elements with the same tag name, which is the standard XML convention for representing lists.",
  },
  {
    question: "Is data sent to a server?",
    answer:
      "No. All conversion happens <strong>in your browser</strong>. Your data never leaves your device.",
  },
  {
    question: "What is the difference between JSON and XML for data exchange?",
    answer:
      "<strong>JSON</strong> is more compact and directly maps to data structures used in most programming languages, making it preferred for modern APIs. <strong>XML</strong> is more verbose but supports attributes, namespaces, schemas, and transformation languages, making it standard in enterprise systems and legacy integrations.",
  },
  {
    question: "Can I add an XML declaration to the output?",
    answer:
      "The output does not include an XML declaration (<code>&lt;?xml version=\"1.0\"?&gt;</code>) by default. You can add it manually at the top of the output if your target system requires it.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is XML?",
    content: `<p><strong>XML (Extensible Markup Language)</strong> is a text-based format for representing structured data using nested tags. It was designed to be both human-readable and machine-readable, and became the standard for data exchange in enterprise systems, web services, and document formats.</p>
<p>Unlike JSON, XML supports <strong>attributes</strong> (metadata on elements), <strong>namespaces</strong> (for avoiding naming conflicts), and <strong>schemas</strong> (for validating document structure). This makes it more powerful but also more verbose than JSON.</p>`,
  },
  {
    title: "JSON vs XML",
    content: `<p>Choosing between JSON and XML depends on your use case:</p>
<ul>
<li><strong>JSON</strong> is more compact, easier to read, and natively supported by web APIs — the default choice for new systems</li>
<li><strong>XML</strong> is required by many enterprise systems, SOAP web services, and legacy integrations</li>
<li>XML supports <strong>attributes, namespaces, and comments</strong> which JSON does not have direct equivalents for</li>
<li>JSON arrays map cleanly to sequences; XML requires repeated elements or a wrapper element convention</li>
</ul>
<p>When you need to send data to a system that requires XML, converting from JSON is the most practical approach.</p>`,
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
