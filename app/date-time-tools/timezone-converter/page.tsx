import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { TimezoneConverter } from "@/components/tools/date-time-tools/TimezoneConverter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("timezone-converter");
const tool = TOOLS.find((t) => t.slug === "timezone-converter" && t.category === "date-time-tools")!;

const howToSteps = [
  "Select your <strong>From</strong> and <strong>To</strong> timezones using the search pickers — search by city name (e.g. Jakarta), abbreviation (e.g. WIB, JST, EST), or country.",
  "Pick a <strong>date</strong> using the date input, or click <strong>Now</strong> to use today's date and the current time.",
  "Drag the <strong>time slider</strong> to set the time in the From timezone — the To timezone updates instantly.",
  "The <strong>24-hour timeline</strong> shows where each timezone is in its day, and the <strong>quick reference grid</strong> shows key hours side by side. Click any hour cell to jump the slider there.",
];

const faqs = [
  {
    question: "How do I search for a timezone like Jakarta or WIB?",
    answer: "Click either timezone picker and type any of: city name (<strong>Jakarta</strong>, <strong>Tokyo</strong>, <strong>New York</strong>), country (<strong>Indonesia</strong>, <strong>Japan</strong>), abbreviation (<strong>WIB</strong>, <strong>JST</strong>, <strong>EST</strong>, <strong>IST</strong>), or even a neighbourhood/alternate city (<strong>Bali</strong>, <strong>Surabaya</strong>, <strong>Osaka</strong>). Results rank exact abbreviation matches first.",
  },
  {
    question: "Does the tool account for Daylight Saving Time?",
    answer: "Yes — all conversions use the browser's built-in <strong>IANA timezone database</strong>, which includes every historical and future DST transition. The abbreviation and UTC offset shown (e.g. <strong>PDT UTC-7</strong> in summer vs <strong>PST UTC-8</strong> in winter) automatically reflect DST status for the exact date you selected.",
  },
  {
    question: "Why does it show UTC+7 instead of GMT+7?",
    answer: "<strong>UTC (Coordinated Universal Time)</strong> is the correct modern standard — GMT is a historical timezone from the UK that happens to match UTC offset-wise, but they are not the same thing. Saying UTC+7 is technically more precise, which is why this tool displays offsets in UTC.",
  },
  {
    question: "What does the +1 day / -1 day badge mean?",
    answer: "When the To timezone is ahead or behind the From timezone by enough hours, the converted time lands on a different calendar date. The badge shows how many days forward or backward the To timezone is relative to your selected From date — for example, 9 AM Monday in Los Angeles is Tuesday morning in Tokyo.",
  },
  {
    question: "Can I use this to schedule an international meeting?",
    answer: "Yes — set your local timezone as From, pick the other person's timezone as To, then drag the slider to find a time that works for both. The quick reference grid at the bottom shows key hours of your day mapped to the other timezone at a glance.",
  },
  {
    question: "What timezones are supported?",
    answer: "The tool covers <strong>60+ major timezones</strong> across all continents, indexed by city, country, and abbreviation. Each timezone maps to an IANA identifier (e.g. <code>Asia/Jakarta</code>) so DST and historical transitions are handled correctly.",
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
