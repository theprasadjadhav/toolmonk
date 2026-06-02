import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { HashGenerator } from "@/components/tools/security/HashGenerator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("hash-generator");

const tool = TOOLS.find((t) => t.slug === "hash-generator")!;

const howToSteps = [
  "Type or paste your <strong>text</strong> into the input panel — the hash is generated from the exact characters you enter, including capitalization and spaces.",
  "<strong>MD5, SHA-1, SHA-256, and SHA-512</strong> hashes are generated instantly as you type, so you see all four results simultaneously.",
  "Click <strong>copy</strong> next to any algorithm to copy that specific hash to your clipboard.",
  "Use <strong>clear</strong> to reset the input field and all hash results at once.",
];

const faqs = [
  {
    question: "What is a cryptographic hash?",
    answer:
      "A <strong>cryptographic hash function</strong> takes input data of any size and produces a fixed-size output called a <strong>digest</strong>. The same input always produces the same hash, but even a single character change produces a completely different result. Hashes are <strong>one-way</strong> — you cannot reverse them to recover the original input.",
  },
  {
    question: "Which algorithm should I use?",
    answer:
      "<strong>SHA-256 or SHA-512</strong> are recommended for security-sensitive uses. <strong>SHA-1</strong> is legacy and should be avoided for new systems. <strong>MD5</strong> is suitable for checksums and non-security data integrity checks only — it has known weaknesses and should not be used for passwords or signatures.",
  },
  {
    question: "What are common uses for hashes?",
    answer:
      "Verifying <strong>file integrity</strong> (checksums), storing <strong>passwords</strong> (with salting and a slow hash function), <strong>digital signatures</strong>, data deduplication, cache keys, and generating deterministic unique identifiers.",
  },
  {
    question: "Is my data sent to a server?",
    answer:
      "No. All hashing happens <strong>locally in your browser</strong> — your data never leaves your device.",
  },
  {
    question: "Why shouldn't I use MD5 for passwords?",
    answer:
      "MD5 has known <strong>collision vulnerabilities</strong> — two different inputs can produce the same hash — and it is extremely fast, which makes it easy to brute-force. For password storage, use a purpose-built slow hashing function designed to resist brute-force attacks.",
  },
  {
    question: "What does the hash length tell me?",
    answer:
      "The hash length reflects the algorithm's output size: <strong>MD5</strong> produces 128 bits (32 hex characters), <strong>SHA-1</strong> produces 160 bits (40 hex characters), <strong>SHA-256</strong> produces 256 bits (64 hex characters), and <strong>SHA-512</strong> produces 512 bits (128 hex characters). Longer hashes have more bits and are harder to attack.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is a Cryptographic Hash?",
    content: `<p>A <strong>cryptographic hash function</strong> converts data of any length into a fixed-size string called a <strong>digest</strong> or <strong>hash</strong>. Hash functions have three key properties:</p>
<ul>
<li><strong>Deterministic:</strong> The same input always produces the same output</li>
<li><strong>One-way:</strong> It is computationally infeasible to reverse the hash to recover the original input</li>
<li><strong>Avalanche effect:</strong> Even a tiny change in the input produces a completely different hash</li>
</ul>
<p>These properties make hashes useful for data integrity verification, password storage, and digital signatures.</p>`,
  },
  {
    title: "Hash Algorithms Compared",
    content: `<p>Different hash algorithms offer different trade-offs between speed, output size, and security strength:</p>
<ul>
<li><strong>MD5</strong> (128-bit): Fast and widely used for checksums, but has known collision vulnerabilities — not suitable for security applications</li>
<li><strong>SHA-1</strong> (160-bit): Stronger than MD5 but also deprecated for security use due to known weaknesses</li>
<li><strong>SHA-256</strong> (256-bit): Current standard for general security use — strong, widely supported, and recommended for most applications</li>
<li><strong>SHA-512</strong> (512-bit): Larger output with more security margin — used where maximum collision resistance is needed</li>
</ul>`,
  },
  {
    title: "Common Use Cases for Hashing",
    content: `<p>Cryptographic hashes are used throughout computing:</p>
<ul>
<li><strong>File integrity:</strong> Download sites publish a hash so you can verify a downloaded file was not tampered with</li>
<li><strong>Password storage:</strong> Systems store a hash of the password, not the password itself, to limit damage from data breaches</li>
<li><strong>Digital signatures:</strong> A hash of a document is signed, then verified using the sender's public key</li>
<li><strong>Content addressing:</strong> Hashes uniquely identify content, enabling deduplication and caching</li>
<li><strong>Data deduplication:</strong> Two identical files produce identical hashes, making it easy to detect duplicates</li>
</ul>`,
  },
];

export default function HashGeneratorPage() {
  if (!tool) notFound();

  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <HashGenerator />
    </ToolContainer>
  );
}
