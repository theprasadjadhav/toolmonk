import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { TimezoneConverter } from "@/components/tools/date-time-tools/TimezoneConverter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("timezone-converter");
const tool = TOOLS.find((t) => t.slug === "timezone-converter" && t.category === "date-time-tools")!;

const howToSteps = [
  "Enter or select a <strong>date and time</strong> using the picker — your browser's current local time is pre-filled so you get instant results.",
  "Click <strong>'Use current time'</strong> to snap the input back to the exact current moment.",
  "Use the <strong>filter box</strong> to search by city name, region, or timezone abbreviation to find a specific zone quickly.",
  "The <strong>results table</strong> shows that exact moment converted to all 33 major world timezones, with each zone's UTC offset at that moment.",
];

const faqs = [
  {
    question: "How is the input time interpreted?",
    answer: "The date-time input is interpreted as your <strong>browser's local time</strong>. The table then shows the same physical instant in each listed timezone — every row represents the very same moment, just expressed locally.",
  },
  {
    question: "Does the tool account for Daylight Saving Time?",
    answer: "Yes — the conversions use the <strong>IANA timezone database</strong>, which includes all historical and current Daylight Saving Time transitions for every zone. The UTC offset shown next to each timezone automatically reflects DST status at the selected date and time.",
  },
  {
    question: "What is the UTC offset shown next to each time?",
    answer: "The <strong>UTC offset</strong> (for example, UTC+5:30 or UTC−8) shows how far ahead or behind that timezone is relative to Coordinated Universal Time at the selected moment. The offset can vary throughout the year due to Daylight Saving Time.",
  },
  {
    question: "What is Daylight Saving Time?",
    answer: "<strong>Daylight Saving Time (DST)</strong> is the practice of advancing clocks by one hour during summer months to make better use of evening daylight. Not all countries observe DST — for example, most of Africa and Asia do not — which means the offset between two timezones can change by one hour between summer and winter.",
  },
  {
    question: "Why are there only 33 timezones listed when there are more in the world?",
    answer: "The tool shows the <strong>33 most widely used major timezones</strong>, covering the major cities and regions that most users need. The world technically has over 600 named timezone identifiers, many of which are historical or regional variants with identical or near-identical offsets.",
  },
  {
    question: "Can I use this to schedule an international meeting?",
    answer: "Yes — enter the proposed meeting time in your local timezone, then use the table to see what time that corresponds to for participants in <strong>every other timezone</strong>. This instantly shows whether the time is reasonable for everyone or falls outside normal working hours in certain locations.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is a Timezone?",
    content: `<p>A <strong>timezone</strong> is a region of the world that observes the same standard time. Timezones are defined as offsets from <strong>UTC (Coordinated Universal Time)</strong> — the world's primary time standard. For example, UTC+1 means one hour ahead of UTC, and UTC−5 means five hours behind. Most timezones align with country or regional borders, though the exact offsets can shift during <strong>Daylight Saving Time</strong>. There are currently over 600 official timezone identifiers maintained in the global IANA timezone database, though most people need only a handful of major zones.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Timezone conversion is essential in many modern workflows:</p>
<ul>
<li><strong>International scheduling</strong> — finding a meeting time that works for teams across multiple continents.</li>
<li><strong>Remote work</strong> — checking when a colleague's workday starts or ends relative to your own timezone.</li>
<li><strong>Event broadcasts</strong> — announcing a livestream or product launch in every viewer's local time.</li>
<li><strong>Travel planning</strong> — understanding the local time at a destination when a flight departs or arrives.</li>
<li><strong>Finance and trading</strong> — knowing when international markets open and close in your local time.</li>
</ul>`,
  },
  {
    title: "Understanding UTC and Timezone Offsets",
    content: `<p><strong>UTC (Coordinated Universal Time)</strong> is the universal clock that all other timezones are measured from. It has no offset, no Daylight Saving Time, and never changes. A timezone offset like <strong>UTC+9</strong> means that location is 9 hours ahead of UTC — when it is noon UTC, it is 9 PM in that timezone. Offsets are not always whole hours; some zones like <strong>India (UTC+5:30)</strong> and <strong>Nepal (UTC+5:45)</strong> use half-hour or quarter-hour offsets. Always check the offset for the specific date you are converting, as Daylight Saving transitions can shift it by one hour.</p>`,
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
