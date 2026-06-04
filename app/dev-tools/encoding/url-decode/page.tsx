import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { UrlDecoder } from "@/components/tools/shared/text/UrlDecoder";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("url-decode");

const tool = TOOLS.find((t) => t.slug === "url-decode" && t.category === "dev-tools")!;

const howToSteps = [
  "Paste your <strong>URL-encoded string</strong> or a full encoded URL into the input panel on the left.",
  "The <strong>decoded output</strong> appears instantly in the right panel, with all percent-encoded sequences converted back to their original characters.",
  "Choose <strong>Full component decode</strong> to convert all percent-encoded characters — including reserved ones like <strong>%2F (/)</strong> and <strong>%3F (?)</strong>.",
  "Choose <strong>URI decode</strong> to decode a complete URL while preserving structural reserved characters (<strong>:, /, ?, #, &amp;</strong>) intact.",
  "Click <strong>copy</strong> to copy the decoded result, or <strong>clear</strong> to reset both panels.",
];

const faqs = [
  {
    question: "What is URL decoding?",
    answer:
      "<strong>URL decoding</strong> converts <strong>percent-encoded characters</strong> back to their original form. For example, <strong>%20</strong> becomes a space, <strong>%26</strong> becomes <strong>&amp;</strong>, and <strong>%3D</strong> becomes <strong>=</strong>. It is the reverse of URL encoding and is used to read the original content of an encoded URL or query string.",
  },
  {
    question: "What is the difference between full component decode and URI decode?",
    answer:
      "<strong>Full component decode</strong> decodes all percent-encoded sequences, including structural characters like <strong>%2F (/)</strong>, <strong>%3F (?)</strong>, and <strong>%23 (#)</strong>. Use it when decoding an individual parameter value. <strong>URI decode</strong> only decodes sequences that could not appear in a valid URI structure — it leaves reserved characters like %2F intact, making it safe for decoding a complete URL.",
  },
  {
    question: "What happens if I paste an invalid encoded string?",
    answer:
      "The decoder shows an <strong>error</strong> if the input contains malformed percent-encoded sequences — for example, a <strong>%</strong> sign not followed by two valid hexadecimal digits. Fix the input and the decoded output will update automatically.",
  },
  {
    question: "Is my data sent to a server?",
    answer:
      "No. All <strong>decoding happens entirely in your browser</strong>. Your data never leaves your device.",
  },
  {
    question: "What does a percent-encoded URL look like?",
    answer:
      "A percent-encoded URL replaces unsafe or reserved characters with a <strong>% sign followed by two hexadecimal digits</strong> representing the character's byte value. For example, the URL <strong>https://example.com/search?q=hello%20world&amp;lang=en</strong> has the space in the search query encoded as <strong>%20</strong>.",
  },
  {
    question: "Why would a URL contain encoded characters?",
    answer:
      "URLs are restricted to a safe subset of ASCII characters. Any character outside that set — including <strong>spaces, accented letters, non-Latin scripts, and many punctuation marks</strong> — must be percent-encoded before being placed in a URL. This ensures the URL is valid and unambiguous across all systems that process it.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is URL Encoding?",
    content: `<p><strong>URL encoding</strong> (also called <strong>percent-encoding</strong>) is a method of representing characters that are not allowed in a URL by replacing each unsafe byte with a <strong>% sign followed by two hexadecimal digits</strong>. For example, a space character (byte value 32, or 0x20 in hex) becomes <strong>%20</strong>.</p>
<p>URLs can only contain a restricted set of characters: letters, digits, and a handful of safe symbols. Everything else — including spaces, brackets, quotes, non-ASCII characters, and many punctuation marks — must be encoded. URL decoding reverses this transformation, turning the percent sequences back into their original characters so the URL is human-readable again.</p>`,
  },
  {
    title: "Full Component Decode vs URI Decode",
    content: `<p>There are two modes of URL decoding that serve different purposes:</p>
<ul>
<li><strong>Full component decode</strong> converts every percent-encoded sequence in the string, including characters that are structurally meaningful in URLs like <strong>/ ? # &amp; =</strong>. Use this when decoding the <em>value</em> of a single query parameter or path segment.</li>
<li><strong>URI decode</strong> only decodes characters that are not reserved in the URI specification. It leaves <strong>/ ? # &amp; =</strong> encoded if they were encoded in the original, preserving the URL structure. Use this when decoding a complete URL that you want to remain navigable.</li>
</ul>
<p>Choosing the wrong mode can break URL structure or produce incorrect results, so selecting the right one for your use case matters.</p>`,
  },
];

export default function UrlDecodePage() {
  if (!tool) notFound();

  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <UrlDecoder />
    </ToolContainer>
  );
}
