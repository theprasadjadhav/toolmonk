import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { TaxCalculator } from "@/components/tools/calculators/TaxCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("tax-calculator");
const tool = TOOLS.find((t) => t.slug === "tax-calculator")!;

const howToSteps = [
  "Enter your <strong>gross annual income</strong> — your total earnings before any deductions or taxes are applied. Then select your <strong>filing status</strong> (Single or Married Filing Jointly), which determines both your standard deduction and the tax brackets used.",
  "The <strong>standard deduction</strong> is automatically applied to calculate your <strong>taxable income</strong>. The results show your estimated federal tax, <strong>effective tax rate</strong> (average rate on all income), and <strong>marginal tax rate</strong> (rate on your last dollar).",
  "Scroll to the <strong>bracket-by-bracket breakdown</strong> to see exactly how much of your income falls into each tax band and the precise tax due at each level — making the progressive tax system completely transparent.",
];

const faqs = [
  {
    question: "What tax year do these brackets apply to?",
    answer:
      "This calculator uses <strong>2024 US federal income tax brackets</strong>. The standard deduction is <strong>$14,600 for Single filers</strong> and <strong>$29,200 for Married Filing Jointly</strong>. Tax brackets and deduction amounts are adjusted annually for inflation by the IRS.",
  },
  {
    question: "What is the difference between effective and marginal tax rate?",
    answer:
      "Your <strong>marginal tax rate</strong> is the rate applied to the last dollar of your income — the highest bracket you fall into. Your <strong>effective tax rate</strong> is total tax paid divided by gross income — the true average rate you pay across all your income. Because the US uses a <strong>progressive system</strong>, your effective rate is always lower than your marginal rate.",
  },
  {
    question: "Does this include state taxes?",
    answer:
      "No — this calculator estimates <strong>federal income tax only</strong>. State income tax rates vary widely across the US, from 0% in states like Texas and Florida to over 13% for high earners in California. Use the <strong>Salary Calculator</strong> for an estimate that combines federal and state taxes to show your full take-home pay.",
  },
  {
    question: "Why is only the standard deduction applied?",
    answer:
      "The <strong>standard deduction</strong> is the most common deduction and applies automatically to the majority of filers — no documentation required. If you <strong>itemize deductions</strong> (mortgage interest, state taxes paid, charitable donations, medical expenses), your taxable income would be lower, reducing your federal tax. In that case, subtract your total itemized deductions from gross income before entering it.",
  },
  {
    question: "What is a progressive tax system?",
    answer:
      "A <strong>progressive tax system</strong> applies higher rates only to the portions of income that exceed each threshold — not to your entire income. If you earn $60,000 as a single filer, only the income above each bracket threshold is taxed at that bracket's rate. Your first dollars are taxed at the lowest rate; only the final dollars are taxed at the highest rate. This is why your <strong>effective rate is always lower than your marginal rate</strong>.",
  },
  {
    question: "What is the standard deduction?",
    answer:
      "The <strong>standard deduction</strong> is a fixed amount the IRS allows every taxpayer to subtract from gross income before calculating tax. It simplifies filing by eliminating the need to track individual deductions. For 2024: <strong>$14,600 (Single)</strong> and <strong>$29,200 (Married Filing Jointly)</strong>. If your itemized deductions exceed this amount, itemizing saves more tax.",
  },
  {
    question: "Does this include the Alternative Minimum Tax (AMT)?",
    answer:
      "No — this calculator estimates <strong>regular federal income tax only</strong>. The <strong>Alternative Minimum Tax (AMT)</strong> is a separate parallel calculation that applies primarily to higher-income individuals with significant deductions. If AMT applies to you, your actual tax may be higher than the regular calculation shown here.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "How the US Federal Income Tax Works",
    content: `<p>The US uses a <strong>progressive federal income tax system</strong>, which means different portions of your income are taxed at different rates — higher rates apply only to the income above each bracket threshold, not to your entire salary.</p>
<p>For example, if you are a single filer earning $80,000, you do not pay 22% on all $80,000. You pay 10% on the first bracket of income, 12% on the next layer, and 22% only on the amount above the 22% threshold. This is why the <strong>effective rate</strong> (what you actually pay as a percentage of total income) is always lower than the <strong>marginal rate</strong> (the rate on your top dollar).</p>`,
  },
  {
    title: "Understanding Your Tax Results",
    content: `<p>The calculator surfaces several important figures:</p>
<ul>
<li><strong>Taxable income</strong> — gross income minus the standard deduction; this is the base on which your actual tax is computed</li>
<li><strong>Estimated federal tax</strong> — the total tax due based on applying the bracket rates to your taxable income</li>
<li><strong>Effective tax rate</strong> — total tax divided by gross income; the true average burden; useful for comparing across income levels</li>
<li><strong>Marginal tax rate</strong> — the rate on your last dollar of income; relevant for decisions about earning additional income or taking deductions</li>
</ul>
<p>The bracket breakdown table shows exactly how income is allocated across rates, making the calculation fully auditable.</p>`,
  },
  {
    title: "Tips for Reducing Your Tax Burden",
    content: `<p>While this calculator shows your estimated tax under standard assumptions, several strategies can legally reduce your actual federal tax:</p>
<ul>
<li><strong>Pre-tax retirement contributions</strong> — 401(k), 403(b), and traditional IRA contributions reduce your taxable income</li>
<li><strong>Health Savings Account (HSA)</strong> — contributions are deductible and withdrawals for medical expenses are tax-free</li>
<li><strong>Itemizing deductions</strong> — if mortgage interest, state taxes, and charitable giving exceed the standard deduction, itemizing lowers taxable income</li>
<li><strong>Tax credits</strong> — credits like the Child Tax Credit or education credits reduce tax owed directly, dollar for dollar</li>
</ul>`,
  },
];

export default function TaxCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <TaxCalculator />
    </ToolContainer>
  );
}
