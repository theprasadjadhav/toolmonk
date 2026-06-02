import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { DateGenerator } from "@/components/tools/date-time-tools/DateGenerator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("date-generator");
const tool = TOOLS.find((t) => t.slug === "date-generator")!;

const howToSteps = [
  "Set a <strong>start date</strong> and <strong>end date</strong> to define the range of dates you want to draw from.",
  "Choose a <strong>count</strong> (up to 100 dates) to specify how many dates you want in the output.",
  "Select <strong>Random</strong> (shuffled, no repeats) or <strong>Sequential</strong> (first N dates in the range, in order).",
  "Optionally check <strong>'Weekdays only'</strong> to restrict output to Monday–Friday, skipping Saturdays and Sundays.",
  "Choose your preferred <strong>output format</strong> (ISO, US, EU, etc.) and click <strong>'Generate dates'</strong>.",
  "Use <strong>'Copy all'</strong> to copy the complete list to your clipboard in one click.",
];

const faqs = [
  {
    question: "Are random dates unique?",
    answer: "Yes — random dates are sampled <strong>without replacement</strong>. You will never get the same date twice in a single generation run.",
  },
  {
    question: "What happens if I request more dates than exist in the range?",
    answer: "The tool automatically <strong>caps the output</strong> to the number of valid dates available in the range. For example, requesting 100 weekdays in a 3-day range would return at most 2 or 3 weekday dates.",
  },
  {
    question: "What are the use cases for date generation?",
    answer: "Common uses include generating <strong>test data</strong> for databases, populating sample spreadsheets, creating dummy appointment schedules, or producing date inputs for automated testing scenarios.",
  },
  {
    question: "Can I generate dates in a specific format?",
    answer: "Yes — choose from several <strong>output formats</strong> including ISO 8601 (YYYY-MM-DD), US format (MM/DD/YYYY), European format (DD/MM/YYYY), and long-form formats. All dates in the list are formatted consistently.",
  },
  {
    question: "What is the difference between random and sequential mode?",
    answer: "In <strong>sequential mode</strong>, the tool returns the first N dates in the range in order — useful for predictable, ordered lists. In <strong>random mode</strong>, dates are shuffled so the output is unpredictable — useful for sampling or testing scenarios where order should not matter.",
  },
  {
    question: "Can I use this to generate a list of all weekdays in a month?",
    answer: "Yes — set the start and end dates to the first and last day of the month, enable <strong>'Weekdays only'</strong>, and set the count high enough to capture all weekdays. The tool will return every Monday–Friday within that range sequentially.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Common Use Cases for Date Generation",
    content: `<p>Generating lists of dates is a surprisingly common task in many fields:</p>
<ul>
<li><strong>Software testing</strong> — seeding databases with realistic date values to test sorting, filtering, and display logic.</li>
<li><strong>Spreadsheet templates</strong> — populating schedule tables, log sheets, or calendars with pre-filled dates.</li>
<li><strong>Survey and form design</strong> — creating sample date inputs to test date validation rules.</li>
<li><strong>Project planning</strong> — quickly listing all working days in a sprint or quarter for a schedule grid.</li>
<li><strong>Education</strong> — generating date datasets for statistics or data analysis exercises.</li>
</ul>`,
  },
  {
    title: "Understanding Date Output Formats",
    content: `<p>The format you choose for the output list should match the system or audience that will consume it. <strong>ISO 8601 (YYYY-MM-DD)</strong> is ideal for databases, APIs, and any technical context because it is unambiguous and sorts correctly as plain text. <strong>US format (MM/DD/YYYY)</strong> is conventional for American audiences, while <strong>European format (DD/MM/YYYY)</strong> is standard in most of the rest of the world. Choosing the wrong format can cause confusion — for example, 04/05/2026 means April 5th in the US but May 4th in Europe.</p>`,
  },
];

export default function DateGeneratorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <DateGenerator />
    </ToolContainer>
  );
}
