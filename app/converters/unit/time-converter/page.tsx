import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { UnitConverter } from "@/components/tools/converters/UnitConverter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("time-converter");

const tool = TOOLS.find((t) => t.slug === "time-converter")!;

const howToSteps = [
  "Type any <strong>time duration value</strong> into the input field at the top of the converter.",
  "Choose your <strong>source unit</strong> from the dropdown — options include nanoseconds, milliseconds, seconds, minutes, hours, days, weeks, months, and years.",
  "All other time units <strong>update instantly</strong> as you type, showing the equivalent duration in every unit.",
  "Click any <strong>result row</strong> to set that value and unit as the new input for further conversions.",
  "Hover over any row and click the <strong>copy icon</strong> to copy a value to your clipboard.",
];

const faqs = [
  {
    question: "How many seconds are in a day?",
    answer: "<strong>1 day = 86,400 seconds</strong> (24 hours × 60 minutes × 60 seconds). This figure is important in computing, physics, and astronomy where time intervals are often expressed in seconds.",
  },
  {
    question: "How many hours are in a week?",
    answer: "<strong>1 week = 168 hours</strong> (7 days × 24 hours). A standard full-time work week in most countries is 40 hours, which is approximately 24% of the total hours in a week.",
  },
  {
    question: "How many days are in a year?",
    answer: "A <strong>standard calendar year = 365 days</strong>. A <strong>leap year = 366 days</strong>, occurring every year divisible by 4, with exceptions for century years not divisible by 400. The average year length is approximately 365.2425 days.",
  },
  {
    question: "How many milliseconds are in a second?",
    answer: "<strong>1 second = 1,000 milliseconds.</strong> Milliseconds are used to measure short durations in computing, networking (ping/latency), sports timing, and audio/video synchronisation.",
  },
  {
    question: "What is a nanosecond?",
    answer: "<strong>1 nanosecond = 10⁻⁹ seconds</strong> (one billionth of a second). Nanoseconds matter in electronics and computing — a signal travelling through a wire covers about 20–30 cm per nanosecond, which is why circuit board design accounts for tiny time differences.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All conversions happen <strong>locally in your browser</strong> — nothing is transmitted.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About Time Duration Measurement",
    content: `<p><strong>Time</strong> is one of the seven fundamental physical quantities. The SI base unit is the <strong>second (s)</strong>, defined with extreme precision based on the vibrations of a caesium atom.</p>
<p>From nanoseconds used in electronics to years used in planning and history, time spans an enormous range. The familiar units — minutes, hours, days, weeks, months, and years — are based on human activity and astronomical cycles rather than decimal multiples. This makes time conversion less straightforward than purely metric measurements, requiring careful multiplication across irregular factors (60, 24, 7, 365).</p>`,
  },
  {
    title: "Common Time Conversions",
    content: `<ul>
<li><strong>1 minute</strong> = 60 seconds</li>
<li><strong>1 hour</strong> = 60 minutes = 3,600 seconds</li>
<li><strong>1 day</strong> = 24 hours = 86,400 seconds</li>
<li><strong>1 week</strong> = 7 days = 168 hours = 604,800 seconds</li>
<li><strong>1 year (average)</strong> ≈ 365.2425 days ≈ 31,557,600 seconds</li>
<li><strong>1 millisecond</strong> = 0.001 seconds | <strong>1 nanosecond</strong> = 10⁻⁹ seconds</li>
</ul>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Time duration conversion is useful in many contexts:</p>
<ul>
<li><strong>Project planning</strong> — converting task durations between hours, days, and weeks for scheduling.</li>
<li><strong>Computing and networking</strong> — expressing latency, processing times, and timeouts in consistent units (ms, µs).</li>
<li><strong>Scientific experiments</strong> — recording decay rates, reaction times, or observation periods in seconds or milliseconds.</li>
<li><strong>Travel and scheduling</strong> — calculating total travel time across multiple legs in different units.</li>
</ul>`,
  },
];

export default function TimeConverterPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <UnitConverter slug="time-converter" />
    </ToolContainer>
  );
}
