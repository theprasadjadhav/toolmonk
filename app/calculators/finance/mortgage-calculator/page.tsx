import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { MortgageCalculator } from "@/components/tools/calculators/MortgageCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("mortgage-calculator");
const tool = TOOLS.find((t) => t.slug === "mortgage-calculator")!;

const howToSteps = [
  "Enter the <strong>home price</strong> and your <strong>down payment percentage</strong>. The down payment amount in currency is calculated automatically so you can see exactly how much cash you need upfront.",
  "Enter the <strong>annual interest rate</strong> and select a <strong>loan term</strong> — 10, 15, 20, or 30 years are provided as presets, or type any custom term. Shorter terms have higher monthly payments but dramatically lower total interest.",
  "Your <strong>monthly principal and interest payment</strong> appears instantly, along with a full <strong>amortization schedule</strong> showing how each year's payments are split between principal reduction and interest.",
];

const faqs = [
  {
    question: "What is included in the monthly payment?",
    answer:
      "This calculator shows the <strong>principal and interest (P&I)</strong> portion of your monthly payment — the core repayment of your loan. It does not include <strong>property taxes</strong>, <strong>homeowner's insurance</strong>, or <strong>Private Mortgage Insurance (PMI)</strong>, which your lender typically collects as part of your total monthly payment. Add these separately based on your location and loan terms.",
  },
  {
    question: "What is a good down payment?",
    answer:
      "The conventional target is <strong>20%</strong> — this avoids Private Mortgage Insurance (PMI), reduces your loan balance, and typically secures better interest rates. However, many loan programmes accept <strong>3–10% down</strong> with PMI added until you reach 20% equity. A larger down payment always lowers the monthly payment and total interest paid.",
  },
  {
    question: "What is an amortization schedule?",
    answer:
      "An <strong>amortization schedule</strong> is a complete table of every payment over the loan's life, showing how each is split between <strong>principal reduction</strong> and <strong>interest</strong>. In the early years, the majority of each payment is interest. By the final years, almost all of each payment reduces the principal balance. Reviewing it helps you understand how equity builds over time.",
  },
  {
    question: "Should I choose a 15-year or 30-year mortgage?",
    answer:
      "A <strong>15-year mortgage</strong> typically carries a lower interest rate, builds equity faster, and costs significantly less in total interest — but the monthly payment is considerably higher. A <strong>30-year mortgage</strong> offers a lower, more affordable monthly payment but results in much more total interest paid over the life of the loan. Your choice depends on your monthly cash flow and long-term financial goals.",
  },
  {
    question: "What is PMI and when is it required?",
    answer:
      "<strong>Private Mortgage Insurance (PMI)</strong> is required by most lenders when your down payment is less than 20% of the home's purchase price. It protects the lender (not you) if you default. PMI typically costs <strong>0.5–1.5% of the loan amount per year</strong>, added to your monthly payment. Once your equity reaches 20%, you can usually request PMI cancellation.",
  },
  {
    question: "How does the interest rate affect my total cost?",
    answer:
      "Even a small difference in mortgage rate has a large impact over a 15 or 30-year term. On a large mortgage, a <strong>0.5% lower rate</strong> can save tens of thousands in total interest. This is why shopping multiple lenders, improving your credit score, and timing your application to favourable rate environments can make a significant financial difference.",
  },
  {
    question: "Can I pay off my mortgage early?",
    answer:
      "Yes — making <strong>extra principal payments</strong> reduces the outstanding balance faster, cutting interest charged in future months and shortening the overall loan term. Even one extra payment per year can shave years off a 30-year mortgage. Check your loan agreement for any <strong>prepayment penalties</strong> before making large extra payments.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "How a Mortgage Works",
    content: `<p>A <strong>mortgage</strong> is a long-term secured loan used to purchase property. The home itself serves as collateral — meaning the lender can reclaim it if you stop making payments. You repay the loan in fixed <strong>monthly instalments</strong> over a term that typically ranges from 10 to 30 years.</p>
<p>Each monthly payment covers two things: the <strong>interest</strong> charged on the outstanding balance, and a reduction in the <strong>principal</strong> (the amount you still owe). Early in the mortgage, most of your payment is interest. As the loan matures, each payment chips away more principal, and the interest portion shrinks. By the final payment, the loan is fully repaid and you own the property outright.</p>`,
  },
  {
    title: "Understanding Amortization",
    content: `<p><strong>Amortization</strong> is the process of spreading loan repayment across equal monthly payments so the loan reaches a zero balance exactly at the end of the term. Even though your payment stays the same each month, what is happening inside it changes dramatically over time:</p>
<ul>
<li><strong>Early years</strong> — most of each payment covers interest; your equity builds slowly</li>
<li><strong>Mid-term</strong> — roughly half goes to principal, half to interest; equity growth accelerates</li>
<li><strong>Final years</strong> — the vast majority of each payment reduces the principal; equity grows rapidly</li>
</ul>
<p>The amortization schedule in this calculator lets you view this split year by year for the full loan term.</p>`,
  },
  {
    title: "Tips for Accurate Mortgage Planning",
    content: `<p>This calculator gives you the core payment estimate. For a complete picture, also factor in:</p>
<ul>
<li><strong>Property taxes</strong> — typically 0.5–2.5% of home value per year, often collected monthly by the lender</li>
<li><strong>Homeowner's insurance</strong> — required by lenders; usually $100–200/month depending on location and coverage</li>
<li><strong>PMI</strong> — added if your down payment is below 20%; typically 0.5–1.5% of the loan per year</li>
<li><strong>HOA fees</strong> — applicable if the property is in a managed community</li>
<li><strong>Maintenance reserve</strong> — set aside 1–2% of home value annually for upkeep and repairs</li>
</ul>`,
  },
];

export default function MortgageCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <MortgageCalculator />
    </ToolContainer>
  );
}
