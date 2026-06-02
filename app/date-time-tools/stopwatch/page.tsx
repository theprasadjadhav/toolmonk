import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { Stopwatch } from "@/components/tools/date-time-tools/Stopwatch";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("stopwatch");
const tool = TOOLS.find((t) => t.slug === "stopwatch")!;

const howToSteps = [
  "Click <strong>Start</strong> to begin timing — the display will start counting up immediately in MM:SS.cs format.",
  "Click <strong>Lap</strong> while the stopwatch is running to record the current split time without stopping the timer.",
  "Click <strong>Pause</strong> to freeze the timer at the current time — click <strong>Resume</strong> to continue counting from exactly where you left off.",
  "Click <strong>Reset</strong> (available only when paused) to clear the elapsed time and all recorded laps back to zero.",
  "Review the lap list — <strong>fastest laps are highlighted in green</strong> and slowest laps in red for instant visual comparison.",
];

const faqs = [
  {
    question: "How precise is the stopwatch?",
    answer: "The display updates every <strong>30 milliseconds</strong>, showing hundredths of a second (MM:SS.cs format). Internal timing is based on the system clock and is accurate to the millisecond.",
  },
  {
    question: "What does 'Lap' record?",
    answer: "Each lap records two values: the <strong>split time</strong> (time elapsed since the previous lap) and the <strong>total elapsed time</strong> since the stopwatch was started. The fastest and slowest splits are colour-highlighted in the lap table.",
  },
  {
    question: "Does the stopwatch continue running if I change tabs?",
    answer: "Yes — timing is based on the <strong>system clock</strong>, not the display refresh rate, so the elapsed time accumulates correctly even when the tab is in the background or the screen is off.",
  },
  {
    question: "Can I record multiple laps?",
    answer: "Yes — there is no hard limit on the number of laps you can record. Each lap press adds a new row to the <strong>lap table</strong> with the split and total time, making it easy to compare performance across many intervals.",
  },
  {
    question: "What is the difference between split time and total time?",
    answer: "The <strong>split time</strong> (or lap time) is the duration of a single interval — the time between the previous lap press and the current one. The <strong>total time</strong> is the cumulative time since the stopwatch was started. The total time always increases, while split times measure each individual segment.",
  },
  {
    question: "Why would I use this instead of a physical stopwatch?",
    answer: "A digital stopwatch on screen is convenient for tasks where you need to <strong>record and review many laps</strong>, since physical stopwatches don't store lap history. It's also immediately available on any device without needing dedicated hardware.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Common Use Cases for a Stopwatch",
    content: `<p>Stopwatches are useful wherever you need to measure elapsed time with precision:</p>
<ul>
<li><strong>Sports and fitness</strong> — timing running laps, workout sets, or swim intervals.</li>
<li><strong>Cooking and baking</strong> — tracking steeping, resting, or cooking times with lap-based stages.</li>
<li><strong>Presentations and speeches</strong> — monitoring how long each section takes to keep within time limits.</li>
<li><strong>Testing and benchmarking</strong> — measuring how long manual processes take to identify bottlenecks.</li>
<li><strong>Games and puzzles</strong> — timing solve attempts or competitive rounds.</li>
</ul>`,
  },
  {
    title: "Understanding Lap Timing",
    content: `<p><strong>Lap timing</strong> divides a continuous run into named segments so you can compare the pace of each interval. In competitive contexts, faster lap times indicate better performance in that segment. The <strong>split time</strong> isolates each interval, while the <strong>cumulative total</strong> shows the overall elapsed time. Colour-coding the fastest and slowest laps makes it immediately clear where performance was strongest or weakest, without needing to scan through the numbers manually.</p>`,
  },
];

export default function StopwatchPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <Stopwatch />
    </ToolContainer>
  );
}
