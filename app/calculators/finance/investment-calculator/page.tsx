import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { InvestmentCalculator } from "@/components/tools/calculators/InvestmentCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("investment-calculator");
const tool = TOOLS.find((t) => t.slug === "investment-calculator")!;

const howToSteps = [
  "Enter the <strong>initial investment amount</strong> — the lump sum you plan to invest today. This is your starting principal before any growth is applied.",
  "Enter the <strong>expected annual return rate (%)</strong> — your estimated yearly percentage gain. Consider using a conservative estimate based on your asset class; historical long-term averages vary by investment type.",
  "Enter the <strong>number of years</strong> you plan to hold the investment. The results show your <strong>future value</strong>, <strong>total gain</strong>, <strong>growth multiplier</strong>, and a <strong>year-by-year table</strong> so you can see how the investment builds over time.",
];

const faqs = [
  {
    question: "What formula is used?",
    answer:
      "The calculator uses the <strong>future value formula: FV = PV × (1 + r)^n</strong>, where PV is the present value (your initial investment), r is the annual return rate as a decimal, and n is the number of years. This is the standard formula for projecting the growth of a lump sum investment over time.",
  },
  {
    question: "What annual return rate should I use?",
    answer:
      "The right rate depends entirely on your investment type. As a general reference: <ul><li><strong>Stock market (broad index)</strong> — historically 8–10% nominal annually over long periods</li><li><strong>Balanced funds</strong> — roughly 6–8%</li><li><strong>Fixed deposits / bonds</strong> — 4–7% depending on tenure and prevailing rates</li><li><strong>Cash / savings accounts</strong> — 2–4%</li></ul> Always use a rate you are comfortable defending. For long-term plans, conservative estimates are safer.",
  },
  {
    question: "Does this calculator account for inflation?",
    answer:
      "No — results are shown in <strong>nominal (current rupee/dollar) terms</strong>. To estimate <strong>real purchasing power</strong>, subtract the expected inflation rate from your annual return before entering it. For example, if you expect 10% returns and 5% inflation, enter 5% for an inflation-adjusted projection.",
  },
  {
    question: "What is the difference between lump sum and SIP investing?",
    answer:
      "A <strong>lump sum</strong> means investing all your money at once — this is what this calculator models. A <strong>SIP (Systematic Investment Plan)</strong> means investing a fixed amount every month. Lump sum investing works best when you have a large amount ready and market timing is favourable. Monthly SIPs benefit from <strong>rupee-cost averaging</strong>, reducing the risk of investing at a market peak.",
  },
  {
    question: "How does investment duration affect the outcome?",
    answer:
      "Duration is the most powerful variable in long-term investing. Because growth is <strong>exponential</strong>, the later years of a long investment add far more value than the early years. An investment growing at 10% per year roughly doubles every 7–8 years. Extending from 20 to 30 years can more than double the final corpus compared to stopping at 20 years.",
  },
  {
    question: "Can I use this to calculate returns on fixed deposits?",
    answer:
      "Yes — enter your deposit amount as the initial investment, the <strong>annual interest rate</strong> from your bank, and the deposit tenure in years. If the FD compounds annually, the result will match the bank's maturity amount. For quarterly compounding (common in many FDs), the actual maturity value will be slightly higher.",
  },
  {
    question: "What does the growth multiplier mean?",
    answer:
      "The <strong>growth multiplier</strong> tells you how many times your original investment has grown. A multiplier of 3.5× means your investment tripled and added half again. It is a quick way to see the total power of compounding without looking at absolute rupee amounts.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "How Lump Sum Investment Growth Works",
    content: `<p>When you invest a lump sum, your money grows through <strong>compounding</strong> — each year, you earn returns not just on the original amount but on all the growth accumulated so far. This creates an accelerating curve: the first few years look modest, but the later years add dramatically larger amounts to your balance.</p>
<p>For example, ₹1,00,000 invested at 10% per year grows to ₹1,10,000 after year one (₹10,000 gain). By year twenty, the annual gain is over ₹67,000 — on the same original investment — because the balance has grown to ₹6,72,000. This is the compounding effect in action.</p>`,
  },
  {
    title: "Understanding Your Results",
    content: `<p>The calculator displays several key outputs worth understanding:</p>
<ul>
<li><strong>Future value</strong> — the projected total balance at the end of your chosen period, including all accumulated growth</li>
<li><strong>Total gain</strong> — the difference between the future value and your initial investment; this is the wealth created by the investment</li>
<li><strong>Growth multiplier</strong> — how many times your money has grown (e.g., 4× means your investment quadrupled)</li>
<li><strong>Year-by-year table</strong> — shows the balance at the end of each year, making it easy to see when growth really accelerates</li>
</ul>
<p>Remember these are projections — actual returns vary based on market conditions, fees, and taxes not captured here.</p>`,
  },
  {
    title: "Tips for Accurate Projections",
    content: `<p>To make the most useful projection:</p>
<ul>
<li><strong>Be conservative with your rate</strong> — overestimating returns leads to undersaving; it is better to be pleasantly surprised</li>
<li><strong>Adjust for inflation</strong> — subtract the expected inflation rate from your nominal return for a real-terms view of purchasing power</li>
<li><strong>Ignore taxes in the gross figure</strong> — capital gains taxes will reduce your actual take-home; factor these separately based on your tax bracket</li>
<li><strong>Use multiple scenarios</strong> — run the calculator at 6%, 8%, and 10% to understand the range of possible outcomes</li>
</ul>`,
  },
];

export default function InvestmentCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <InvestmentCalculator />
    </ToolContainer>
  );
}
