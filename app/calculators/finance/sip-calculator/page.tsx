import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { SipCalculator } from "@/components/tools/calculators/SipCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("sip-calculator");
const tool = TOOLS.find((t) => t.slug === "sip-calculator")!;

const howToSteps = [
  "Enter your <strong>monthly investment amount</strong> — the fixed sum you plan to invest every month. Even modest amounts grow significantly over long periods due to compounding.",
  "Enter the <strong>expected annual return rate (%)</strong> based on your chosen investment type, and set the <strong>investment period in years</strong>. Longer periods dramatically increase the final corpus due to the compounding effect.",
  "View your <strong>total amount invested</strong>, <strong>estimated returns</strong>, <strong>total corpus</strong>, and a <strong>year-by-year growth table</strong> that shows how your wealth builds step by step.",
];

const faqs = [
  {
    question: "What is a SIP?",
    answer:
      "A <strong>SIP (Systematic Investment Plan)</strong> is a method of investing a fixed amount at regular intervals — typically monthly — rather than in a single lump sum. It is one of the most popular ways to build long-term wealth because it enforces <strong>financial discipline</strong>, benefits from <strong>rupee-cost averaging</strong>, and takes full advantage of <strong>compound growth</strong> over time.",
  },
  {
    question: "How is the SIP future value calculated?",
    answer:
      "The formula is <strong>FV = PMT × [(1 + r)^n − 1] / r × (1 + r)</strong>, where PMT is the monthly investment, r is the monthly rate (annual rate ÷ 12 ÷ 100), and n is the total number of months. This is the standard formula for the future value of a series of equal periodic payments (an annuity due).",
  },
  {
    question: "Why does starting early matter so much in SIP?",
    answer:
      "Because SIP returns are driven by <strong>compounding</strong>, starting just 5 years earlier can significantly change the final outcome — sometimes nearly doubling the corpus for the same monthly amount. The returns from early investments have more time to compound, and each year of delay means not just less investment but less time for existing investments to grow.",
  },
  {
    question: "Is this calculator suitable for mutual fund SIP planning?",
    answer:
      "Yes — it gives a reliable estimate for planning purposes. Actual mutual fund returns vary based on market performance and the specific fund. Use a <strong>conservative rate (8–10%)</strong> for long-term equity fund planning to allow for market volatility. Your actual results may be higher or lower.",
  },
  {
    question: "What is rupee-cost averaging?",
    answer:
      "<strong>Rupee-cost averaging</strong> means that because you invest the same amount every month, you automatically buy more units when prices are low and fewer when prices are high. Over time, this lowers your average cost per unit compared to investing a lump sum at a single point in time — reducing the impact of market volatility on your overall returns.",
  },
  {
    question: "Can I increase my SIP amount over time?",
    answer:
      "This calculator assumes a <strong>fixed monthly investment</strong> throughout the period. In practice, many investors use a <strong>step-up SIP</strong> — increasing the monthly amount each year (often by 10–15%) as their income grows. A step-up SIP typically results in a significantly larger corpus than a flat SIP at the same starting amount.",
  },
  {
    question: "How is SIP different from a lump sum investment?",
    answer:
      "A <strong>SIP</strong> spreads investment over time in regular instalments, which reduces timing risk and suits investors with regular income. A <strong>lump sum</strong> invests all money at once and is better suited when you have a large amount available and markets are at attractive levels. For most salaried individuals, SIP is the practical and lower-risk approach to long-term wealth creation.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is a SIP and How Does It Work?",
    content: `<p>A <strong>Systematic Investment Plan (SIP)</strong> lets you invest a fixed amount every month into a chosen investment vehicle. Instead of trying to time the market with a large one-time investment, SIP spreads purchases over time — you buy more units when prices are low and fewer when prices are high, naturally averaging your cost over the investment horizon.</p>
<p>The real power of SIP comes from <strong>compounding</strong>: each month's investment earns returns, and those returns earn further returns in subsequent months. Over a decade or more, the wealth created by early investments grows disproportionately large compared to later ones, making the <strong>length of the investment period</strong> the single most important variable.</p>`,
  },
  {
    title: "Understanding Your SIP Results",
    content: `<p>The results show three key figures:</p>
<ul>
<li><strong>Total invested</strong> — the sum of all your monthly contributions over the chosen period; this is your actual cash outflow</li>
<li><strong>Estimated returns</strong> — the wealth created purely by growth; the difference between the corpus and what you invested</li>
<li><strong>Total corpus</strong> — everything combined; the lump sum available at the end of the investment period</li>
</ul>
<p>In a well-run long-term SIP, the <strong>returns portion often exceeds the invested amount</strong> — meaning more than half your final wealth was created by compounding rather than your own contributions. The year-by-year table makes this progression visible.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>SIP planning is useful across a wide range of financial goals:</p>
<ul>
<li><strong>Retirement corpus building</strong> — determine the monthly SIP needed to reach a target retirement fund by a specific age</li>
<li><strong>Child education fund</strong> — project how much to invest monthly to cover future education costs</li>
<li><strong>Home down payment</strong> — build a lump sum over 3–5 years for a property purchase</li>
<li><strong>General wealth creation</strong> — estimate the long-term value of a recurring monthly savings habit</li>
<li><strong>Goal comparison</strong> — compare investing ₹5,000 vs. ₹10,000 monthly to see the impact of increasing contributions</li>
</ul>`,
  },
];

export default function SipCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <SipCalculator />
    </ToolContainer>
  );
}
