import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { UrlEncoder } from "@/components/tools/shared/text/UrlEncoder";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("url-encode");
const tool = TOOLS.find((t) => t.slug === "url-encode" && t.category === "seo-tools")!;

const howToSteps = [
  "Type or paste the <strong>text or URL</strong> you want to encode into the input panel — this can be a query parameter value, a full URL, or any plain text containing special characters.",
  "The <strong>URL-encoded output</strong> appears instantly in the right panel as each unsafe character is converted to its percent-encoded form.",
  "Choose <strong>encodeURIComponent</strong> to encode all special characters including reserved ones — use this for individual query parameter values.",
  "Choose <strong>encodeURI</strong> to encode only characters that are invalid in a URI, preserving structural characters like :, /, ?, #, and &.",
  "Click <strong>copy</strong> to copy the encoded result to your clipboard, or <strong>clear</strong> to reset both panels.",
];

const faqs = [
  {
    question: "What is URL encoding?",
    answer:
      "<strong>URL encoding</strong> (also called percent-encoding) converts characters that are not safe in a URL into a <strong>% followed by their two-digit hexadecimal code</strong>. For example, a space becomes %20 and & becomes %26. This ensures URLs are valid and can be transmitted reliably across different systems.",
  },
  {
    question: "What is the difference between encodeURIComponent and encodeURI?",
    answer:
      "<strong>encodeURIComponent</strong> encodes everything except unreserved characters (letters, digits, -, _, ., ~). Use it for encoding <strong>individual query parameter values</strong> that might contain &, =, ?, or # characters. <strong>encodeURI</strong> preserves characters that are valid URI components like :, /, ?, #, and &, making it suitable for encoding a complete URL.",
  },
  {
    question: "When should I use URL encoding?",
    answer:
      "Use URL encoding whenever you include <strong>user-generated text</strong>, query parameters, or special characters in a URL. This prevents broken links, ensures special characters are transmitted correctly, and avoids potential issues where URL structure characters are misread as part of the data.",
  },
  {
    question: "Is my data sent to a server?",
    answer:
      "No. All encoding happens <strong>entirely in your browser</strong>. Your data never leaves your device and is not stored or transmitted anywhere.",
  },
  {
    question: "What characters are safe in a URL without encoding?",
    answer:
      "The <strong>unreserved characters</strong> — uppercase and lowercase letters (A–Z, a–z), digits (0–9), hyphen (-), underscore (_), period (.), and tilde (~) — are safe to use in a URL without encoding. Everything else must be percent-encoded to be treated as literal data.",
  },
  {
    question: "Why does a space sometimes appear as + instead of %20?",
    answer:
      "In <strong>HTML form data</strong> encoded as application/x-www-form-urlencoded, spaces are conventionally represented as + rather than %20. In standard URL percent-encoding, %20 is the correct representation. This tool uses the standard percent-encoding convention.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is URL Encoding?",
    content: `<p><strong>URL encoding</strong> (percent-encoding) is the standard method for representing characters that are not allowed or not safe in a URL. Each unsafe character is replaced by a <strong>%</strong> sign followed by the character's two-digit hexadecimal code. For example, a space becomes %20, the # symbol becomes %23, and the @ sign becomes %40.</p><p>URLs are restricted to a specific set of printable ASCII characters. Any character outside this set — including spaces, punctuation, accented letters, and non-Latin scripts — must be encoded before being included in a URL.</p>`,
  },
  {
    title: "Why URL Encoding Matters",
    content: `<p>Including unencoded special characters in a URL can cause <strong>broken links</strong>, incorrect data interpretation, and security vulnerabilities. For example, an unencoded & in a query parameter value would be mistaken for a parameter separator, corrupting the data being passed.</p><p>Proper URL encoding ensures that query parameters contain exactly the data you intend, that links remain valid across different browsers and servers, and that user-submitted data cannot be used to manipulate URL structure.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul><li><strong>Query string parameters:</strong> Encode search terms, form values, and filters before appending them to a URL.</li><li><strong>Redirect URLs:</strong> Encode destination URLs when passing them as a parameter in a redirect or tracking link.</li><li><strong>API requests:</strong> Encode parameter values containing special characters before building request URLs.</li><li><strong>Link building:</strong> Ensure URLs with non-ASCII characters (such as accented names or non-Latin domains) are correctly encoded for sharing.</li></ul>`,
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
