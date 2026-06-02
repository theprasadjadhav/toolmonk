import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { RetirementCalculator } from "@/components/tools/calculators/RetirementCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("retirement-calculator");
const tool = TOOLS.find((t) => t.slug === "retirement-calculator")!;

const howToSteps = [
  "Enter your <strong>current age</strong> and <strong>target retirement age</strong> to set the savings window. Then enter your <strong>current monthly expenses</strong> — this is what the calculator uses to estimate your future spending needs.",
  "Set the <strong>expected inflation rate</strong> (the rate at which prices rise each year) and the <strong>expected annual return</strong> on your investments. These two rates together determine how large a corpus you need and how quickly your savings can grow to reach it.",
  "The calculator shows the <strong>total retirement corpus required</strong> and the <strong>monthly savings needed starting today</strong> to reach that goal — giving you a clear, actionable target for your financial plan.",
];

const faqs = [
  {
    question: "How is the retirement corpus calculated?",
    answer:
      "Your <strong>current monthly expenses</strong> are compounded forward at the inflation rate to estimate what those same expenses will cost at retirement age. The annual expense at retirement is then divided by the <strong>real rate of return</strong> (investment return minus inflation) to arrive at the corpus — the lump sum that, when invested, can sustain those withdrawals indefinitely without depleting itself.",
  },
  {
    question: "What is the 4% rule?",
    answer:
      "The <strong>4% rule</strong> is a widely cited retirement planning guideline suggesting that you can safely withdraw 4% of your corpus per year without running out of money over a 30-year retirement. It implies you need a corpus of <strong>25 times your annual expenses</strong>. This calculator uses a similar perpetuity approach, adjusted for the real rate of return.",
  },
  {
    question: "Why does inflation matter so much for retirement?",
    answer:
      "Inflation <strong>erodes purchasing power</strong> over time. What costs ₹30,000/month today could require ₹90,000+/month in 30 years at 4% annual inflation. Failing to account for inflation is one of the most common retirement planning mistakes — it causes people to significantly underestimate how much they actually need to save.",
  },
  {
    question: "How accurate is this calculator?",
    answer:
      "It provides a <strong>planning estimate</strong> based on constant assumed rates of inflation and return. In practice, both vary year to year, and actual expenses in retirement may differ from today's expenses. Use it to establish a <strong>savings target and direction</strong>, and revisit your plan annually. For a detailed, personalised strategy, consider working with a qualified financial planner.",
  },
  {
    question: "What is the difference between the corpus needed and monthly savings?",
    answer:
      "The <strong>corpus needed</strong> is the total amount you must have accumulated by your retirement date — the nest egg that will fund your lifestyle from retirement onwards. The <strong>monthly savings</strong> figure is how much you need to set aside each month from today, assuming it earns the expected return, to accumulate exactly that corpus by your retirement date.",
  },
  {
    question: "Should I account for pension or Social Security income?",
    answer:
      "This calculator estimates the <strong>total corpus required</strong> to self-fund retirement expenses. If you expect regular pension income, provident fund payouts, or government benefits, subtract that monthly amount from your monthly expenses before entering it. This gives a more accurate picture of the gap your personal savings need to fill.",
  },
  {
    question: "What return rate should I use?",
    answer:
      "Use a rate you are confident your investment portfolio can realistically achieve over the long term. Common reference points: <ul><li><strong>Conservative (mostly debt/bonds)</strong> — 6–7%</li><li><strong>Balanced (mix of equity and debt)</strong> — 8–10%</li><li><strong>Equity-heavy portfolio</strong> — 10–12%</li></ul> Always pair your chosen return rate with a realistic inflation estimate (typically 5–7% for long-term planning).",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is a Retirement Corpus?",
    content: `<p>A <strong>retirement corpus</strong> is the total pool of savings and investments you need to have accumulated by the time you stop working. It is the financial reservoir that replaces your employment income and funds your day-to-day expenses for the rest of your life.</p>
<p>The size of this corpus depends on three factors: <strong>how much you spend each month</strong>, <strong>how long your retirement will last</strong>, and <strong>the return your invested corpus generates</strong> relative to inflation. A well-sized corpus invested wisely can sustain withdrawals indefinitely without running out — the goal of sound retirement planning.</p>`,
  },
  {
    title: "Why Inflation is the Biggest Retirement Risk",
    content: `<p><strong>Inflation</strong> silently erodes the purchasing power of money over time. A lifestyle that costs ₹50,000/month today at 5% annual inflation will cost roughly ₹2,16,000/month in 30 years. This means retirement feels much more expensive than people expect when they begin planning in their 20s or 30s.</p>
<p>The two most important steps to counter inflation risk:</p>
<ul>
<li><strong>Start saving early</strong> — every year of delay requires significantly higher monthly contributions to reach the same corpus</li>
<li><strong>Invest in growth assets</strong> — keeping retirement savings in low-interest deposits may not keep pace with inflation over decades</li>
</ul>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>This calculator is useful at multiple life stages:</p>
<ul>
<li><strong>Early career planning</strong> — find out how much to save monthly in your 20s to retire comfortably</li>
<li><strong>Mid-career check-in</strong> — assess whether your current savings rate will meet your retirement target</li>
<li><strong>Pre-retirement review</strong> — verify if your accumulated corpus is sufficient or if adjustments are needed</li>
<li><strong>Scenario planning</strong> — compare early retirement (e.g., age 50) vs. standard retirement (age 60) to understand the cost difference</li>
<li><strong>Expense impact analysis</strong> — see how reducing monthly expenses today lowers the corpus required and the monthly savings needed</li>
</ul>`,
  },
];

export default function RetirementCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <RetirementCalculator />
    </ToolContainer>
  );
}
