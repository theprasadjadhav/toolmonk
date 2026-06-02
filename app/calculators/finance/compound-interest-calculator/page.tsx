import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { CompoundInterestCalculator } from "@/components/tools/calculators/CompoundInterestCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("compound-interest-calculator");
const tool = TOOLS.find((t) => t.slug === "compound-interest-calculator")!;

const howToSteps = [
  "Enter your <strong>principal amount</strong> — the starting sum of money you are investing or depositing. This is the base on which all interest is calculated.",
  "Enter the <strong>annual interest rate</strong> and the <strong>number of years</strong> you want the money to grow. Then choose a <strong>compounding frequency</strong> — monthly compounding will yield a higher result than annual compounding because interest is reinvested more often.",
  "Review the <strong>final amount</strong>, <strong>total interest earned</strong>, and the <strong>year-by-year growth table</strong> to see exactly how your balance builds over time.",
];

const faqs = [
  {
    question: "What is compound interest?",
    answer:
      "<strong>Compound interest</strong> is interest calculated on both the initial principal and the interest accumulated in previous periods. Unlike simple interest, which only grows the original amount, compound interest causes your balance to grow at an accelerating rate — often described as <strong>earning interest on interest</strong>. The longer the time horizon, the more dramatic this effect becomes.",
  },
  {
    question: "How does compounding frequency affect the result?",
    answer:
      "More frequent compounding — such as <strong>monthly versus annually</strong> — results in a higher final balance because interest is added to the principal more often, and that additional interest begins earning its own interest sooner. The difference is small over short periods but becomes meaningful over decades.",
  },
  {
    question: "What is the Rule of 72?",
    answer:
      "The <strong>Rule of 72</strong> is a quick mental shortcut: divide 72 by the annual interest rate to estimate how many years it takes to double your money. For example, at an 8% annual return, your money roughly doubles in <strong>72 ÷ 8 = 9 years</strong>. It is a useful sanity check when planning long-term investments.",
  },
  {
    question: "Why does compound interest grow so much faster than simple interest?",
    answer:
      "With <strong>compound interest</strong>, each period you earn returns on a larger base because previous interest has been added to the principal. This creates <strong>exponential growth</strong> that accelerates over time. Over 30+ years, the gap between compound and simple interest on the same principal can be enormous — often many times the original amount.",
  },
  {
    question: "What is the difference between nominal and effective interest rate?",
    answer:
      "The <strong>nominal rate</strong> is the stated annual rate before compounding is applied. The <strong>effective annual rate (EAR)</strong> accounts for how often compounding occurs and represents the true annual growth. For example, a 12% nominal rate compounded monthly produces an effective rate of about <strong>12.68%</strong> — slightly higher because of mid-year compounding.",
  },
  {
    question: "Can I use this calculator for savings accounts and fixed deposits?",
    answer:
      "Yes. Enter your <strong>deposit amount</strong> as the principal, your bank's stated interest rate, and select the compounding frequency matching your account terms (monthly for most savings accounts, quarterly for many fixed deposits). The result shows exactly how much your deposit will grow by maturity.",
  },
  {
    question: "Does this calculator include regular contributions?",
    answer:
      "This calculator focuses on a <strong>one-time lump sum investment</strong>. If you plan to invest a fixed amount every month, use the <strong>SIP Calculator</strong> instead, which handles recurring periodic contributions and shows the compounded result over time.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is Compound Interest?",
    content: `<p><strong>Compound interest</strong> is the process of earning returns not just on your original investment, but also on the interest that has already been added to it. Each compounding period, your balance grows — and a larger balance means more interest in the next period. This self-reinforcing cycle is why compound interest is often called the most powerful force in personal finance.</p>
<p>The core formula is <strong>A = P(1 + r/n)^(nt)</strong>, where P is the principal, r is the annual interest rate (as a decimal), n is the number of compounding periods per year, and t is time in years. The result A is your total balance including interest.</p>`,
  },
  {
    title: "How Compounding Frequency Works",
    content: `<p>The same annual interest rate produces different final balances depending on <strong>how often interest is compounded</strong>. Here is why: when interest is compounded monthly, each month's interest is added to the principal and immediately starts earning more interest. Annually compounded interest waits a full year before that happens.</p>
<p>Common compounding options and their practical uses:</p>
<ul>
<li><strong>Annually</strong> — some bonds and fixed deposits</li>
<li><strong>Semi-annually</strong> — many government bonds</li>
<li><strong>Quarterly</strong> — some savings accounts and FDs</li>
<li><strong>Monthly</strong> — most bank savings accounts and mortgages</li>
</ul>
<p>The difference in final value between annual and monthly compounding grows significantly as the time horizon extends beyond 10–20 years.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>This calculator is useful in several everyday financial planning scenarios:</p>
<ul>
<li><strong>Fixed deposit planning</strong> — find out exactly how much a lump sum will be worth at maturity</li>
<li><strong>Long-term investment projection</strong> — model how a one-time investment in stocks, bonds, or funds grows over decades</li>
<li><strong>Goal-based savings</strong> — work backwards to find how much principal you need today to reach a target amount by a future date</li>
<li><strong>Debt growth estimation</strong> — understand how credit card or loan balances compound if left unpaid</li>
<li><strong>Education planning</strong> — estimate how a lump sum saved today grows by the time a child reaches college age</li>
</ul>`,
  },
];

export default function CompoundInterestCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <CompoundInterestCalculator />
    </ToolContainer>
  );
}
