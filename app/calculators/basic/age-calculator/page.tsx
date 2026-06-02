import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { AgeCalculator } from "@/components/tools/shared/date-time/AgeCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("age-calculator");
const tool = TOOLS.find((t) => t.slug === "age-calculator" && t.category === "calculators")!;

const howToSteps = [
  "Enter your <strong>date of birth</strong> using the date picker — you can type directly or use the calendar popup.",
  "Optionally change the <strong>reference date</strong> (defaults to today) to calculate how old you were or will be on any specific date in the past or future.",
  "View your <strong>exact age</strong> broken down into years, months, and days, plus total weeks lived and total days lived since birth.",
  "Check the <strong>days until your next birthday</strong> — if today is your birthday the tool celebrates with a special message.",
];

const faqs = [
  {
    question: "How is the age calculated?",
    answer: "The age is calculated by counting the exact <strong>years, months, and remaining days</strong> between the birthdate and the reference date — accounting for varying month lengths and leap years so the result is always precise.",
  },
  {
    question: "Can I calculate age at a past or future date?",
    answer: "Yes — change the <strong>reference date</strong> to any date. The tool will calculate how old you will be (or were) on that exact date, which is useful for things like determining your age on a milestone anniversary or legal cutoff date.",
  },
  {
    question: "Why does the 'next birthday' show 0 days?",
    answer: "If your birthday falls exactly on the reference date, the tool shows <strong>Today!</strong> to indicate you are celebrating a birthday on that day.",
  },
  {
    question: "What is the difference between age in years and total days lived?",
    answer: "<strong>Age in years</strong> is the conventional way we express age (e.g., 30 years, 4 months, 12 days). <strong>Total days lived</strong> is the raw count of every calendar day from your birthdate to the reference date — a fun way to see your life milestone in absolute terms.",
  },
  {
    question: "Does the calculator account for leap years?",
    answer: "Yes. The calculation fully accounts for <strong>leap years</strong>, so February 29 birthdays and long date ranges are handled correctly without any rounding errors.",
  },
  {
    question: "Can I use this to check if someone is old enough for a legal age requirement?",
    answer: "Absolutely. Set the <strong>reference date</strong> to the relevant cutoff date and enter the person's date of birth. The result shows whether they have reached the required age on that date — useful for school enrollment deadlines, legal age checks, and similar purposes.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "How Age Is Measured",
    content: `<p>Age is most commonly expressed as the number of <strong>complete years</strong> that have passed since a person's date of birth. However, a more complete picture includes the remaining months and days beyond the last birthday — for example, <strong>28 years, 3 months, and 14 days</strong>.</p><p>Beyond years and months, your age can also be expressed as <strong>total weeks lived</strong> or <strong>total days lived</strong> — absolute counts that strip away calendar conventions and are sometimes used in medical and legal contexts where precision matters.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>An age calculator is useful in many everyday and professional situations:</p><ul><li><strong>Legal age verification</strong> — confirming a person meets a minimum age for voting, driving, alcohol purchase, or retirement eligibility on a specific date.</li><li><strong>School enrollment cutoffs</strong> — many school districts require children to reach a certain age by a fixed date each year.</li><li><strong>Medical and insurance forms</strong> — age at a specific past or future date is often needed for documentation.</li><li><strong>Fun milestones</strong> — finding out which day you turned exactly 10,000 days old or how many weeks you have been alive.</li></ul>`,
  },
  {
    title: "Tips for Accurate Results",
    content: `<p>For the most accurate age calculation, keep these points in mind:</p><ul><li>Use the <strong>exact date of birth</strong> including the correct day and month — even a one-day error shifts the result.</li><li>When calculating age for a <strong>future date</strong>, the result is a projection and assumes no changes to calendar conventions.</li><li>If you were born on <strong>February 29</strong> (a leap day), the calculator treats March 1 as your birthday in non-leap years, which is the most common legal convention.</li></ul>`,
  },
];

export default function AgeCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <AgeCalculator />
    </ToolContainer>
  );
}
