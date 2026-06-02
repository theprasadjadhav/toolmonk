import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { SimpleInterestCalculator } from "@/components/tools/calculators/SimpleInterestCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("interest-calculator");
const tool = TOOLS.find((t) => t.slug === "interest-calculator")!;

const howToSteps = [
  "Enter the <strong>principal amount (P)</strong> — the starting balance, deposit, or loan amount on which interest will be calculated.",
  "Enter the <strong>annual interest rate (R%)</strong> — the yearly percentage your lender or bank applies. Then enter the <strong>time period in years (T)</strong>; decimals are accepted for partial years (e.g., 0.5 for 6 months).",
  "The <strong>simple interest amount</strong>, <strong>total balance</strong> (principal + interest), and the full calculation formula are shown instantly so you can verify each step.",
];

const faqs = [
  {
    question: "What is simple interest?",
    answer:
      "<strong>Simple interest</strong> is calculated only on the original principal — not on any previously earned interest. The formula is <strong>I = P × R × T / 100</strong>, where P is the principal, R is the annual rate, and T is time in years. Because it never compounds, it grows in a straight line and is easy to predict.",
  },
  {
    question: "How is simple interest different from compound interest?",
    answer:
      "<strong>Simple interest</strong> is calculated on the original principal only, so the interest amount stays the same every period. <strong>Compound interest</strong> is calculated on the growing balance — principal plus previously earned interest — which accelerates growth over time. For the same rate and period, compound interest always produces a higher total.",
  },
  {
    question: "When is simple interest used in real life?",
    answer:
      "Simple interest is commonly used for <strong>short-term loans</strong>, <strong>auto loans</strong>, some <strong>personal loans</strong>, and <strong>treasury bills</strong>. It is also used in informal lending and certain fixed-term bank deposits that pay interest only at maturity without reinvesting it.",
  },
  {
    question: "Can I use this for a partial year?",
    answer:
      "Yes — enter a <strong>decimal value</strong> for the time period. For example, 6 months = <strong>0.5 years</strong>, 3 months = <strong>0.25 years</strong>, 18 months = <strong>1.5 years</strong>. The formula handles decimals exactly, so results remain accurate for any duration.",
  },
  {
    question: "How do I calculate the interest rate if I know the interest amount?",
    answer:
      "Rearrange the formula: <strong>R = (I × 100) / (P × T)</strong>. If you borrowed ₹10,000 for 2 years and paid ₹1,600 in interest, the rate is (1600 × 100) / (10000 × 2) = <strong>8% per year</strong>. This is useful for checking whether a stated flat rate is accurate.",
  },
  {
    question: "What is the difference between per annum and per month interest rates?",
    answer:
      "A <strong>per annum (p.a.) rate</strong> applies annually and is the standard way banks and lenders quote rates. A <strong>per month rate</strong> is 1/12th of the annual rate. When using this calculator, always enter the <strong>annual rate</strong>. If a lender quotes a monthly rate (e.g., 1.5%/month), multiply by 12 to get the annual rate (18%) before entering it.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is Simple Interest?",
    content: `<p><strong>Simple interest</strong> is the most straightforward way to calculate the cost of borrowing money or the return on a deposit. It is calculated as a fixed percentage of the original principal for each time period — the interest amount stays the same every year and does not get added back to the principal.</p>
<p>The formula is <strong>I = P × R × T / 100</strong>. For example, ₹50,000 at 6% per year for 3 years earns ₹9,000 in interest, making the total balance ₹59,000. Because it grows in a straight line, simple interest is transparent and easy to verify.</p>`,
  },
  {
    title: "Simple Interest vs. Compound Interest",
    content: `<p>The key difference lies in what the interest is calculated on each period:</p>
<ul>
<li><strong>Simple interest</strong> — always calculated on the original principal. Interest earned in year 1 does not affect the interest earned in year 2.</li>
<li><strong>Compound interest</strong> — calculated on the current balance (principal + accumulated interest). Each period, the base grows, so interest charges grow too.</li>
</ul>
<p>For <strong>short-term periods</strong> (under 1–2 years), the difference is small. Over longer periods, the gap widens significantly in favour of compound growth for savings, or against you for debt. Always check which method your bank or lender uses before comparing offers.</p>`,
  },
  {
    title: "Tips for Accurate Results",
    content: `<p>To get the most reliable result from this calculator:</p>
<ul>
<li><strong>Use the annual rate</strong> — if your bank quotes a monthly or quarterly rate, convert it to annual before entering</li>
<li><strong>Use decimal years for short periods</strong> — 90 days = 0.247 years (90 ÷ 365); 6 months = 0.5 years</li>
<li><strong>Verify the method</strong> — confirm with your lender that interest is truly flat/simple, not reducing-balance or compound</li>
<li><strong>Account for fees</strong> — processing fees and charges are not interest but add to the real cost of borrowing; factor them separately</li>
</ul>`,
  },
];

export default function InterestCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <SimpleInterestCalculator />
    </ToolContainer>
  );
}
