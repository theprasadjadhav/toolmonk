import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { ApiKeyGenerator } from "@/components/tools/shared/security/ApiKeyGenerator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("api-key-generator");
const tool = TOOLS.find((t) => t.slug === "api-key-generator" && t.category === "dev-tools")!;

const howToSteps = [
  "Set the <strong>byte length</strong> (8–256) — more bytes produces a longer, harder-to-guess key with higher entropy.",
  "Choose an <strong>encoding</strong>: Hex produces a familiar hexadecimal string; Base64 URL-safe is more compact and safe for URLs; Alphanumeric avoids special characters entirely.",
  "Add an optional <strong>prefix</strong> (e.g. <code>sk_live_</code> or <code>pk_</code>) to identify the key type or environment at a glance.",
  "Set a <strong>group size and separator</strong> to break the key into readable segments (e.g. groups of 8 with a dash), which helps when keys need to be read or entered manually.",
  "Click <strong>Generate</strong> and copy individual keys or all keys at once using the copy buttons.",
];

const faqs = [
  {
    question: "How secure are the generated API keys?",
    answer:
      "Keys are generated using <strong>cryptographically secure random bytes</strong> from your browser's built-in secure random source. A 32-byte key has <strong>256 bits of entropy</strong> — computationally infeasible to brute-force with current technology.",
  },
  {
    question: "Which encoding should I choose?",
    answer:
      "<strong>Hex</strong> is the most universally supported format and easiest to recognize. <strong>Base64 URL-safe</strong> is more compact and safe to use in URLs and HTTP headers without percent-encoding. <strong>Alphanumeric</strong> avoids special characters entirely, making it safe for systems with restricted character sets.",
  },
  {
    question: "Are keys sent to any server?",
    answer:
      "No — all key generation happens <strong>entirely in your browser</strong>. The keys never leave your device.",
  },
  {
    question: "Is this tool free?",
    answer:
      "Yes — completely free with <strong>no registration required</strong>.",
  },
  {
    question: "How long should an API key be?",
    answer:
      "A minimum of <strong>16 bytes (128 bits)</strong> is recommended for most use cases. For high-security applications such as payment systems or signing keys, use <strong>32 bytes (256 bits)</strong> or more. Longer keys have more entropy and are harder to guess.",
  },
  {
    question: "What is the difference between an API key and an API secret?",
    answer:
      "An <strong>API key</strong> is a public identifier — it tells the server who is making the request. An <strong>API secret</strong> is a private credential used to sign requests or prove identity and must be kept confidential. Both should be generated with cryptographically secure randomness.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is an API Key?",
    content: `<p>An <strong>API key</strong> is a unique string used to authenticate requests to an API or web service. It acts as a credential that identifies the calling application and controls access to protected resources.</p>
<p>API keys are typically sent in HTTP request headers or as query parameters. They must be kept secret — anyone with access to a valid API key can make requests on behalf of the owner. Keys should be <strong>long, random, and unpredictable</strong> to prevent guessing or brute-force attacks.</p>`,
  },
  {
    title: "API Key Security Best Practices",
    content: `<p>Follow these practices to keep your API keys secure:</p>
<ul>
<li><strong>Never hardcode keys in source code</strong> — use environment variables or a secrets manager</li>
<li><strong>Rotate keys regularly</strong> — especially after a potential exposure</li>
<li><strong>Use different keys for different environments</strong> — separate keys for development, staging, and production</li>
<li><strong>Restrict key permissions</strong> — give each key only the access it needs (principle of least privilege)</li>
<li><strong>Monitor key usage</strong> — log API calls and set up alerts for unusual patterns</li>
<li><strong>Revoke compromised keys immediately</strong> — have a process for rapid key rotation</li>
</ul>`,
  },
  {
    title: "What is Cryptographic Entropy?",
    content: `<p><strong>Entropy</strong> measures the unpredictability of a generated value — higher entropy means harder to guess. A key's entropy in bits is determined by the number of possible values: a 32-byte key has 256 bits of entropy, meaning there are 2<sup>256</sup> possible values.</p>
<p>For comparison, brute-forcing a 128-bit key would take longer than the age of the universe with current computing power. Always use a <strong>cryptographically secure random source</strong> — not a general-purpose random number generator — for security-sensitive keys.</p>`,
  },
];

export default function ApiKeyGeneratorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <ApiKeyGenerator />
    </ToolContainer>
  );
}
