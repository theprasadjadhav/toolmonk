import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { HtmlDecoder } from "@/components/tools/encoding/HtmlDecoder";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("html-decode");

const tool = TOOLS.find((t) => t.slug === "html-decode")!;

const howToSteps = [
  "Paste your <strong>HTML-encoded text</strong> into the input panel on the left — this is text that contains entity references like <strong>&amp;lt;</strong>, <strong>&amp;amp;</strong>, or <strong>&#38;</strong>.",
  "The <strong>decoded output</strong> appears instantly in the right panel, with all entities converted back to their original characters.",
  "The decoder handles <strong>named entities</strong> (&amp;amp;, &amp;lt;, &amp;gt;), <strong>decimal numeric entities</strong> (&#38;), and <strong>hex numeric entities</strong> (&#x26;) automatically.",
  "Click <strong>copy</strong> to copy the decoded result to your clipboard, or <strong>clear</strong> to reset both panels.",
];

const faqs = [
  {
    question: "What is HTML decoding?",
    answer:
      "<strong>HTML decoding</strong> converts HTML entities back into their original characters. For example, <strong>&amp;lt;</strong> becomes <strong>&lt;</strong>, <strong>&amp;amp;</strong> becomes <strong>&amp;</strong>, and <strong>&amp;quot;</strong> becomes <strong>\"</strong>. It is the reverse of HTML encoding and is used to recover the plain text that was originally encoded for safe display in HTML.",
  },
  {
    question: "What types of HTML entities does this decoder support?",
    answer:
      "The decoder handles all three forms: <strong>named entities</strong> (&amp;amp;, &amp;lt;, &amp;gt;, &amp;nbsp;, &amp;copy;, and hundreds more), <strong>decimal numeric entities</strong> (&#38; = &amp;), and <strong>hexadecimal numeric entities</strong> (&#x26; = &amp;). Any valid HTML entity reference is converted.",
  },
  {
    question: "Why would I need to decode HTML entities?",
    answer:
      "HTML entities appear in <strong>API responses, template output, database content,</strong> and <strong>scraped web pages</strong>. Decoding them reveals the actual plain text, which is useful when debugging templates, processing HTML data programmatically, or displaying content that was stored in encoded form.",
  },
  {
    question: "Is my data sent to a server?",
    answer:
      "No. All <strong>decoding happens entirely in your browser</strong>. Your data never leaves your device.",
  },
  {
    question: "What is the difference between &amp;nbsp; and a regular space?",
    answer:
      "A <strong>non-breaking space (&amp;nbsp;)</strong> is an HTML entity that looks like a space but prevents line breaks between the words on either side of it. It also does not collapse like regular spaces do in HTML. When decoded, it appears as a regular-looking space character but with a different underlying byte value.",
  },
  {
    question: "When does HTML encoding happen automatically?",
    answer:
      "Most <strong>server-side templating systems and web frameworks</strong> automatically HTML-encode any variable content they insert into HTML pages as a security measure. This means that if you retrieve text from a database or API and then display it in a browser, you may see the encoded version with entities rather than the original characters — which is where a decoder is useful for inspection.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Are HTML Entities?",
    content: `<p><strong>HTML entities</strong> are text sequences that represent characters which would otherwise be interpreted as HTML markup. For example, the less-than sign <strong>&lt;</strong> starts an HTML tag, so to display it as literal text in a web page, it must be written as <strong>&amp;lt;</strong> — the entity reference. When the browser renders the page, it converts the entity back to the character for display.</p>
<p>There are three types of HTML entities: <strong>named entities</strong> (like &amp;amp; for &amp;), <strong>decimal numeric entities</strong> (like &#38; for &amp;), and <strong>hexadecimal numeric entities</strong> (like &#x26; for &amp;). All three forms are valid HTML and produce the same result when rendered.</p>`,
  },
  {
    title: "Common Use Cases for Decoding",
    content: `<ul>
<li><strong>Debugging API responses:</strong> REST APIs sometimes return HTML-encoded content in JSON fields. Decoding reveals the original text.</li>
<li><strong>Processing scraped content:</strong> Web scrapers often capture the raw HTML source, which contains entity-encoded characters that need to be decoded before the text is useful.</li>
<li><strong>Inspecting template output:</strong> Server-side templates encode variables for safety. Decoding helps verify what the original content was before encoding.</li>
<li><strong>Working with legacy data:</strong> Older databases and content management systems sometimes store content with HTML entities already applied, requiring decoding for clean display elsewhere.</li>
</ul>`,
  },
];

export default function HtmlDecodePage() {
  if (!tool) notFound();

  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <HtmlDecoder />
    </ToolContainer>
  );
}
