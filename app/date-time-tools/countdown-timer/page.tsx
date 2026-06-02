import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { CountdownTimer } from "@/components/tools/date-time-tools/CountdownTimer";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("countdown-timer");
const tool = TOOLS.find((t) => t.slug === "countdown-timer")!;

const howToSteps = [
  "Select a <strong>target date and time</strong> using the date-time picker — this is the moment you want to count down to.",
  "Optionally enter an <strong>event label</strong> (for example, 'Product Launch' or 'Vacation') to give your countdown a meaningful name.",
  "The countdown <strong>updates every second</strong>, showing the exact days, hours, minutes, and seconds remaining until the target moment.",
  "When the target time is reached, the timer displays <strong>'Expired'</strong> to indicate the event has arrived.",
];

const faqs = [
  {
    question: "Does the countdown continue if I leave the tab?",
    answer: "Yes — the countdown is calculated from the <strong>system clock</strong> each second, so it remains accurate even if the tab is in the background. However, the display will only visually refresh when the tab is active.",
  },
  {
    question: "Can I count down to a past date?",
    answer: "If you select a <strong>past date</strong>, the timer shows 'Expired' immediately since the target moment has already passed.",
  },
  {
    question: "Is the countdown accurate to the millisecond?",
    answer: "The display updates every second, so <strong>second-level precision</strong> is shown. For millisecond-precision timing or lap recording, use the Stopwatch tool instead.",
  },
  {
    question: "What happens at exactly midnight on the target date?",
    answer: "If you set a target to a specific date without specifying a time, the countdown targets <strong>midnight at the start</strong> of that day (00:00:00). Adjust the time field to target a specific moment later in the day.",
  },
  {
    question: "Can I use this for multiple countdowns at once?",
    answer: "Open the tool in <strong>multiple browser tabs</strong>, each with a different target date, to track several countdowns simultaneously. Each tab operates independently.",
  },
  {
    question: "Will the countdown reset if I refresh the page?",
    answer: "Yes — the target date is held in memory for the current session. <strong>Refreshing the page</strong> will clear the input and you will need to re-enter your target date and time.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Common Use Cases for Countdown Timers",
    content: `<p>Countdown timers help create anticipation and keep people oriented around upcoming moments. Common real-world uses include:</p>
<ul>
<li><strong>Product and event launches</strong> — display a countdown on a landing page to build excitement before a launch.</li>
<li><strong>Personal milestones</strong> — weddings, birthdays, vacations, and retirement dates.</li>
<li><strong>Deadlines and exams</strong> — exam countdowns, submission deadlines, or end-of-quarter targets.</li>
<li><strong>Promotions and sales</strong> — limited-time offers with a visible clock to encourage action.</li>
</ul>`,
  },
  {
    title: "How Countdown Timers Work",
    content: `<p>A countdown timer works by taking the <strong>difference between the target date-time and the current moment</strong>, then breaking that difference into days, hours, minutes, and seconds. Because the calculation is based on the device's system clock rather than a stored duration, the countdown remains accurate across page reloads as long as the target date is known. The display refreshes on a fixed interval — typically once per second — to keep the numbers current.</p>`,
  },
];

export default function CountdownTimerPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <CountdownTimer />
    </ToolContainer>
  );
}
