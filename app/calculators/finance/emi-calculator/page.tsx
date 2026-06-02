import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { EmiCalculator } from "@/components/tools/calculators/EmiCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("emi-calculator");
const tool = TOOLS.find((t) => t.slug === "emi-calculator")!;

const howToSteps = [
  "Enter your <strong>loan amount</strong> — the total sum you are borrowing. This is the principal before any interest is applied.",
  "Enter the <strong>annual interest rate</strong> offered by your lender, then set the <strong>loan tenure</strong> in years or months. A longer tenure lowers the monthly EMI but increases the total interest paid.",
  "Instantly see your <strong>monthly EMI</strong>, <strong>total interest payable</strong>, <strong>total repayment amount</strong>, and a <strong>principal vs. interest breakdown</strong> that shows how much of your payments go to the bank versus repaying the loan.",
];

const faqs = [
  {
    question: "What is an EMI?",
    answer:
      "<strong>EMI</strong> stands for Equated Monthly Instalment — a fixed payment you make every month to repay a loan over a chosen period. Each instalment covers a portion of the <strong>principal</strong> (the original loan) and a portion of the <strong>interest</strong>. In early months, most of the EMI goes toward interest; over time, more goes toward reducing the principal.",
  },
  {
    question: "How is EMI calculated?",
    answer:
      "The standard formula is <strong>EMI = P × r(1+r)^n / [(1+r)^n − 1]</strong>, where P is the loan principal, r is the monthly interest rate (annual rate ÷ 12 ÷ 100), and n is the total number of monthly instalments. This formula ensures equal payments every month while fully repaying the loan by the end of the tenure.",
  },
  {
    question: "Does a longer tenure reduce EMI?",
    answer:
      "Yes — a <strong>longer tenure</strong> spreads repayment over more months, which lowers each individual EMI. However, you pay interest for a longer period, so the <strong>total interest cost increases</strong>. A shorter tenure means a higher monthly payment but substantially less interest paid overall.",
  },
  {
    question: "Is this calculator suitable for home, car, and personal loans?",
    answer:
      "Yes — the EMI formula applies equally to all <strong>fixed-rate loans</strong>, including home loans, car loans, personal loans, and education loans. Simply enter the correct loan amount, the interest rate quoted by your lender, and the agreed tenure.",
  },
  {
    question: "What is the difference between flat rate and reducing balance interest?",
    answer:
      "A <strong>flat rate</strong> calculates interest on the full original principal throughout the loan, so the effective cost is higher. A <strong>reducing balance</strong> (used in most bank loans) calculates interest only on the outstanding principal each month — the amount owed decreases with each payment, so interest charges fall over time. This calculator uses the reducing balance method.",
  },
  {
    question: "How can I reduce my total interest outgo?",
    answer:
      "There are a few practical strategies: <ul><li><strong>Make a larger down payment</strong> to reduce the principal</li><li><strong>Shorten the tenure</strong> if your monthly budget allows a higher EMI</li><li><strong>Make prepayments</strong> when possible — extra lump-sum payments reduce the principal faster and cut future interest</li><li><strong>Negotiate a lower interest rate</strong> by comparing lenders or improving your credit score</li></ul>",
  },
  {
    question: "Does the EMI stay the same throughout the loan?",
    answer:
      "For <strong>fixed-rate loans</strong>, yes — the EMI amount stays constant for the entire tenure. For <strong>floating-rate loans</strong>, the EMI may change periodically if the benchmark interest rate changes. This calculator assumes a fixed rate.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is an EMI and How Does It Work?",
    content: `<p>An <strong>Equated Monthly Instalment (EMI)</strong> is a structured loan repayment where you pay the same fixed amount every month until the loan is fully repaid. Each payment is split between reducing the <strong>outstanding principal</strong> and covering the <strong>interest due</strong> for that month.</p>
<p>In the early months of a loan, the interest component is high because the outstanding balance is large. As each EMI chips away at the principal, the interest portion shrinks and more of your payment goes toward the principal. This gradual shift is called <strong>amortization</strong>. By the final payment, almost the entire EMI is principal repayment.</p>`,
  },
  {
    title: "Understanding Your EMI Breakdown",
    content: `<p>When you look at your EMI results, three numbers matter most:</p>
<ul>
<li><strong>Monthly EMI</strong> — what you pay each month; plan this against your monthly income to ensure affordability</li>
<li><strong>Total interest payable</strong> — the true cost of borrowing; this is the extra amount you pay the lender beyond the original loan</li>
<li><strong>Total repayment</strong> — principal plus all interest; this is the full amount that leaves your pocket over the loan tenure</li>
</ul>
<p>A good rule of thumb is to keep your total EMI obligations (all loans combined) below <strong>40–50% of your monthly take-home income</strong> to maintain financial comfort.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Use this EMI calculator whenever you are evaluating or managing a loan:</p>
<ul>
<li><strong>Home loan planning</strong> — check if the monthly instalment fits your budget before applying</li>
<li><strong>Car loan comparison</strong> — compare EMIs across different loan amounts, rates, and tenures</li>
<li><strong>Personal loan decisions</strong> — understand the real cost of a quick personal loan before committing</li>
<li><strong>Education loan estimates</strong> — project monthly repayments after the moratorium period ends</li>
<li><strong>Refinancing analysis</strong> — see how a lower interest rate or shorter tenure affects your monthly outgo</li>
</ul>`,
  },
];

export default function EmiCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <EmiCalculator />
    </ToolContainer>
  );
}
