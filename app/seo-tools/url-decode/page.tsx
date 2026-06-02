import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { UrlDecoder } from "@/components/tools/shared/text/UrlDecoder";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("url-decode");
const tool = TOOLS.find((t) => t.slug === "url-decode" && t.category === "seo-tools")!;

const howToSteps = [
  "Paste your <strong>URL-encoded string</strong> into the input panel on the left — this could be a full URL or just a query parameter value.",
  "The <strong>decoded output</strong> appears instantly in the right panel as each percent-encoded sequence is converted back to its original character.",
  "Choose <strong>decodeURIComponent</strong> to decode all percent-encoded characters including reserved ones like /, ?, and &.",
  "Choose <strong>decodeURI</strong> to decode a full URI while keeping <strong>reserved characters</strong> such as :, /, ?, and # intact.",
  "Click <strong>copy</strong> to copy the decoded result to your clipboard, or <strong>clear</strong> to reset both panels.",
];

const faqs = [
  {
    question: "What is URL decoding?",
    answer:
      "<strong>URL decoding</strong> converts percent-encoded characters back to their original readable form. For example, <strong>%20</strong> becomes a space, <strong>%26</strong> becomes &, and <strong>%3D</strong> becomes =. It reverses the process used to make text safe for inclusion in a URL.",
  },
  {
    question: "What is the difference between decodeURIComponent and decodeURI?",
    answer:
      "<strong>decodeURIComponent</strong> decodes all percent-encoded sequences, including characters that have special meaning in a URL structure such as / and ?. <strong>decodeURI</strong> only decodes sequences that could not appear in a valid URI on their own — it leaves structural characters like %2F (/) intact.",
  },
  {
    question: "What happens if I paste an invalid encoded string?",
    answer:
      "The decoder shows an <strong>error</strong> if the input contains malformed percent-encoded sequences — for example, a % sign followed by non-hexadecimal characters. Fix the input and the decoded output will update automatically.",
  },
  {
    question: "Is my data sent to a server?",
    answer:
      "No. All decoding happens <strong>entirely in your browser</strong>. Your data never leaves your device and is not stored or transmitted anywhere.",
  },
  {
    question: "When would I need to decode a URL?",
    answer:
      "Common situations include reading <strong>query parameters</strong> in analytics logs or debugging tools, interpreting redirect URLs passed as parameters, understanding encoded form submissions, and verifying that a URL contains the expected characters after encoding.",
  },
  {
    question: "What characters are percent-encoded in a URL?",
    answer:
      "Any character that is not a <strong>unreserved character</strong> (letters, digits, hyphen, underscore, period, tilde) must be percent-encoded in a URL. Spaces become %20, the @ symbol becomes %40, and characters outside the ASCII range (such as accented letters or emoji) are encoded as multiple percent sequences.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is URL Encoding?",
    content: `<p><strong>URL encoding</strong> (also called percent-encoding) is a method of converting characters that are not safe to use directly in a URL into a <strong>% followed by a two-digit hexadecimal code</strong>. For example, a space character — which is not valid in a URL — becomes <strong>%20</strong>, and the ampersand (&) becomes <strong>%26</strong>.</p><p>This encoding is necessary because URLs can only contain a limited set of ASCII characters. Any character outside that set must be encoded before it can be safely included in a web address.</p>`,
  },
  {
    title: "Why URL Decoding Matters",
    content: `<p>Encoded URLs are often difficult for humans to read at a glance. When debugging web applications, analysing server logs, or investigating redirect chains, <strong>decoding</strong> the URL restores it to its original readable form so you can understand exactly what data is being passed.</p><p>URL decoding is also essential when working with <strong>query string parameters</strong> — values passed in a URL after the ? character. These are frequently encoded when they come from user input and must be decoded to be processed correctly.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul><li><strong>Debugging redirects:</strong> Decode redirect destination URLs that appear as encoded parameters in tracking links.</li><li><strong>Reading analytics data:</strong> Decode query strings in server logs to understand what search terms or filters users submitted.</li><li><strong>API development:</strong> Decode incoming request parameters to verify that special characters were received correctly.</li><li><strong>Link inspection:</strong> Decode shortened or obfuscated URLs to verify their actual destination before clicking.</li></ul>`,
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
