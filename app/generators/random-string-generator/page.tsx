import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { RandomStringGenerator } from "@/components/tools/generators/RandomStringGenerator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("random-string-generator");

const tool = TOOLS.find((t) => t.slug === "random-string-generator")!;

const howToSteps = [
  "Set the <strong>string length</strong> (1–512 characters). Longer strings have more possible values and are suitable for security-sensitive identifiers.",
  "Choose how many <strong>strings to generate</strong> at once (1–100). Generating a batch is useful when you need a set of unique identifiers at the same time.",
  "Enable one or more <strong>character sets</strong>: lowercase letters, uppercase letters, digits, symbols, or hex-only. The combined set of enabled characters is the pool from which each character is drawn.",
  "Add any <strong>custom characters</strong> you want included in or excluded from the pool for specific formatting requirements.",
  "Click <strong>Generate</strong> and use the copy buttons to copy individual strings or the full batch at once.",
];

const faqs = [
  {
    question: "What can I use random strings for?",
    answer:
      "Random strings are useful for <strong>test data, unique identifiers, session tokens, nonces, file names, and verification codes</strong>. They are the building block for many types of generated credentials and IDs.",
  },
  {
    question: "Can I use custom characters?",
    answer:
      "Yes — enter any characters in the <strong>custom field</strong> and they will be added to the character pool alongside the selected presets. This lets you include special characters or restrict the pool to a specific subset.",
  },
  {
    question: "How is the randomness generated?",
    answer:
      "Strings are generated using <strong>cryptographically secure randomness</strong> from your device's hardware. Nothing is sent to any server — generation happens entirely in your browser.",
  },
  {
    question: "What is the difference between random strings and passwords?",
    answer:
      "Functionally they are similar — both are random character sequences. <strong>Passwords</strong> are intended for human authentication and are often subject to composition rules. <strong>Random strings</strong> are typically used in code as identifiers, tokens, or keys, with more flexibility in character set and format.",
  },
  {
    question: "Is this tool free?",
    answer: "Yes — completely free with no registration required.",
  },
  {
    question: "How long should a random string identifier be?",
    answer:
      "For most non-security uses (test IDs, slugs, file names), <strong>8–16 characters</strong> of alphanumeric characters provides sufficient uniqueness. For security-sensitive tokens (session IDs, API keys), use at least <strong>32 characters</strong> from a broad character set.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is a Random String?",
    content: `<p>A <strong>random string</strong> is a sequence of characters drawn randomly from a defined character pool. Each character is selected independently, with every character in the pool having an equal chance of appearing in any position.</p><p>The unpredictability and uniqueness of random strings make them valuable for generating identifiers, tokens, and codes that cannot be guessed or predicted. The longer the string and the larger the character pool, the greater the number of possible values — and the lower the chance of two generated strings being identical.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Random strings serve as the foundation for many types of generated values:</p><ul><li><strong>Session tokens:</strong> Unique, unpredictable strings that identify a user's active session without exposing account credentials.</li><li><strong>Verification codes:</strong> Short random strings sent to verify email addresses, phone numbers, or ownership.</li><li><strong>Test data:</strong> Populate database tables or form fields with realistic random identifiers for development and testing.</li><li><strong>Nonces:</strong> Single-use random strings that prevent replay attacks in security protocols.</li><li><strong>Unique file names:</strong> Avoid naming conflicts by generating random names for uploaded or generated files.</li></ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>To generate effective random strings for your use case:</p><ul><li>Use the <strong>alphanumeric</strong> preset when the string will be used in URLs, file names, or environments where symbols may cause issues.</li><li>Use <strong>hex only</strong> mode when the output needs to be a valid hexadecimal representation — for example, color codes or hash-like identifiers.</li><li>For security-sensitive tokens, use a length of at least <strong>32 characters</strong> with a broad character set to maximize entropy.</li><li>Avoid using the same string twice — generate a <strong>fresh batch</strong> each time rather than reusing previously generated strings.</li></ul>`,
  },
];

export default function RandomStringGeneratorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <RandomStringGenerator />
    </ToolContainer>
  );
}
