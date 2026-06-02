import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { XmlMinifier } from "@/components/tools/xml/XmlMinifier";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("xml-minifier");

const tool = TOOLS.find((t) => t.slug === "xml-minifier")!;

const howToSteps = [
  "Paste your <strong>formatted XML</strong> into the input panel on the left — any amount of indentation or whitespace is fine.",
  "The <strong>minified output</strong> appears instantly in the right panel as a compact single-line string with all whitespace removed.",
  "The status bar shows the <strong>original size, minified size, and percentage saved</strong> so you can see the impact immediately.",
  "Click <strong>copy output</strong> to copy the minified XML to your clipboard.",
  "Use <strong>clear</strong> to reset both panels and start with new input.",
];

const faqs = [
  {
    question: "What does XML minification do?",
    answer:
      "<strong>XML minification</strong> removes all unnecessary whitespace — spaces, tabs, and newlines — between tags and strips XML comments. The result is a compact single-line string that is smaller in file size but <strong>functionally identical</strong> to the original.",
  },
  {
    question: "Are XML comments removed during minification?",
    answer:
      "Yes. <strong>Comments</strong> are removed during minification as they are not part of the data. If you need to preserve comments, use the XML formatter instead.",
  },
  {
    question: "Is my data sent to a server?",
    answer:
      "No. All minification happens <strong>in your browser</strong>. Your XML never leaves your device.",
  },
  {
    question: "How much space does XML minification save?",
    answer:
      "Savings depend on how much whitespace and how many comments the original document contains. <strong>Heavily formatted XML</strong> can shrink by 20–50%. The size comparison is shown automatically after minification.",
  },
  {
    question: "Does minification change the data?",
    answer:
      "No. Minification only removes <strong>whitespace and comments</strong> — element names, attribute values, text content, and structure are completely unchanged. The minified XML is fully equivalent to the formatted original.",
  },
  {
    question: "When should I minify XML?",
    answer:
      "Minify XML when transmitting it over a network — such as in a <strong>SOAP web service request or response</strong> — or when storing it in a database or cache where space efficiency matters. Keep the formatted version for editing and debugging.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is XML Minification?",
    content: `<p><strong>XML minification</strong> strips all non-essential characters from an XML document — spaces between tags, line breaks, and comments — leaving only the data and structure. The resulting string is compact and takes up less space, making it faster to transmit and cheaper to store.</p>
<p>Minified XML is semantically identical to the formatted original. Any system that can parse the formatted version can also parse the minified version.</p>`,
  },
  {
    title: "Why Minify XML?",
    content: `<p>Minification reduces the size of XML payloads, which has real benefits in production systems:</p>
<ul>
<li><strong>Faster transmission:</strong> Smaller XML payloads transfer faster over HTTP</li>
<li><strong>Lower bandwidth costs:</strong> Reduced data transfer when serving high volumes of requests</li>
<li><strong>Smaller storage:</strong> Configuration files and documents take less disk space</li>
<li><strong>Cache efficiency:</strong> Compact values fit better in caches with size limits</li>
</ul>
<p>Always keep a formatted version for editing. Minify only at the point of deployment or transmission.</p>`,
  },
];

export default function XmlMinifierPage() {
  if (!tool) notFound();

  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <XmlMinifier />
    </ToolContainer>
  );
}
