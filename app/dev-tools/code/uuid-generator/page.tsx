import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { UuidGenerator } from "@/components/tools/code/UuidGenerator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("uuid-generator");

const tool = TOOLS.find((t) => t.slug === "uuid-generator")!;

const howToSteps = [
  "Select a <strong>UUID version</strong>: use <strong>v4</strong> for a fully random identifier, or <strong>v7</strong> for a time-ordered identifier that is ideal for database primary keys.",
  "Choose <strong>how many UUIDs</strong> to generate at once — 1, 5, 10, 25, or 50.",
  "Toggle <strong>UPPER</strong> to switch between lowercase and uppercase hexadecimal output depending on your system's requirements.",
  "Click <strong>generate</strong> to produce a fresh batch of UUIDs.",
  "Click any <strong>individual UUID</strong> to copy it, or use <strong>copy all</strong> to copy the entire list to your clipboard.",
];

const faqs = [
  {
    question: "What is a UUID?",
    answer:
      "A <strong>UUID (Universally Unique Identifier)</strong> is a 128-bit identifier standardised as RFC 4122. It is represented as 32 hexadecimal digits grouped in the format <strong>xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx</strong>. UUIDs are designed to be globally unique without requiring a central authority to assign them.",
  },
  {
    question: "What is the difference between UUID v4 and v7?",
    answer:
      "<strong>UUID v4</strong> is entirely random — all bits except the version and variant markers are generated randomly. <strong>UUID v7</strong> embeds a <strong>Unix millisecond timestamp</strong> in the first 48 bits, making them naturally sortable by creation time. v7 is the modern recommendation for <strong>database primary keys</strong> because sorted UUIDs improve index performance.",
  },
  {
    question: "Are these UUIDs truly unique?",
    answer:
      "UUID v4 uses <strong>cryptographically secure random numbers</strong> from your browser's built-in randomness source, making collisions astronomically unlikely — roughly 1 in 5.3 × 10³⁶. UUID v7 adds timestamp ordering but also retains random bits, maintaining the same practical uniqueness guarantee.",
  },
  {
    question: "Is my data sent to a server?",
    answer:
      "No. All UUIDs are <strong>generated entirely in your browser</strong> using your device's built-in cryptographic random number generator. Nothing is sent to a server.",
  },
  {
    question: "When should I use UUID v4 vs v7?",
    answer:
      "Use <strong>v4</strong> when you need a random, opaque identifier and do not care about ordering — for example, session tokens, API keys, or correlation IDs. Use <strong>v7</strong> when the IDs will be used as database primary keys or need to be sorted chronologically, because the embedded timestamp keeps rows in insertion order in the index.",
  },
  {
    question: "Can UUIDs be used as database primary keys?",
    answer:
      "Yes, and this is one of the most common use cases. <strong>UUID v7</strong> is especially well-suited because its time-ordered nature prevents index fragmentation that can occur with random v4 UUIDs. Standard UUID v4 keys can cause performance issues in large tables because inserts land at random positions in the index.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is a UUID?",
    content: `<p>A <strong>UUID (Universally Unique Identifier)</strong> is a standardised 128-bit number used to uniquely identify information without requiring a central coordinator. It looks like this: <strong>550e8400-e29b-41d4-a716-446655440000</strong> — 32 hexadecimal characters split into five groups by hyphens.</p>
<p>UUIDs are generated independently on different devices and systems yet are statistically guaranteed not to collide. This makes them invaluable in distributed systems where multiple services need to create records simultaneously without checking with a shared counter. They are widely used as <strong>database primary keys, session identifiers, file names, API keys,</strong> and anywhere a unique reference is needed without coordination.</p>`,
  },
  {
    title: "UUID v4 vs UUID v7",
    content: `<p><strong>UUID v4</strong> is the most familiar version — it is entirely random. Every time you generate one, the output is unpredictable and has no relationship to when it was created. This is ideal for security-sensitive identifiers like tokens and API keys.</p>
<p><strong>UUID v7</strong> is a newer standard that embeds the current timestamp in the first part of the UUID. This means v7 UUIDs generated later will always sort after earlier ones, which matters greatly for databases. When primary keys are <strong>monotonically increasing</strong>, new rows are always appended to the end of the index tree rather than inserted at random positions, dramatically improving write performance at scale.</p>`,
  },
];

export default function UuidGeneratorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <UuidGenerator />
    </ToolContainer>
  );
}
