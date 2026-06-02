import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { PregnancyDueDateCalculator } from "@/components/tools/calculators/PregnancyDueDateCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("pregnancy-due-date-calculator");
const tool = TOOLS.find((t) => t.slug === "pregnancy-due-date-calculator")!;

const howToSteps = [
  "Choose your <strong>calculation method</strong>: <em>Last menstrual period (LMP)</em> if you know the date your last period started, or <em>Conception date</em> if you have a better idea of when conception occurred.",
  "Enter the relevant <strong>date</strong> using the date picker — you can type the date directly or use the calendar.",
  "Your <strong>estimated due date, current week of pregnancy, trimester, and days remaining</strong> are all displayed instantly.",
];

const faqs = [
  {
    question: "How is the due date calculated from LMP?",
    answer: "Using <strong>Naegele's rule</strong>, the estimated due date (EDD) is calculated by adding <strong>280 days (40 weeks)</strong> to the first day of your last menstrual period. This method assumes a regular 28-day cycle with ovulation occurring on day 14.",
  },
  {
    question: "How accurate is an estimated due date?",
    answer: "Only about <strong>5% of babies</strong> are born on their exact estimated due date. The majority arrive within two weeks before or after the EDD. A <strong>first-trimester ultrasound</strong> is the most accurate way to confirm a due date, as it measures the baby's actual size.",
  },
  {
    question: "When does each trimester begin?",
    answer: "Pregnancy is divided into three trimesters:<ul><li><strong>First trimester</strong> — weeks 1 through 12</li><li><strong>Second trimester</strong> — weeks 13 through 26</li><li><strong>Third trimester</strong> — weeks 27 through 40 (and beyond if overdue)</li></ul>",
  },
  {
    question: "What if I do not know my LMP?",
    answer: "If you know the approximate <strong>conception date</strong>, use that tab instead. The calculator adds 266 days (38 weeks) from conception to estimate the due date. If you are unsure of either date, your healthcare provider can use an <strong>early ultrasound</strong> to establish a more accurate estimate.",
  },
  {
    question: "What does 'week of pregnancy' mean?",
    answer: "<strong>Week of pregnancy</strong> is counted from the first day of your last menstrual period, not from conception. This is why a 40-week pregnancy is actually about 38 weeks from conception. The week count shown in the results follows this standard obstetric convention.",
  },
  {
    question: "Is this calculator a substitute for medical advice?",
    answer: "No. This calculator provides a <strong>general estimate</strong> based on standard rules and is intended as a convenient reference. Always confirm your due date and pregnancy progress with your <strong>healthcare provider or midwife</strong>, who can account for your individual circumstances.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "How Pregnancy Due Dates Are Calculated",
    content: `<p>The most common method for estimating a due date is <strong>Naegele's rule</strong>, which adds 280 days (40 weeks) to the first day of the last menstrual period. This standard has been used in obstetrics for over 200 years and assumes a regular 28-day cycle.</p><p>An alternative is to calculate from the <strong>conception date</strong>, adding 266 days (38 weeks). This method is more direct but requires knowing approximately when conception occurred, which is not always clear.</p>`,
  },
  {
    title: "The Three Trimesters",
    content: `<p>Pregnancy is divided into three roughly equal stages called <strong>trimesters</strong>, each associated with different developmental milestones:</p><ul><li><strong>First trimester (weeks 1–12)</strong> — all major organs begin forming; the risk of miscarriage is highest in this period.</li><li><strong>Second trimester (weeks 13–26)</strong> — the baby grows rapidly and begins to move; many parents find out the sex during this stage.</li><li><strong>Third trimester (weeks 27–40)</strong> — the baby gains weight and prepares for birth; the due date falls at the end of this trimester.</li></ul>`,
  },
  {
    title: "What to Expect Around Your Due Date",
    content: `<p>A full-term pregnancy is considered <strong>39–40 weeks</strong>. Births that occur between 37 and 42 weeks are considered within the normal range. Key points:</p><ul><li>Fewer than 5% of babies arrive on their exact due date.</li><li>Births before 37 weeks are considered <strong>premature</strong>; after 42 weeks is <strong>post-term</strong>.</li><li>Your healthcare provider will monitor you closely in the weeks around your due date and may recommend induction if you go significantly overdue.</li></ul><p>Always rely on your midwife or obstetrician for personalised guidance.</p>`,
  },
];

export default function PregnancyDueDateCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <PregnancyDueDateCalculator />
    </ToolContainer>
  );
}
