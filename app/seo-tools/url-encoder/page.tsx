import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { UrlEncoder } from "@/components/tools/shared/text/UrlEncoder";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("url-encoder");
const tool = TOOLS.find((t) => t.slug === "url-encoder")!;

const howToSteps = [
  "Choose an <strong>encoding mode</strong>: use <strong>Component</strong> mode for individual query parameter values, or <strong>Full URL</strong> mode when you want to encode a complete URL while preserving its structure.",
  "Paste or type your <strong>text</strong> into the input area — the tool accepts plain text, query values, or complete URLs.",
  "The <strong>encoded output</strong> appears instantly with all unsafe characters replaced by their percent-encoded equivalents.",
  "Click <strong>Copy</strong> to copy the result to your clipboard, ready to use in a link, form, or API request.",
];

const faqs = [
  {
    question: "What is URL encoding?",
    answer:
      "<strong>URL encoding</strong> (percent-encoding) replaces unsafe ASCII characters with a <strong>%</strong> followed by two hexadecimal digits. For example, a space becomes %20 and the # symbol becomes %23. It ensures URLs are valid and safe to transmit across different networks and browsers.",
  },
  {
    question: "When should I use Component mode?",
    answer:
      "Use <strong>Component mode</strong> when encoding a <strong>value</strong> that will appear inside a URL query string — for example, a search term or a value that might contain &, =, ?, or # characters. It encodes these structural characters so they are treated as literal data and do not break the URL.",
  },
  {
    question: "When should I use Full URL mode?",
    answer:
      "Use <strong>Full URL mode</strong> when you have a complete URL and want to encode only the characters that are invalid (like spaces) while <strong>preserving the URL structure</strong> — including ://, ?, &, =, #, and /.",
  },
  {
    question: "What characters are not encoded in Component mode?",
    answer:
      "Only <strong>unreserved characters</strong> are left as-is: A–Z, a–z, 0–9, hyphen (-), underscore (_), period (.), and tilde (~). Everything else — including spaces, symbols, and non-ASCII characters — is percent-encoded.",
  },
  {
    question: "Is my data sent to a server?",
    answer:
      "No. All encoding happens <strong>entirely in your browser</strong>. Your input is not transmitted anywhere — it never leaves your device.",
  },
  {
    question: "Why do some URLs contain both encoded and unencoded characters?",
    answer:
      "This is intentional. A URL has both a <strong>structure</strong> (the ://, /, ?, &, = characters that define its format) and <strong>data values</strong> (the actual parameters and paths). Structure characters are left unencoded in a full URL; only the data values need encoding. Component mode encodes everything, which is why it is used for values rather than complete URLs.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is URL Encoding?",
    content: `<p><strong>URL encoding</strong> converts characters that are not safe for use in a URL into a percent-encoded format — a <strong>%</strong> sign followed by a two-character hexadecimal code representing the character's value. A space becomes %20, the ampersand (&) becomes %26, and the equals sign (=) becomes %3D.</p><p>This encoding is required because URLs are restricted to a specific subset of ASCII characters. Any character outside that safe set must be encoded to ensure the URL is interpreted correctly by all browsers and servers.</p>`,
  },
  {
    title: "Component vs. Full URL Encoding",
    content: `<p>There are two common encoding scenarios. When encoding an <strong>individual value</strong> — such as a search term, a user name, or a file path that will be passed as a query parameter — you want <strong>Component encoding</strong>, which encodes all structural URL characters so they are treated as data.</p><p>When encoding a <strong>complete URL</strong> that is already structurally correct but contains unsafe characters like spaces, you want <strong>Full URL encoding</strong>, which preserves the structural characters (://, /, ?, &, =) and only encodes the truly unsafe ones.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul><li><strong>Search query parameters:</strong> Encode user-typed search terms before appending to a URL so spaces and symbols are handled correctly.</li><li><strong>Redirect destinations:</strong> Encode a destination URL when it is passed as a parameter inside another URL (e.g. ?next=https%3A%2F%2F...).</li><li><strong>File paths in URLs:</strong> Encode file names that contain spaces or special characters when building download links.</li><li><strong>Internationalised URLs:</strong> Encode URLs containing non-ASCII characters such as accented letters or non-Latin scripts for cross-platform compatibility.</li></ul>`,
  },
];

export default function UrlEncoderPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <UrlEncoder />
    </ToolContainer>
  );
}
