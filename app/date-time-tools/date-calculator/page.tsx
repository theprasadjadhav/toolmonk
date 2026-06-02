import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { DateCalculator } from "@/components/tools/date-time-tools/DateCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("date-calculator");
const tool = TOOLS.find((t) => t.slug === "date-calculator")!;

const howToSteps = [
  "Select a <strong>start date</strong> using the date picker — it defaults to today so you can get a result immediately.",
  "Choose whether you want to <strong>Add</strong> or <strong>Subtract</strong> time from the start date.",
  "Enter an <strong>amount</strong> between 1 and 9,999, then select the <strong>unit</strong>: Days, Weeks, Months, or Years.",
  "The <strong>result date</strong> appears instantly in multiple formats, along with a note showing how far that date is from today.",
];

const faqs = [
  {
    question: "How are months added?",
    answer: "Months are added <strong>calendar-month-by-calendar-month</strong>. Adding 1 month to January 31st gives February 28th (or 29th in a leap year) because February does not have 31 days — the result is clamped to the last valid day of the resulting month.",
  },
  {
    question: "How are years added?",
    answer: "Years are added by incrementing the <strong>year component</strong> while keeping the month and day the same where possible. Adding 1 year to February 29 (leap day) gives February 28 in a non-leap year.",
  },
  {
    question: "What does 'From today' mean in the results?",
    answer: "The <strong>'From today'</strong> note shows whether the result date is in the future ('in X days'), is today, or is in the past ('X days ago'). This is useful for quickly understanding the relative distance from the current date without needing a separate calculation.",
  },
  {
    question: "Can I subtract a large number of years?",
    answer: "Yes — you can subtract up to <strong>9,999 years</strong> from the start date, which is useful for historical date research. The result will display correctly for any valid Gregorian calendar date.",
  },
  {
    question: "What is the difference between adding days and adding weeks?",
    answer: "Adding <strong>days</strong> increments by individual calendar days. Adding <strong>weeks</strong> multiplies the count by 7 first. Both produce the same type of result — the difference is only in how you express the duration.",
  },
  {
    question: "Why would I use this instead of just looking at a calendar?",
    answer: "For small intervals a calendar works fine, but for larger spans — such as '90 days from today' or '18 months from signing' — manually counting is error-prone. This tool gives an <strong>instant, accurate result</strong> and displays the answer in multiple date formats.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Common Use Cases for Date Arithmetic",
    content: `<p>Adding or subtracting time from a date is one of the most frequent calculations in everyday planning:</p>
<ul>
<li><strong>Contract and warranty deadlines</strong> — finding the expiry date given a start date and a term in months or years.</li>
<li><strong>Trial and subscription periods</strong> — calculating when a 14-day or 30-day trial ends.</li>
<li><strong>Legal and regulatory timeframes</strong> — notice periods, appeal windows, and filing deadlines defined in days.</li>
<li><strong>Project milestones</strong> — scheduling review dates or go-live dates a fixed number of weeks from project start.</li>
</ul>`,
  },
  {
    title: "Understanding Month and Year Arithmetic",
    content: `<p>Unlike days and weeks, <strong>months and years are variable-length units</strong>. A month can have 28, 29, 30, or 31 days, and a year can have 365 or 366 days. When you add months or years, the tool adjusts the result to the last valid day of the target month if necessary. For example, adding one month to <strong>October 31</strong> gives <strong>November 30</strong>, not an invalid November 31. This calendar-aware approach ensures results are always valid dates.</p>`,
  },
];

export default function DateCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <DateCalculator />
    </ToolContainer>
  );
}
