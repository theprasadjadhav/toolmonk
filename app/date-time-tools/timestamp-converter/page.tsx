import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { TimestampConverter } from "@/components/tools/date-time-tools/TimestampConverter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("timestamp-converter", "/date-time-tools/timestamp-converter");
const tool = TOOLS.find((t) => t.path === "/date-time-tools/timestamp-converter")!;

const howToSteps = [
  "Paste any <strong>Unix timestamp</strong> (in seconds or milliseconds), an <strong>ISO 8601 string</strong>, or a natural language date like 'Jan 15 2024' into the text field.",
  "Or pick a <strong>date and time</strong> directly from the calendar picker — the text field and the picker stay in sync with each other.",
  "Click <strong>'Use now'</strong> to instantly load the current moment into both inputs.",
  "All <strong>12 output formats</strong> appear instantly — including Unix seconds, milliseconds, ISO 8601 UTC, locale string, day of week, ISO week number, and relative time.",
  "Click <strong>'copy'</strong> next to any output row to copy that specific value to your clipboard.",
];

const faqs = [
  {
    question: "What input formats are accepted?",
    answer:
      "The text field accepts <strong>Unix timestamps</strong> (seconds or milliseconds), <strong>ISO 8601 strings</strong> (e.g. 2024-01-15T10:00:00Z), RFC 2822 strings, and most natural language date formats such as 'Jan 15 2024' or '15 January 2024 10:00'.",
  },
  {
    question: "How does seconds vs milliseconds auto-detection work?",
    answer:
      "If the numeric input is greater than <strong>10,000,000,000</strong> (10 billion) it is treated as milliseconds; otherwise as seconds. This threshold correctly identifies all timestamps from late 2001 onwards.",
  },
  {
    question: "What is a Unix timestamp?",
    answer:
      "A <strong>Unix timestamp</strong> is the number of seconds (or milliseconds) elapsed since January 1, 1970 at 00:00:00 UTC — known as the Unix Epoch. It is timezone-independent and used widely in APIs, databases, log files, and system clocks.",
  },
  {
    question: "Is the local time shown in my timezone?",
    answer:
      "Yes. <strong>Date only, Time only, Locale date-time, Day of week,</strong> and <strong>Relative</strong> outputs all use your browser's local timezone. <strong>ISO 8601 (UTC), UTC string,</strong> and <strong>Locale (UTC)</strong> are always displayed in Coordinated Universal Time.",
  },
  {
    question: "What is an ISO week number?",
    answer:
      "The <strong>ISO week number</strong> is a standardized way to number the 52–53 weeks in a year, defined by ISO 8601. Week 1 is the week containing the first Thursday of the year. It is commonly used in business planning, manufacturing schedules, and European calendars.",
  },
  {
    question: "Why does the same timestamp show a different time in different countries?",
    answer:
      "A Unix timestamp represents a single fixed moment in time globally. When displayed as a local date-time, the result differs by <strong>timezone offset</strong>. For example, Unix timestamp 1700000000 is 4:13 AM UTC but shows as 11:13 PM the previous day in New York (UTC-5) and 12:13 PM in Tokyo (UTC+9).",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is a Unix Timestamp?",
    content: `<p>A <strong>Unix timestamp</strong> is a single integer that represents an absolute moment in time as the number of seconds elapsed since the <strong>Unix Epoch</strong> — January 1, 1970 at 00:00:00 UTC. Because it is a plain number with no timezone attached, a Unix timestamp is the same everywhere in the world: the same value refers to the same physical instant regardless of where you are. This makes Unix timestamps ideal for storing and comparing times in databases, APIs, and log files. Many systems also use <strong>millisecond timestamps</strong> (multiply by 1,000) for finer precision.</p>`,
  },
  {
    title: "Understanding UTC and Timezones",
    content: `<p><strong>UTC (Coordinated Universal Time)</strong> is the global time reference from which all other timezones are offset. A timezone like UTC+5:30 means the local time is 5 hours and 30 minutes ahead of UTC. When you store a date-time in UTC, it remains unambiguous no matter who reads it or where. Converting to local time is a display decision — the underlying UTC value stays constant. For data exchange and storage, <strong>always prefer UTC or Unix timestamps</strong> over local times to avoid confusion during daylight saving transitions or cross-timezone collaboration.</p>`,
  },
  {
    title: "Common Use Cases for Timestamp Conversion",
    content: `<p>Timestamp conversion is needed in many practical situations:</p>
<ul>
<li><strong>Debugging logs</strong> — converting Unix timestamps in server logs to human-readable dates to trace when events occurred.</li>
<li><strong>API integration</strong> — decoding timestamps returned by third-party APIs into a readable format.</li>
<li><strong>Database records</strong> — converting stored epoch values when reviewing records manually.</li>
<li><strong>Scheduling and deadlines</strong> — converting a target date to a Unix timestamp for use in automation or configuration files.</li>
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
