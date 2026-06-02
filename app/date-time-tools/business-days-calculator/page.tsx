import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { BusinessDaysCalculator } from "@/components/tools/date-time-tools/BusinessDaysCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("business-days-calculator");
const tool = TOOLS.find((t) => t.slug === "business-days-calculator")!;

const howToSteps = [
  "Select a <strong>start date</strong> and an <strong>end date</strong> using the date pickers — the range can span days, months, or years.",
  "Toggle <strong>'Exclude US federal holidays'</strong> to automatically subtract the 11 official US public holidays that fall within the range.",
  "Review the result summary showing <strong>business days, weekend days, holiday days</strong> (if enabled), and total calendar days in the range.",
];

const faqs = [
  {
    question: "Which days are counted as business days?",
    answer: "By default, <strong>Monday through Friday</strong> are business days. Weekends (Saturday and Sunday) are always excluded. If you enable the US holidays toggle, the 11 US federal holidays are also excluded from the count.",
  },
  {
    question: "Which US holidays are included?",
    answer: "<strong>New Year's Day, MLK Day, Presidents Day, Memorial Day, Juneteenth, Independence Day, Labor Day, Columbus Day, Veterans Day, Thanksgiving, and Christmas</strong> — with weekend observations shifted to the nearest weekday as per official US federal rules.",
  },
  {
    question: "Are international or regional holidays supported?",
    answer: "Currently only <strong>US federal holidays</strong> are included. For other countries, use the tool without the holidays toggle and manually subtract your local public holidays from the business days total.",
  },
  {
    question: "Does the tool include both the start and end date?",
    answer: "The calculation includes the <strong>start date</strong> but excludes the end date, which matches the convention used in most scheduling and contract systems. If you need both dates included, add one to the result.",
  },
  {
    question: "How do I calculate a deadline that is N business days from today?",
    answer: "Use the <strong>Date Calculator</strong> tool to add a number of days to today, then use this tool to confirm the count. Alternatively, set today as the start date and adjust the end date until the business days total matches your required number.",
  },
  {
    question: "Why do my results differ from a colleague in another country?",
    answer: "Business day definitions vary by <strong>country and region</strong>. Some countries observe different weekend days (e.g. Friday–Saturday instead of Saturday–Sunday), and public holiday calendars differ significantly. This tool uses US conventions by default.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Are Business Days?",
    content: `<p>A <strong>business day</strong> (also called a working day) is any day that is not a weekend or public holiday. In most Western countries this means <strong>Monday through Friday</strong>, excluding Saturday and Sunday. Business days are the standard unit used in contracts, delivery estimates, legal deadlines, and financial settlements — a "3 business day" processing window means the work will be completed within three weekdays, not three calendar days.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Counting business days accurately is essential in many real-world situations:</p>
<ul>
<li><strong>Contract and legal deadlines</strong> — notice periods, filing deadlines, and response windows are almost always expressed in business days.</li>
<li><strong>Payroll and billing cycles</strong> — payment terms such as "Net 30 business days" require knowing which days qualify.</li>
<li><strong>Project planning</strong> — estimating how long a task will take when work only happens on weekdays.</li>
<li><strong>Shipping and delivery</strong> — carriers quote transit times in business days, excluding weekends and holidays.</li>
</ul>`,
  },
  {
    title: "Tips for Accurate Results",
    content: `<p>When using business days in planning, always confirm which <strong>holiday calendar</strong> applies to your situation — US federal holidays differ from state holidays, and international teams may observe entirely different public holidays. For international contracts, it is good practice to specify the exact holiday calendar in writing. When counting backwards from a deadline, use the tool to find your latest safe start date by checking how many business days separate two dates.</p>`,
  },
];

export default function BusinessDaysCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <BusinessDaysCalculator />
    </ToolContainer>
  );
}
