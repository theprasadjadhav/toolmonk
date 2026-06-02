import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { TimezoneConverter } from "@/components/tools/shared/date-time/TimezoneConverter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("timezone-converter");
const tool = TOOLS.find((t) => t.slug === "timezone-converter" && t.category === "converters")!;

const howToSteps = [
  "The <strong>date and time input</strong> is pre-filled with your browser's current local time — edit it to any moment you want to convert.",
  "Click <strong>'Use current time'</strong> to instantly snap the input back to the current moment.",
  "Use the <strong>filter box</strong> to search for a specific city, region, or timezone name.",
  "The results table shows that <strong>exact moment converted to all 33 major time zones</strong>, including the current UTC offset for each.",
];

const faqs = [
  {
    question: "How is the input time interpreted?",
    answer: "The datetime input is interpreted as your <strong>browser's local time</strong>. The table then shows the same physical moment in each listed time zone — so all displayed times represent the same instant worldwide.",
  },
  {
    question: "Does the tool account for Daylight Saving Time?",
    answer: "Yes — the conversions use the <strong>IANA timezone database</strong>, which includes all historical and future DST transitions for every zone. The correct offset is applied automatically based on the specific date and time you enter.",
  },
  {
    question: "What is the UTC offset shown next to each time?",
    answer: "The <strong>UTC offset</strong> (e.g. UTC+5:30 or UTC−8) shows how far ahead or behind a timezone is relative to <strong>Coordinated Universal Time</strong> at the selected moment. Offsets change when Daylight Saving Time starts or ends.",
  },
  {
    question: "What is the difference between UTC and GMT?",
    answer: "<strong>UTC (Coordinated Universal Time)</strong> is the modern international time standard, maintained by atomic clocks. <strong>GMT (Greenwich Mean Time)</strong> is an older time zone based on solar time at the Royal Observatory in Greenwich, UK. They are numerically equal but technically distinct — UTC is the standard used in computing and aviation.",
  },
  {
    question: "How do I find the time difference between two cities?",
    answer: "Enter any date and time, then locate both cities in the results table. The difference between their displayed times (or UTC offsets) gives the <strong>current time gap</strong> between them. Remember that the gap may change when one city observes DST and the other does not.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All conversions happen <strong>locally in your browser</strong> using your device's timezone data — nothing is transmitted.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About Time Zones",
    content: `<p>The world is divided into <strong>time zones</strong> — regions that observe the same standard time. Most zones are defined as a fixed offset from <strong>UTC (Coordinated Universal Time)</strong>, ranging from UTC−12 to UTC+14.</p>
<p>In practice, political and geographic factors mean many countries use non-standard half-hour or quarter-hour offsets (e.g. India at UTC+5:30, Nepal at UTC+5:45). Additionally, many regions observe <strong>Daylight Saving Time (DST)</strong>, shifting their clocks forward by one hour in summer, which changes their UTC offset seasonally.</p>`,
  },
  {
    title: "Daylight Saving Time Explained",
    content: `<p><strong>Daylight Saving Time (DST)</strong> is the practice of advancing clocks by one hour during warmer months so that evenings have more daylight. Not all countries observe it, and those that do change their clocks on different dates.</p>
<p>For example, the US and Canada spring forward in March and fall back in November, while the EU changes in late March and late October. Countries near the equator and many in Asia and Africa do not observe DST at all. This means the time difference between two cities can change by one or even two hours at certain times of year.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Timezone conversion is essential in many modern scenarios:</p>
<ul>
<li><strong>Remote work and meetings</strong> — scheduling calls across teams in different countries without confusion.</li>
<li><strong>International travel</strong> — planning departures, arrivals, and connections across multiple time zones.</li>
<li><strong>Live events and broadcasts</strong> — finding your local time for a sports match, product launch, or webinar listed in another timezone.</li>
<li><strong>Software and logging</strong> — understanding UTC timestamps in server logs and converting them to local time for debugging.</li>
</ul>`,
  },
];

export default function TimezoneConverterPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <TimezoneConverter />
    </ToolContainer>
  );
}
