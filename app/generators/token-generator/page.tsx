import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { TokenGenerator } from "@/components/tools/generators/TokenGenerator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("token-generator");

const tool = TOOLS.find((t) => t.slug === "token-generator" && t.category === "generators")!;

const howToSteps = [
  "Select the <strong>token type</strong> that matches your use case: UUID v4 for standard unique identifiers, Hex for compact random bytes, Base64 or Base64 URL-safe for compact tokens safe in headers, or Alphanumeric for symbol-free tokens.",
  "Set the <strong>byte length</strong> to control the amount of random data in each token. More bytes means more entropy and a longer output string. UUID v4 is always 16 bytes.",
  "Choose how many <strong>tokens to generate</strong> at once (1–100). Generate a batch when you need multiple unique tokens in one step.",
  "Click <strong>Generate</strong> and use the copy buttons to copy individual tokens or the full list at once.",
];

const faqs = [
  {
    question: "What is a UUID v4?",
    answer:
      "<strong>UUID v4</strong> is a randomly generated universally unique identifier in the standard 8-4-4-4-12 hexadecimal format (e.g., 550e8400-e29b-41d4-a716-446655440000). It is the most widely used format for unique record IDs in databases and APIs.",
  },
  {
    question: "What is the difference between Base64 and Base64 URL-safe?",
    answer:
      "<strong>Standard Base64</strong> uses <strong>+</strong> and <strong>/</strong> characters which must be percent-encoded in URLs. <strong>Base64 URL-safe</strong> replaces + with - and / with _, and removes padding =, making it safe to use directly in URLs, authorization headers, and signed tokens without any encoding.",
  },
  {
    question: "How is the randomness generated?",
    answer:
      "All tokens are generated using <strong>cryptographically secure randomness</strong> from your device's hardware — the same source used for cryptographic operations. Nothing is sent to any server.",
  },
  {
    question: "What is the difference between a token and an API key?",
    answer:
      "The terms are often used interchangeably. A <strong>token</strong> typically refers to a short-lived credential used to prove identity or authorization (like a session token or access token). An <strong>API key</strong> is usually a longer-lived credential that identifies an application or account. Both are random strings at their core.",
  },
  {
    question: "Is this tool free?",
    answer: "Yes — completely free with no registration required.",
  },
  {
    question: "How many bytes do I need for a secure token?",
    answer:
      "For most authentication and session use cases, <strong>32 bytes</strong> (256 bits of entropy) is the standard recommendation. This produces a sufficiently large space of possible values that brute-forcing is computationally infeasible.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is a Security Token?",
    content: `<p>A <strong>security token</strong> is a random, high-entropy string used as a credential or identifier in digital systems. Tokens are used to prove identity, authorize actions, or uniquely identify records — without relying on guessable information like usernames or sequential numbers.</p><p>Tokens are fundamentally different from passwords: they are not chosen by a human, are typically longer and more random, and are often used in machine-to-machine communication rather than human login. Their security depends entirely on their unpredictability — which is why they must be generated from a cryptographically secure source.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Tokens are used in many layers of modern software and security:</p><ul><li><strong>Session tokens:</strong> Identify an authenticated user's session after login, without transmitting the password on each request.</li><li><strong>Access tokens:</strong> Grant temporary, scoped permission to access a resource or API endpoint.</li><li><strong>Email verification:</strong> Send a unique token to confirm an email address or complete a password reset.</li><li><strong>CSRF protection:</strong> Embed a unique token in forms to prevent cross-site request forgery attacks.</li><li><strong>Database primary keys:</strong> Use UUID or random tokens as globally unique, non-sequential record identifiers.</li></ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>To choose the right token type and size for your use case:</p><ul><li>Use <strong>UUID v4</strong> when you need a standard, widely-recognized format for database IDs or API resources.</li><li>Use <strong>Base64 URL-safe</strong> for tokens that will appear in URLs, authorization headers, or signed credential strings.</li><li>Use <strong>Hex</strong> when a compact, all-lowercase alphanumeric representation is preferred for logging or debugging.</li><li>Use at least <strong>32 bytes</strong> for any token used in authentication or authorization flows.</li><li>Never reuse tokens — generate a fresh token for each session, request, or credential issuance.</li></ul>`,
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
