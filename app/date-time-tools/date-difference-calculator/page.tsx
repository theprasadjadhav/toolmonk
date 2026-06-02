import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { DateDifferenceCalculator } from "@/components/tools/date-time-tools/DateDifferenceCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("date-difference-calculator");
const tool = TOOLS.find((t) => t.slug === "date-difference-calculator")!;

const howToSteps = [
  "Select a <strong>start date</strong> and an <strong>end date</strong> using the date pickers — you can pick any two dates regardless of order.",
  "The difference is calculated <strong>instantly</strong> and displayed in multiple units: years + months + days, total days, total weeks, total hours, total minutes, and total seconds.",
  "Click the <strong>copy button</strong> next to any value to copy that specific measurement to your clipboard.",
];

const faqs = [
  {
    question: "Does the order of the dates matter?",
    answer: "No — if the end date is before the start date, the tool calculates the <strong>absolute difference</strong> and shows a note indicating the dates were swapped internally.",
  },
  {
    question: "Are the hours, minutes, and seconds calculated exactly?",
    answer: "Yes — they are based on the <strong>total milliseconds</strong> between midnight on both dates. Since both inputs are dates (not date-times), times are always compared at midnight (00:00:00).",
  },
  {
    question: "How are months counted?",
    answer: "Months are counted <strong>calendar-month-by-calendar-month</strong>. For example, the difference between Jan 31 and Feb 28 is exactly 28 days, but counts as 0 months and 28 days since February has fewer days than January.",
  },
  {
    question: "How is 'total weeks' calculated?",
    answer: "Total weeks is the <strong>total number of days divided by 7</strong>, rounded down to a whole number. Any remaining days beyond the last full week appear in the years+months+days breakdown.",
  },
  {
    question: "Can I calculate the difference between dates in different years?",
    answer: "Yes — there is no limitation on the date range. You can calculate the difference between dates that are <strong>decades or centuries apart</strong>, which is useful for historical research, anniversary tracking, or long-term project analysis.",
  },
  {
    question: "Why does the years+months+days total look different from total days divided by 365?",
    answer: "Because months have different lengths (28–31 days) and years can be leap years, a <strong>calendar-based breakdown</strong> in years and months will not always match a simple division by 365. The calendar-aware method is more meaningful for human-readable age or duration expressions.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Why Measure Date Differences?",
    content: `<p>Knowing the exact gap between two dates is essential in many professional and personal contexts. <strong>Contract durations, loan terms, insurance periods, and project timelines</strong> all depend on accurate date difference calculations. Even small errors — such as forgetting that a month has 30 versus 31 days — can lead to missed deadlines or billing discrepancies. Using a dedicated calculator removes guesswork and provides results in whatever unit is most useful for your situation.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Date difference calculations arise in many everyday situations:</p>
<ul>
<li><strong>Age verification</strong> — confirming how old someone or something is in years and months.</li>
<li><strong>Loan and lease terms</strong> — calculating how many days or months remain on a financial agreement.</li>
<li><strong>Event planning</strong> — finding out how many weeks until a conference, wedding, or deadline.</li>
<li><strong>Medical tracking</strong> — counting days since a procedure, prescription start, or symptom onset.</li>
<li><strong>Historical research</strong> — measuring the span between two historical events.</li>
</ul>`,
  },
];

export default function DateDifferenceCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <DateDifferenceCalculator />
    </ToolContainer>
  );
}
