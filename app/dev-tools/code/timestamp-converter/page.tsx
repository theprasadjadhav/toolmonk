import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { TimestampConverter } from "@/components/tools/code/TimestampConverter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("timestamp-converter");

const tool = TOOLS.find((t) => t.slug === "timestamp-converter" && t.category === "dev-tools")!;

const howToSteps = [
  "Paste any <strong>Unix timestamp</strong> (in seconds or milliseconds), an <strong>ISO 8601 date string</strong>, or a natural language date like <strong>Jan 15 2024</strong> into the text field.",
  "Or pick a date and time directly from the <strong>calendar picker</strong> below — both the text input and the picker stay in sync with each other.",
  "Click <strong>Use now</strong> to instantly load the current date and time.",
  "All <strong>12 output formats</strong> appear immediately — including Unix seconds, milliseconds, ISO 8601, UTC string, locale format, day of week, ISO week number, and relative time.",
  "Click <strong>copy</strong> on any output row to copy that specific value to your clipboard.",
];

const faqs = [
  {
    question: "What input formats are accepted?",
    answer:
      "The text field accepts <strong>Unix timestamps</strong> (seconds or milliseconds), <strong>ISO 8601 strings</strong> (e.g. 2024-01-15T10:00:00Z), RFC 2822 strings, and most natural language formats such as <strong>'Jan 15 2024'</strong> or <strong>'15 January 2024 10:00'</strong>.",
  },
  {
    question: "How does seconds vs milliseconds auto-detection work?",
    answer:
      "If the numeric input is greater than <strong>10,000,000,000 (10¹⁰)</strong> it is treated as <strong>milliseconds</strong>; otherwise it is treated as <strong>seconds</strong>. This threshold reliably covers all valid Unix timestamps from late 2001 onward.",
  },
  {
    question: "What is a Unix timestamp?",
    answer:
      "A <strong>Unix timestamp</strong> is the number of seconds (or milliseconds) that have elapsed since <strong>January 1, 1970 at 00:00:00 UTC</strong> — known as the Unix Epoch. It is <strong>timezone-independent</strong> and used widely in APIs, databases, log files, and system clocks because it is a simple integer with no ambiguity.",
  },
  {
    question: "Is the local time shown in my timezone?",
    answer:
      "Yes. The <strong>date-only, time-only, locale date-time, day of week,</strong> and <strong>relative</strong> outputs all use your <strong>browser's local timezone</strong>. The <strong>ISO 8601 (UTC), UTC string,</strong> and <strong>locale (UTC)</strong> outputs are always in UTC regardless of your location.",
  },
  {
    question: "What is ISO 8601 format?",
    answer:
      "<strong>ISO 8601</strong> is an international standard for representing dates and times as text. The most common form looks like <strong>2024-01-15T10:30:00Z</strong> — year, month, day, the letter T as a separator, hour, minute, second, and Z for UTC. It is unambiguous, sortable alphabetically, and universally supported by date parsing tools.",
  },
  {
    question: "Why do developers use Unix timestamps instead of date strings?",
    answer:
      "Unix timestamps are <strong>timezone-neutral integers</strong>, making them easy to store, compare, and sort without worrying about locale differences or daylight saving time. They are compact, require no parsing, and are supported by virtually every programming language and database system.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is a Unix Timestamp?",
    content: `<p>A <strong>Unix timestamp</strong> is a single integer representing the number of seconds that have passed since <strong>January 1, 1970, at midnight UTC</strong> — a reference point known as the <strong>Unix Epoch</strong>. For example, the timestamp <strong>1705312800</strong> represents January 15, 2024, at 10:00 AM UTC.</p>
<p>Because it is just a number, a Unix timestamp is <strong>timezone-independent</strong> and completely unambiguous — unlike a string like "3/4/2024", which could mean March 4th or April 3rd depending on the locale. This simplicity makes Unix timestamps the standard format in APIs, log files, databases, and system programming worldwide.</p>`,
  },
  {
    title: "Common Timestamp Formats Explained",
    content: `<ul>
<li><strong>Unix seconds:</strong> A 10-digit integer counting seconds since the Epoch (e.g. 1705312800). The most common form in APIs and databases.</li>
<li><strong>Unix milliseconds:</strong> A 13-digit integer — the seconds timestamp multiplied by 1000. Used when sub-second precision is needed.</li>
<li><strong>ISO 8601:</strong> A human-readable international standard format: <strong>2024-01-15T10:00:00Z</strong>. The Z suffix means UTC.</li>
<li><strong>RFC 2822:</strong> The email and HTTP header format: <strong>Mon, 15 Jan 2024 10:00:00 +0000</strong>.</li>
<li><strong>Relative:</strong> A human description of how far the moment is from now, such as "3 days ago" or "in 2 hours".</li>
</ul>`,
  },
];

export default function TimestampConverterPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <TimestampConverter />
    </ToolContainer>
  );
}
