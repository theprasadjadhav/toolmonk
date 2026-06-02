import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { RelativeTimeFormatter } from "@/components/tools/date-time-tools/RelativeTimeFormatter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("relative-time-formatter");
const tool = TOOLS.find((t) => t.slug === "relative-time-formatter")!;

const howToSteps = [
  "Select any <strong>date and time</strong> — it defaults to the current moment so you can immediately see relative expressions like 'just now'.",
  "The <strong>relative expression</strong> ('3 days ago', 'in 2 hours', 'yesterday') is calculated instantly compared to the current time.",
  "The <strong>exact breakdown</strong> row shows the full precision, for example '1y 3mo 5d 2h ago', for when you need more detail.",
  "The display <strong>updates automatically every minute</strong> as the current time advances, keeping the relative output fresh.",
  "Click <strong>'Use now'</strong> at any time to reset the input back to the exact current moment.",
];

const faqs = [
  {
    question: "What language is the relative format in?",
    answer: "Output is in <strong>English</strong> and uses natural language phrasing like 'yesterday', 'tomorrow', 'last year', or 'in 3 months' depending on how far away the date is.",
  },
  {
    question: "How accurate is the relative time?",
    answer: "The <strong>relative expression</strong> rounds to the most significant unit — for example, '3 days' instead of '3 days 4 hours'. The exact breakdown row below it shows the full precision for all significant units.",
  },
  {
    question: "Does the output update automatically?",
    answer: "Yes — the page recalculates the relative expression every minute, so a date that was <strong>'5 minutes ago'</strong> becomes '6 minutes ago' a minute later without needing to reload the page.",
  },
  {
    question: "What is a common use case for this tool?",
    answer: "A common use is previewing how a specific date-time will appear in a <strong>content feed or notification</strong> — for example, checking whether a past timestamp reads as 'just now', 'yesterday', or '3 months ago' for a given post or event.",
  },
  {
    question: "What is relative time formatting?",
    answer: "<strong>Relative time formatting</strong> expresses the distance between two moments in natural language rather than as an absolute date. Instead of '2026-01-15', it says 'last month' or '3 months ago'. This format is widely used in social media, news feeds, email clients, and apps to make timestamps feel more intuitive.",
  },
  {
    question: "How are the thresholds for switching units determined?",
    answer: "The switching thresholds follow natural language conventions: differences under a minute show as <strong>'just now'</strong>, under an hour show as minutes, under a day show as hours, under a week as days, under a month as weeks, under a year as months, and anything beyond a year uses years. These thresholds match the way people naturally describe time.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is Relative Time?",
    content: `<p><strong>Relative time</strong> describes a moment in relation to now rather than as a fixed date. Expressions like <strong>'3 hours ago'</strong>, <strong>'yesterday'</strong>, or <strong>'in 2 weeks'</strong> are relative time — they change meaning as time passes. Absolute time expressions like <strong>'April 15, 2026 at 14:30'</strong> remain fixed. Relative time is favored in user interfaces because it is immediately intuitive — users instantly grasp 'posted 5 minutes ago' without needing to calculate how long ago that was from a timestamp.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Relative time expressions appear in nearly every modern digital product:</p>
<ul>
<li><strong>Social media and forums</strong> — post timestamps shown as 'just now', '2 hours ago', or 'yesterday'.</li>
<li><strong>Email clients</strong> — received times shown as 'this morning', '3 days ago', or 'last week'.</li>
<li><strong>Notifications and activity feeds</strong> — 'Your order shipped 1 day ago'.</li>
<li><strong>Project management tools</strong> — task deadlines shown as 'due in 2 days' or 'overdue by 1 week'.</li>
</ul>`,
  },
  {
    title: "Tips for Accurate Results",
    content: `<p>Relative time is always relative to <strong>right now</strong>, so the same date-time will produce different outputs depending on when you check it. If you need a stable, reproducible output for documentation or testing purposes, note the <strong>exact breakdown</strong> in addition to the relative expression. When using relative time in your own content or products, consider showing the absolute date as a tooltip or subtitle so users can always verify the precise timestamp when needed.</p>`,
  },
];

export default function RelativeTimeFormatterPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <RelativeTimeFormatter />
    </ToolContainer>
  );
}
