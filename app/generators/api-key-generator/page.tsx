import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { ApiKeyGenerator } from "@/components/tools/generators/ApiKeyGenerator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("api-key-generator");

const tool = TOOLS.find((t) => t.slug === "api-key-generator")!;

const howToSteps = [
  "Set the <strong>byte length</strong> (8–256) — more bytes means a longer key with more possible values, making it significantly harder to guess or brute-force.",
  "Choose an <strong>encoding format</strong>: Hex produces a string of hexadecimal characters; Base64 URL-safe is more compact and safe in URLs and headers; Alphanumeric avoids special characters entirely.",
  "Add an optional <strong>prefix</strong> (e.g., <strong>sk_live_</strong> or <strong>pk_test_</strong>) to identify the key type at a glance — this is a common convention used by many API platforms.",
  "Set a <strong>group size and separator</strong> to break the key into readable chunks (e.g., groups of 8 separated by <strong>-</strong>) for easier visual comparison and manual entry.",
  "Click <strong>Generate</strong> and use the copy buttons to copy individual keys or the entire batch at once.",
];

const faqs = [
  {
    question: "How secure are the generated API keys?",
    answer:
      "Keys are generated using <strong>cryptographically secure random bytes</strong> from your device's hardware random number generator. A 32-byte key has 256 bits of entropy — the number of possible keys is so large that guessing one is computationally infeasible.",
  },
  {
    question: "Which encoding should I choose?",
    answer:
      "<strong>Hex</strong> is the most universally supported format and produces a string of digits 0-9 and letters a-f. <strong>Base64 URL-safe</strong> is more compact (shorter keys for the same entropy) and safe to use directly in URLs and HTTP headers without percent-encoding. <strong>Alphanumeric</strong> avoids all special characters, making keys easier to type manually.",
  },
  {
    question: "Are keys sent to any server?",
    answer:
      "No — all key generation happens entirely in your <strong>browser</strong>. The keys never leave your device.",
  },
  {
    question: "What byte length should I use?",
    answer:
      "For most API authentication purposes, <strong>32 bytes (256 bits)</strong> provides an excellent balance of security and practicality. Use 16 bytes for low-sensitivity uses and 64 bytes or more for high-security or long-lived credentials.",
  },
  {
    question: "Is this tool free?",
    answer: "Yes — completely free with no registration required.",
  },
  {
    question: "Should I use a prefix for my API keys?",
    answer:
      "Yes — prefixes are a <strong>best practice</strong> popularized by services like Stripe and GitHub. A prefix like <strong>sk_live_</strong> or <strong>pk_test_</strong> instantly identifies the key type and environment at a glance, making it harder to accidentally use the wrong key.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is an API Key?",
    content: `<p>An <strong>API key</strong> is a long, random string used to authenticate requests made to an application programming interface (API). When a client application sends a request to a service, it includes the API key to prove its identity and authorization. The server checks the key against its records before processing the request.</p><p>API keys are different from passwords — they are typically longer, purely random, and not tied to a human-readable identity. They are designed to be included in code, configuration files, or HTTP headers rather than typed by a human.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>API keys are used in countless software and business contexts:</p><ul><li><strong>Service authentication:</strong> Identify which application or user is making requests to your API to control access and rate limits.</li><li><strong>Webhook secrets:</strong> Validate that incoming webhook requests genuinely come from a trusted source.</li><li><strong>Configuration tokens:</strong> Secure access to internal services, dashboards, or admin interfaces.</li><li><strong>Testing environments:</strong> Generate separate keys for development, staging, and production to prevent cross-environment interference.</li></ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>To use API keys safely and effectively:</p><ul><li>Use a minimum of <strong>32 bytes</strong> for keys intended to secure sensitive resources.</li><li>Never embed API keys directly in <strong>public source code</strong> — use environment variables or a secrets manager instead.</li><li>Rotate keys <strong>periodically</strong> or immediately if you suspect a key has been exposed.</li><li>Use descriptive <strong>prefixes</strong> to distinguish key types (live vs. test, read vs. write) and avoid using the wrong key in the wrong context.</li><li>Store generated keys securely — they cannot be recovered if lost.</li></ul>`,
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
