import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { TimeDifferenceCalculator } from "@/components/tools/date-time-tools/TimeDifferenceCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("time-difference-calculator");
const tool = TOOLS.find((t) => t.slug === "time-difference-calculator")!;

const howToSteps = [
  "Enter the <strong>start time</strong> in HH:MM or HH:MM:SS format using the 24-hour clock (for example, 09:00 for 9 AM or 17:30 for 5:30 PM).",
  "Enter the <strong>end time</strong> in the same 24-hour format.",
  "If your time range crosses midnight (for example, a night shift from 22:00 to 06:00), toggle <strong>'Spans midnight'</strong> to get the correct result.",
  "The <strong>difference</strong> is displayed as hours, minutes, and seconds, as well as total minutes and total seconds.",
];

const faqs = [
  {
    question: "Does the tool support 12-hour (AM/PM) input?",
    answer: "The tool uses <strong>24-hour (military) time</strong> format. To convert: add 12 to any PM hour other than noon (e.g. 3:30 PM = 15:30), and use 00:00 for midnight and 12:00 for noon.",
  },
  {
    question: "What does 'Spans midnight' do?",
    answer: "When enabled, the tool treats the end time as being on the <strong>following day</strong> if it is earlier than the start time. For example, 22:00 to 06:00 with this toggle gives 8 hours instead of a negative result.",
  },
  {
    question: "Can I include seconds?",
    answer: "Yes — use the <strong>HH:MM:SS format</strong> for both inputs and the result will include the seconds component for full precision.",
  },
  {
    question: "How do I convert the result to decimal hours?",
    answer: "Divide the <strong>total minutes</strong> by 60 to get decimal hours. For example, 1 hour and 30 minutes = 90 total minutes ÷ 60 = <strong>1.5 decimal hours</strong>. Decimal hours are commonly used in timesheets and billing.",
  },
  {
    question: "Can I calculate the time between more than two points?",
    answer: "This tool handles one <strong>start-to-end interval</strong> at a time. To add up multiple intervals (for example, several work sessions in a day), calculate each pair separately and sum the totals.",
  },
  {
    question: "What happens if start and end times are the same?",
    answer: "If both times are identical, the result is <strong>zero hours, zero minutes, and zero seconds</strong>. This is the expected behavior — no time has elapsed between two identical moments.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Understanding 24-Hour Time",
    content: `<p>The <strong>24-hour clock</strong> (also called military time) runs from 00:00 at midnight through 23:59 at the last minute of the day. There is no AM/PM ambiguity — 08:00 is always 8 in the morning and 20:00 is always 8 in the evening. To convert from 12-hour to 24-hour time: leave morning hours (1–11 AM) as-is, use 12 for noon, add 12 to afternoon hours (1–11 PM), and use 00 for midnight. The 24-hour format is standard in aviation, the military, healthcare, and most countries outside North America.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Calculating the difference between two times is useful in many everyday situations:</p>
<ul>
<li><strong>Timesheets and payroll</strong> — calculating billable hours worked between clock-in and clock-out times.</li>
<li><strong>Shift scheduling</strong> — determining the length of a work shift, including overnight shifts that span midnight.</li>
<li><strong>Travel planning</strong> — finding the duration of a flight, drive, or commute.</li>
<li><strong>Sports and fitness</strong> — measuring the duration of a workout, race, or practice session.</li>
<li><strong>Billing and invoicing</strong> — converting time intervals into decimal hours for professional fee calculations.</li>
</ul>`,
  },
  {
    title: "Tips for Accurate Results",
    content: `<p>Always confirm whether your input times are in the <strong>same timezone</strong> — if one time is local and the other is from a different location, the difference will be misleading. For overnight intervals, always use the <strong>'Spans midnight' toggle</strong> rather than trying to adjust the times manually. When recording time for billing purposes, round to a consistent unit (such as the nearest 15 minutes) and note whether your times include or exclude breaks.</p>`,
  },
];

export default function TimeDifferenceCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <TimeDifferenceCalculator />
    </ToolContainer>
  );
}
