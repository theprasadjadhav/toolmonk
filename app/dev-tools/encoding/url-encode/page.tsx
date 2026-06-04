import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { UrlEncoder } from "@/components/tools/shared/text/UrlEncoder";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("url-encode");

const tool = TOOLS.find((t) => t.slug === "url-encode" && t.category === "dev-tools")!;

const howToSteps = [
  "Type or paste the <strong>text or URL</strong> you want to encode into the input panel on the left.",
  "The <strong>URL-encoded output</strong> appears instantly in the right panel as you type, with unsafe characters replaced by percent-encoded sequences.",
  "Choose <strong>Full component encode</strong> to encode all special characters including reserved ones like <strong>/, ?, &amp;, #</strong> — use this for encoding individual query parameter values.",
  "Choose <strong>URI encode</strong> to encode only characters that are invalid in a URI, preserving structural characters like <strong>:, /, ?, #, &amp;,</strong> and <strong>=</strong> — use this for encoding a complete URL.",
  "Click <strong>copy</strong> to copy the result, or <strong>clear</strong> to reset both panels.",
];

const faqs = [
  {
    question: "What is URL encoding?",
    answer:
      "<strong>URL encoding</strong> (also called <strong>percent-encoding</strong>) converts characters that are not allowed in a URL into a safe representation: a <strong>% sign followed by the character's two-digit hexadecimal byte value</strong>. For example, a space becomes <strong>%20</strong> and an ampersand becomes <strong>%26</strong>.",
  },
  {
    question: "What is the difference between full component encode and URI encode?",
    answer:
      "<strong>Full component encode</strong> encodes everything except unreserved characters (letters, digits, and <strong>- _ . ~</strong>). Use it for encoding individual <strong>query parameter values</strong> so that characters like <strong>&amp;</strong> and <strong>=</strong> in the value do not break the query string structure. <strong>URI encode</strong> preserves structural URL characters like <strong>: / ? # &amp; =</strong>, making it suitable for encoding a <strong>complete URL</strong> that must remain navigable.",
  },
  {
    question: "When should I use URL encoding?",
    answer:
      "Use URL encoding whenever you include <strong>user-generated text, search queries, or special characters as part of a URL</strong>. Unencoded special characters in query strings can break links, cause incorrect parsing, and introduce security vulnerabilities such as URL injection attacks.",
  },
  {
    question: "Is my data sent to a server?",
    answer:
      "No. All <strong>encoding happens entirely in your browser</strong>. Your data never leaves your device.",
  },
  {
    question: "Which characters are never encoded?",
    answer:
      "The <strong>unreserved characters</strong> — letters (A–Z, a–z), digits (0–9), and the four symbols <strong>- _ . ~</strong> — are never percent-encoded because they are safe to use in any part of a URL without ambiguity. All other characters are candidates for encoding depending on where they appear in the URL.",
  },
  {
    question: "How do I encode a URL query parameter correctly?",
    answer:
      "Use <strong>full component encode</strong> on the <em>value</em> only, not on the entire URL. For example, if your query value is <strong>hello world &amp; more</strong>, encode it to <strong>hello%20world%20%26%20more</strong>, then append it to the URL: <strong>?q=hello%20world%20%26%20more</strong>. Encoding the whole URL with component encoding would also encode the <strong>=</strong> and <strong>&amp;</strong> separators, breaking the query string.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is URL Encoding?",
    content: `<p><strong>URL encoding</strong>, formally known as <strong>percent-encoding</strong>, is a mechanism for representing characters that are not permitted in a URL in a safe, unambiguous way. A URL can only contain a limited set of ASCII characters — letters, digits, and a few symbols. Any other character must be replaced with a <strong>% sign followed by two hexadecimal digits</strong> representing the character's byte value.</p>
<p>For example, the space character has the byte value 32, which is 20 in hexadecimal, so it is encoded as <strong>%20</strong>. The hash character (#) is encoded as <strong>%23</strong>. This transformation ensures that a URL is valid and unambiguous regardless of the system, browser, or protocol that processes it.</p>`,
  },
  {
    title: "Full Component Encode vs URI Encode",
    content: `<p>There are two common modes of URL encoding, suited to different situations:</p>
<ul>
<li><strong>Full component encode</strong> converts every character except letters, digits, and the four symbols <strong>- _ . ~</strong>. This includes structural URL characters like <strong>/ ? # &amp; =</strong>. Use this mode when encoding the <em>value</em> of a query parameter or path segment, so the value does not accidentally break the URL structure.</li>
<li><strong>URI encode</strong> converts only characters that are outright invalid in a URI, leaving safe structural characters (<strong>: / ? # &amp; = + @</strong>) as-is. Use this mode when encoding a complete, already-structured URL that needs to be made safe for embedding in another context.</li>
</ul>
<p>Applying the wrong mode is a common source of broken URLs — encoding the entire URL with full component mode will encode the slashes and question marks, rendering it non-functional.</p>`,
  },
];

export default function UrlEncodePage() {
  if (!tool) notFound();

  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <UrlEncoder />
    </ToolContainer>
  );
}
