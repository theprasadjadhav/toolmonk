import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { DateFormatter } from "@/components/tools/date-time-tools/DateFormatter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("date-formatter");
const tool = TOOLS.find((t) => t.slug === "date-formatter")!;

const howToSteps = [
  "Select any <strong>date and time</strong> using the picker — it defaults to the current moment so you get instant results.",
  "Click <strong>'Use now'</strong> at any time to snap the input back to the exact current date and time.",
  "All <strong>15 format variants</strong> are shown instantly in the results table, covering everything from plain date strings to Unix timestamps.",
  "Click the <strong>copy button</strong> next to any format to copy that specific value to your clipboard.",
];

const faqs = [
  {
    question: "What is ISO 8601?",
    answer: "<strong>ISO 8601</strong> is an international standard for representing dates and times (e.g. 2026-04-15T14:30:00.000Z). It is the most widely supported format for data exchange, APIs, and databases because it is unambiguous and sortable as a plain string.",
  },
  {
    question: "What is the difference between Unix seconds and Unix milliseconds?",
    answer: "<strong>Unix time</strong> (also called epoch time) counts the number of seconds elapsed since January 1, 1970 at 00:00:00 UTC. Many systems also use <strong>millisecond precision</strong> (1/1000th of a second), which produces a number 1,000 times larger than the seconds value.",
  },
  {
    question: "What is RFC 2822?",
    answer: "<strong>RFC 2822</strong> is the date format used in email headers, for example: 'Wed, 15 Apr 2026 14:30:00 +0000'. It includes the day of the week, time, and timezone offset, making it human-readable and widely accepted across mail and web standards.",
  },
  {
    question: "Are times shown in local or UTC?",
    answer: "The date-time input is interpreted as your <strong>browser's local timezone</strong>. ISO 8601 and RFC 2822 outputs are converted to UTC. All other format outputs remain in local time unless explicitly labeled UTC.",
  },
  {
    question: "What is the difference between UTC and local time?",
    answer: "<strong>UTC (Coordinated Universal Time)</strong> is the global time standard with no offset. Your local time is UTC adjusted by your timezone's offset — for example, UTC+5:30 is 5 hours and 30 minutes ahead of UTC. Using UTC in data storage avoids ambiguity when users are in different timezones.",
  },
  {
    question: "Why do different systems use different date formats?",
    answer: "Date formats evolved separately in different regions and industries. The <strong>MM/DD/YYYY</strong> format is common in the United States, <strong>DD/MM/YYYY</strong> is used across Europe and many other regions, and <strong>YYYY-MM-DD</strong> (ISO 8601) is the international standard preferred for technical and scientific use because it is unambiguous and naturally sortable.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Understanding Date Formats",
    content: `<p>Date representations vary widely depending on the audience and system. The most important formats to know are:</p>
<ul>
<li><strong>ISO 8601</strong> (YYYY-MM-DDTHH:mm:ssZ) — the global standard for unambiguous, machine-readable date-times. Recommended for APIs and data storage.</li>
<li><strong>Unix timestamp</strong> — a single integer counting seconds (or milliseconds) from January 1, 1970 UTC. Ideal for calculations and sorting.</li>
<li><strong>RFC 2822</strong> — used in email headers and HTTP responses, includes timezone offset.</li>
<li><strong>Locale formats</strong> — region-specific representations such as April 15, 2026 or 15/04/2026, suitable for display to end users.</li>
</ul>`,
  },
  {
    title: "Why Date Format Conversion Matters",
    content: `<p>Mismatched date formats are a common source of data errors and misunderstandings. A date written as <strong>04/05/2026</strong> means April 5th in the United States but May 4th in the United Kingdom. When working with international data, contracts, or databases, always convert to an <strong>unambiguous format</strong> like ISO 8601 to prevent confusion. This tool lets you instantly see any date in all major formats so you can choose the right one for your context.</p>`,
  },
  {
    title: "Tips for Accurate Results",
    content: `<p>When using date formats in technical contexts, prefer <strong>UTC-based formats</strong> (ISO 8601 UTC or Unix timestamps) for storage and data exchange — these eliminate timezone ambiguity. For display to users, use <strong>locale-aware formats</strong> that match their region. Always be explicit about whether a timestamp is in seconds or milliseconds, as the difference of a factor of 1,000 can cause significant errors if misinterpreted.</p>`,
  },
];

export default function DateFormatterPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <DateFormatter />
    </ToolContainer>
  );
}
