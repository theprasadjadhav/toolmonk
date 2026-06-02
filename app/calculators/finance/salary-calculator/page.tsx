import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { SalaryCalculator } from "@/components/tools/calculators/SalaryCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("salary-calculator");
const tool = TOOLS.find((t) => t.slug === "salary-calculator")!;

const howToSteps = [
  "Enter your <strong>annual gross salary (CTC)</strong> — the total compensation package before any deductions. This is the number usually stated in your employment offer letter.",
  "Adjust the <strong>federal and state tax rates</strong> to reflect your actual situation. <strong>Social Security (6.2%)</strong> and <strong>Medicare (1.45%)</strong> are pre-filled as standard FICA rates that apply to most employees.",
  "The <strong>breakdown table</strong> shows each deduction separately so you can see exactly what is being subtracted, along with your <strong>net annual take-home pay</strong> and the equivalent <strong>monthly amount</strong>.",
];

const faqs = [
  {
    question: "What is CTC?",
    answer:
      "<strong>CTC (Cost to Company)</strong> is the total annual compensation package an employer pays, including your base salary plus any benefits, bonuses, and allowances valued as part of the package. It represents what the job costs the employer — not what you actually receive. Your <strong>take-home pay is always lower</strong> than CTC after taxes and other deductions.",
  },
  {
    question: "What are FICA taxes?",
    answer:
      "<strong>FICA taxes</strong> are mandatory US federal payroll taxes that fund Social Security and Medicare programmes. <strong>Social Security</strong> is withheld at 6.2% (up to the annual wage base limit) and <strong>Medicare</strong> at 1.45%, with no income ceiling. These are taken directly from your paycheck before you receive it.",
  },
  {
    question: "How do I find my federal tax rate?",
    answer:
      "Your <strong>effective federal tax rate</strong> is total federal tax divided by gross income. Your <strong>marginal rate</strong> is the rate applied to your last dollar of income. For this calculator, the marginal rate is a reasonable input for the federal tax field. Use the <strong>Tax Calculator</strong> on this site to find your precise effective and marginal rates based on your income and filing status.",
  },
  {
    question: "Does this include retirement contributions like 401(k)?",
    answer:
      "No — this calculator covers standard payroll tax deductions only. <strong>Pre-tax 401(k) or 403(b) contributions</strong> reduce your taxable income before federal and state taxes are applied, which would increase your take-home pay relative to a simple gross-minus-taxes calculation. If you contribute to a retirement plan, your actual take-home may be slightly higher than shown here.",
  },
  {
    question: "What is the difference between gross salary and net salary?",
    answer:
      "<strong>Gross salary</strong> is your total earnings before any deductions — what your employer agrees to pay you. <strong>Net salary</strong> (take-home pay) is what actually hits your bank account after all taxes and deductions are removed. The gap between the two can be 25–40% or more depending on your income level and location.",
  },
  {
    question: "What state tax rate should I enter?",
    answer:
      "State income tax rates vary widely across the US. Some states (e.g., Texas, Florida) have <strong>no state income tax</strong> — enter 0%. Others range from around 2% to over 13% for high earners. Look up your state's current income tax rate or use your most recent pay stub to find the effective rate being withheld.",
  },
  {
    question: "How do I convert an hourly wage to annual salary?",
    answer:
      "Multiply the <strong>hourly rate × 40 hours × 52 weeks = annual gross salary</strong>. For example, $25/hour becomes $52,000/year. Enter this annual figure in the calculator to see the full take-home breakdown. Part-time hours would use the actual weekly hours instead of 40.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is Take-Home Pay?",
    content: `<p><strong>Take-home pay</strong> (also called net pay) is the amount deposited into your bank account after all deductions have been subtracted from your gross salary. These deductions typically include federal income tax, state income tax, Social Security, and Medicare — collectively reducing your gross salary by anywhere from 20% to 40% or more depending on your income and location.</p>
<p>Understanding your take-home pay is essential for budgeting, comparing job offers, and planning major financial commitments. A salary that looks attractive on paper can look very different after deductions.</p>`,
  },
  {
    title: "Understanding Each Deduction",
    content: `<p>Breaking down where your money goes:</p>
<ul>
<li><strong>Federal income tax</strong> — determined by your taxable income and filing status; calculated at progressive bracket rates</li>
<li><strong>State income tax</strong> — varies by state; some states have none, others have flat rates, others use progressive brackets</li>
<li><strong>Social Security (6.2%)</strong> — funds retirement and disability benefits; applies up to the annual wage base cap</li>
<li><strong>Medicare (1.45%)</strong> — funds healthcare for retirees and disabled individuals; no income ceiling</li>
</ul>
<p>Not captured here but also common: health insurance premiums, retirement contributions (401k/403b), and health savings account (HSA) contributions — all of which reduce taxable income and affect take-home.</p>`,
  },
  {
    title: "Tips for Accurate Results",
    content: `<p>To get the most useful take-home estimate:</p>
<ul>
<li><strong>Use your effective tax rate</strong>, not your marginal rate, for the federal field if you want a more accurate total tax figure</li>
<li><strong>Check your state's current rate</strong> — rates change with new legislation; always verify against an official source or your latest pay stub</li>
<li><strong>Add back pre-tax deductions</strong> — 401(k) and health insurance premiums reduce taxable income, so your actual take-home may be higher</li>
<li><strong>Monthly vs. annual view</strong> — divide the annual net by 12 to get a monthly budget figure, or by 26 for bi-weekly paycheck planning</li>
</ul>`,
  },
];

export default function SalaryCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <SalaryCalculator />
    </ToolContainer>
  );
}
