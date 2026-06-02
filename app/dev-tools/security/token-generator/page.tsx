import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { TokenGenerator } from "@/components/tools/shared/security/TokenGenerator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("token-generator");
const tool = TOOLS.find((t) => t.slug === "token-generator" && t.category === "dev-tools")!;

const howToSteps = [
  "Select the <strong>token type</strong>: UUID v4 for standard unique identifiers, Hex for raw random bytes in hex, Base64 for compact encoding, Base64 URL-safe for use in URLs, or Alphanumeric for systems that restrict special characters.",
  "Set the <strong>byte length</strong> (ignored for UUID v4, which is always 16 bytes) — more bytes means more entropy and a longer, harder-to-guess token.",
  "Choose <strong>how many tokens</strong> to generate at once (1–100) to create a batch for bulk use.",
  "Click <strong>Generate</strong> and copy individual tokens with the copy icon, or copy all tokens at once.",
];

const faqs = [
  {
    question: "What is a UUID v4?",
    answer:
      "<strong>UUID v4</strong> is a randomly generated universally unique identifier in the standard <code>8-4-4-4-12</code> hex format (e.g. <code>550e8400-e29b-41d4-a716-446655440000</code>). It is the most widely used format for <strong>unique IDs in databases and APIs</strong> due to its standardized format and broad platform support.",
  },
  {
    question: "What is the difference between Base64 and Base64 URL-safe?",
    answer:
      "Standard <strong>Base64</strong> uses <code>+</code> and <code>/</code> characters which must be percent-encoded in URLs. <strong>Base64 URL-safe</strong> replaces <code>+</code> with <code>-</code> and <code>/</code> with <code>_</code>, and removes padding <code>=</code>, making it safe to use directly in URLs, tokens, and HTTP headers.",
  },
  {
    question: "How is the randomness generated?",
    answer:
      "All tokens are generated using a <strong>cryptographically secure random source</strong> built into your browser. Nothing is sent to any server — generation happens entirely on your device.",
  },
  {
    question: "Is this tool free?",
    answer:
      "Yes — completely free with <strong>no registration required</strong>.",
  },
  {
    question: "When should I use Hex vs Base64?",
    answer:
      "<strong>Hex</strong> is the most human-readable and universally recognized format — ideal for checksums, identifiers, and debugging. <strong>Base64</strong> is more compact (roughly 33% shorter than hex for the same bytes) and is widely used for binary data in text-based protocols. <strong>Base64 URL-safe</strong> is preferred for tokens used in URLs or HTTP headers.",
  },
  {
    question: "What is the difference between a token and a UUID?",
    answer:
      "A <strong>UUID</strong> is a standardized format (8-4-4-4-12 hex) designed for globally unique identifiers across systems. A <strong>token</strong> is a more general term for any random string used for authentication, session management, or identification — it can be any encoding and length that suits your system's requirements.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is a Secure Token?",
    content: `<p>A <strong>secure token</strong> is a randomly generated string used to represent identity, authorize actions, or identify resources without revealing sensitive information. Tokens are used everywhere in modern systems: session IDs, password reset links, API keys, CSRF protection, and one-time codes.</p>
<p>Security depends entirely on <strong>unpredictability</strong> — a token generated with a cryptographically secure random source cannot be guessed or predicted by an attacker, even if they know the format.</p>`,
  },
  {
    title: "Token Formats Compared",
    content: `<p>Different token formats suit different use cases:</p>
<ul>
<li><strong>UUID v4:</strong> Standardized format, widely recognized, ideal for database primary keys and distributed identifiers</li>
<li><strong>Hex:</strong> Raw bytes in hexadecimal — easy to read, universally supported, commonly used for checksums and cryptographic values</li>
<li><strong>Base64:</strong> More compact than hex, commonly used for binary data in text-based protocols</li>
<li><strong>Base64 URL-safe:</strong> Safe to use in URLs and HTTP headers without encoding — ideal for web tokens and session IDs</li>
<li><strong>Alphanumeric:</strong> No special characters — compatible with any system, safe for filenames and restricted environments</li>
</ul>`,
  },
  {
    title: "Common Use Cases for Random Tokens",
    content: `<p>Random tokens are fundamental building blocks of secure systems:</p>
<ul>
<li><strong>Session IDs:</strong> Identify authenticated user sessions without exposing credentials</li>
<li><strong>Password reset links:</strong> One-time tokens that expire after use</li>
<li><strong>CSRF tokens:</strong> Protect web forms from cross-site request forgery</li>
<li><strong>API authentication:</strong> Bearer tokens for authorizing API requests</li>
<li><strong>Database IDs:</strong> UUID v4 provides unique identifiers across distributed systems without coordination</li>
<li><strong>Email verification:</strong> Unique tokens sent to confirm ownership of an email address</li>
</ul>`,
  },
];

export default function TokenGeneratorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <TokenGenerator />
    </ToolContainer>
  );
}
