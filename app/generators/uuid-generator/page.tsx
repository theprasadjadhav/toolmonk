import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { UuidGenerator } from "@/components/tools/shared/generators/UuidGenerator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("uuid-generator");
const tool = TOOLS.find((t) => t.slug === "uuid-generator" && t.category === "generators")!;

const howToSteps = [
  "Select the <strong>UUID version</strong>: v4 (fully random) is the most widely supported; v7 (time-ordered) is ideal when you need UUIDs that sort chronologically, such as database primary keys.",
  "Choose how many <strong>UUIDs to generate</strong> — 1, 5, 10, 25, or 50. Generate a batch when you need multiple unique IDs in one step.",
  "Toggle <strong>UPPER</strong> to switch between lowercase and uppercase hex output. Both are valid UUID representations — lowercase is more common in modern systems.",
  "Click <strong>Generate</strong> to produce a fresh set of UUIDs.",
  "Click any <strong>individual UUID</strong> to copy it, or use <strong>Copy All</strong> to copy the complete list to your clipboard.",
];

const faqs = [
  {
    question: "What is a UUID?",
    answer:
      "A <strong>UUID (Universally Unique Identifier)</strong> is a 128-bit identifier represented as 32 hexadecimal digits in the format xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx. UUIDs are designed to be globally unique without requiring a central registry or coordination between systems.",
  },
  {
    question: "What is the difference between UUID v4 and v7?",
    answer:
      "<strong>UUID v4</strong> is fully random — all bits except version and variant markers are random. <strong>UUID v7</strong> embeds a Unix millisecond timestamp in the first 48 bits, making UUIDs generated in sequence monotonically increasing and sortable by creation time. v7 is the modern recommendation for database primary keys because it improves index performance.",
  },
  {
    question: "Are these UUIDs truly unique?",
    answer:
      "<strong>UUID v4</strong> uses cryptographically random values, making the probability of a collision astronomically small — approximately 1 in 5.3 × 10^36. In practice, duplicate UUIDs are not a concern in any real-world application.",
  },
  {
    question: "Is my data sent to a server?",
    answer:
      "No. All UUIDs are generated <strong>entirely in your browser</strong> using your device's built-in cryptographic APIs. Nothing is sent to any server.",
  },
  {
    question: "Can I use UUID v7 as a database primary key?",
    answer:
      "Yes — <strong>UUID v7</strong> is specifically designed for this use case. Because the timestamp prefix ensures new UUIDs sort after older ones, they insert at the end of database indexes rather than in random positions. This avoids the index fragmentation and poor write performance that UUID v4 can cause in large tables.",
  },
  {
    question: "What is the standard UUID format?",
    answer:
      "The standard format is <strong>xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx</strong> — 32 hexadecimal characters divided into five groups by hyphens. This format (lowercase) is the most widely used. The tool also supports uppercase output for systems that require it.",
  },
  {
    question: "Can I use UUIDs as file names?",
    answer:
      "Yes — UUIDs make excellent file names for uploaded or generated files because they are unique, don't contain characters that are problematic in file systems, and carry no sensitive information about the content.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is a UUID?",
    content: `<p>A <strong>UUID (Universally Unique Identifier)</strong> is a standardized 128-bit number used to identify information in computer systems. It is represented as a string of 32 hexadecimal characters separated by hyphens in the format <strong>xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx</strong>.</p><p>UUIDs are designed to be globally unique without requiring a central authority or coordination between different systems. Any system anywhere in the world can generate a UUID independently and have extremely high confidence that the value is unique — a property that makes them ideal for distributed databases, microservices, and any system where records are created in multiple places.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>UUIDs are fundamental building blocks in software and data systems:</p><ul><li><strong>Database primary keys:</strong> Use UUIDs instead of sequential integers when records are created across multiple systems, servers, or regions that can't coordinate a single counter.</li><li><strong>API resource identifiers:</strong> Expose UUIDs in API endpoints to identify resources without revealing their sequential order or total count.</li><li><strong>File and object naming:</strong> Use UUIDs as names for uploaded files, generated assets, or temporary objects to avoid naming conflicts.</li><li><strong>Idempotency keys:</strong> Include a UUID with each request to allow servers to safely deduplicate repeated submissions.</li><li><strong>Correlation IDs:</strong> Attach a UUID to each request flowing through a distributed system to trace the full path through logs.</li></ul>`,
  },
  {
    title: "UUID v4 vs UUID v7 — Which Should You Use?",
    content: `<p><strong>UUID v4</strong> is the most widely supported version and is suitable for the vast majority of use cases. Its values are fully random, which means they do not reveal any information about when or where they were created.</p><p><strong>UUID v7</strong> is a newer version that includes a millisecond-precision timestamp in the first 48 bits. This makes v7 UUIDs time-sortable — a list of v7 UUIDs sorts chronologically, and new UUIDs always sort after older ones. For database primary keys, this property significantly reduces index fragmentation and improves write performance in large tables. If you are using UUIDs as database keys and performance matters, <strong>v7 is the recommended choice</strong>.</p>`,
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
