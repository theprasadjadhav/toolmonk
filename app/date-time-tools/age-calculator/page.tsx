import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { AgeCalculator } from "@/components/tools/date-time-tools/AgeCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("age-calculator");
const tool = TOOLS.find((t) => t.slug === "age-calculator")!;

const howToSteps = [
  "Enter your <strong>date of birth</strong> using the date picker — you can type the date directly or use the calendar.",
  "Optionally change the <strong>reference date</strong> (defaults to today) to calculate your age at any specific point in the past or future.",
  "View your <strong>exact age</strong> broken down into years, months, and days, along with the total number of weeks and days you have been alive.",
  "Check the <strong>next birthday countdown</strong> to see exactly how many days remain until your next celebration.",
];

const faqs = [
  {
    question: "How is the age calculated?",
    answer: "The age is calculated by counting the exact <strong>years, months, and remaining days</strong> between the birthdate and the reference date — accounting for varying month lengths and leap years. A year only increments when the full anniversary has passed.",
  },
  {
    question: "Can I calculate age at a past or future date?",
    answer: "Yes — change the <strong>reference date</strong> to any date in the past or future. The tool will calculate how old you will be (or were) on that specific date, which is useful for legal age checks or historical research.",
  },
  {
    question: "Why does the 'next birthday' show 0 days?",
    answer: "If your birthday falls exactly on the reference date, the tool shows <strong>'Today!'</strong> to indicate you are celebrating a birthday on that day.",
  },
  {
    question: "What is a leap year and how does it affect age?",
    answer: "<strong>Leap years</strong> occur every four years and contain an extra day — February 29. If you were born on February 29, the tool counts your birthday on February 28 in non-leap years to ensure a fair age calculation.",
  },
  {
    question: "Can I use this to calculate the age of something other than a person?",
    answer: "Absolutely. The tool works for any date-based age calculation — buildings, companies, pets, or any event. Simply enter the <strong>founding or creation date</strong> as the birthdate and set the reference date to today or any other point in time.",
  },
  {
    question: "Why might my age in weeks differ from what I expect?",
    answer: "The <strong>total weeks</strong> figure is calculated from the exact number of days lived divided by 7, rounded down. Because months have different lengths, the week count may not align perfectly with simple year-based estimates.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "How Age Is Measured",
    content: `<p>Age is typically measured in <strong>completed years</strong> — the number of full anniversaries that have passed since a birth date. A person born on March 15, 2000 does not turn 25 until March 15, 2025, even if they are only one day away. Beyond years, age can also be expressed in <strong>months, weeks, or total days</strong>, which is especially useful for tracking the age of infants, documents, or projects where year-level precision is not enough.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Age calculators are used across many fields:</p>
<ul>
<li><strong>Legal and eligibility checks</strong> — verifying minimum age for voting, driving, or retirement benefits.</li>
<li><strong>Medical contexts</strong> — tracking patient age in years and months for dosage or developmental assessments.</li>
<li><strong>HR and employment</strong> — calculating length of service in years and months for payroll or benefits.</li>
<li><strong>Personal milestones</strong> — finding out how many days until a milestone birthday or anniversary.</li>
</ul>`,
  },
  {
    title: "Tips for Accurate Results",
    content: `<p>For the most accurate age calculation, always enter your <strong>full date of birth</strong> including the year. When checking age eligibility for a future date (for example, whether a child will be old enough to enroll in school), set the <strong>reference date</strong> to the relevant deadline rather than today. Remember that age calculations can vary by jurisdiction — some legal definitions count age differently around the birthday itself.</p>`,
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
