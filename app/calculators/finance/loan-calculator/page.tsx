import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { LoanCalculator } from "@/components/tools/calculators/LoanCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("loan-calculator");
const tool = TOOLS.find((t) => t.slug === "loan-calculator")!;

const howToSteps = [
  "Enter the <strong>loan amount</strong> — the total sum you are borrowing. Then enter the <strong>annual interest rate</strong> quoted by your lender.",
  "Set the <strong>loan term</strong> using the years or months toggle. A longer term lowers monthly payments but significantly increases the total interest paid over the life of the loan.",
  "View your <strong>monthly payment</strong>, <strong>total interest</strong>, and <strong>total repayment amount</strong> instantly. Use the copy button to paste the monthly figure directly into a budget spreadsheet.",
];

const faqs = [
  {
    question: "How is the monthly payment calculated?",
    answer:
      "The calculator uses the standard <strong>amortization formula: M = P × r(1+r)^n / [(1+r)^n − 1]</strong>, where P is the loan principal, r is the monthly interest rate (annual rate ÷ 12 ÷ 100), and n is the total number of monthly payments. This produces equal monthly payments that fully repay both principal and interest by the end of the term.",
  },
  {
    question: "What is total interest?",
    answer:
      "<strong>Total interest</strong> is calculated as (monthly payment × number of months) minus the original loan amount. It represents the true <strong>cost of borrowing</strong> — the extra amount you pay beyond what you received. For long-term or high-rate loans, total interest can exceed the original principal.",
  },
  {
    question: "Does a shorter term save money?",
    answer:
      "Yes — a <strong>shorter loan term</strong> increases the monthly payment but dramatically reduces total interest paid, because the principal is repaid faster and interest has less time to accumulate. For example, on a large loan, choosing a 3-year term over a 5-year term can save hundreds or thousands in interest.",
  },
  {
    question: "What types of loans does this cover?",
    answer:
      "This calculator works for any <strong>fixed-rate amortizing loan</strong>, including personal loans, auto loans, and student loans. It does not account for <strong>variable interest rates</strong>, origination fees, balloon payments, or prepayment penalties — factors that can affect the real cost of some loan products.",
  },
  {
    question: "What is an amortizing loan?",
    answer:
      "An <strong>amortizing loan</strong> is one where each payment covers both interest and a portion of the principal, so the balance gradually decreases to zero by the end of the term. In the early months, most of each payment is interest. As the balance falls, more of each payment goes toward principal. By the final payment, the loan is completely paid off.",
  },
  {
    question: "How does interest rate affect total cost?",
    answer:
      "Interest rate has a large compounding effect on total cost over time. On a multi-year loan, even a <strong>1–2% difference in rate</strong> can translate to significant savings or extra costs. This is why comparing lender offers and negotiating your rate — or improving your credit score before applying — pays dividends on larger loans.",
  },
  {
    question: "Should I make extra payments to pay off a loan faster?",
    answer:
      "Making <strong>extra principal payments</strong> is one of the best ways to reduce total interest. Any amount paid above the regular monthly instalment goes directly to reducing the principal balance, which lowers the interest charged in every subsequent month. Even small additional payments made consistently can shorten the loan term and save meaningful amounts.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "How Loan Repayment Works",
    content: `<p>When you take a fixed-rate loan, your lender calculates a <strong>monthly payment</strong> that covers interest and slowly reduces the outstanding balance (principal) over the agreed term. This process is called <strong>amortization</strong>.</p>
<p>In the early months, most of each payment covers interest because the outstanding balance is highest. As the principal decreases, the interest portion shrinks — so more of each subsequent payment goes toward principal repayment. By the very last payment, almost the entire amount clears the remaining balance. The monthly payment amount itself stays constant throughout.</p>`,
  },
  {
    title: "Understanding Your Loan Results",
    content: `<p>Three numbers summarise the full cost of any loan:</p>
<ul>
<li><strong>Monthly payment</strong> — what you commit to paying every month; compare this to your take-home pay to assess affordability</li>
<li><strong>Total interest</strong> — the lender's profit; this is the real price you pay for borrowing the money</li>
<li><strong>Total repayment</strong> — principal plus all interest; the full amount that leaves your account over the loan's lifetime</li>
</ul>
<p>A practical rule: keep all monthly debt payments (loan EMI, credit cards, other obligations) below <strong>35–40% of monthly take-home income</strong> to maintain financial stability.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>This loan calculator is useful for any borrowing decision:</p>
<ul>
<li><strong>Personal loan comparison</strong> — compare offers from multiple lenders by entering different rates and terms side by side</li>
<li><strong>Auto loan planning</strong> — determine how much car you can afford based on a comfortable monthly payment target</li>
<li><strong>Student loan analysis</strong> — estimate post-graduation monthly obligations before accepting a loan</li>
<li><strong>Debt consolidation</strong> — see if combining multiple debts into one loan at a lower rate reduces your monthly burden</li>
<li><strong>Budget planning</strong> — copy the monthly payment figure directly into a budget to assess impact on finances</li>
</ul>`,
  },
];

export default function LoanCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <LoanCalculator />
    </ToolContainer>
  );
}
