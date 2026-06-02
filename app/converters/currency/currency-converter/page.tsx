import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { CurrencyConverter } from "@/components/tools/converters/CurrencyConverter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("currency-converter");

const tool = TOOLS.find((t) => t.slug === "currency-converter")!;

const howToSteps = [
  "Enter the <strong>amount</strong> you want to convert in the input field at the top.",
  "Select the <strong>source currency</strong> (the currency you are converting from) using the dropdown.",
  "All 170+ supported currencies update <strong>instantly</strong> — scroll the list to find your target currency.",
  "Click any <strong>currency row</strong> to set it as the new base currency and re-calculate from there.",
  "Hover over any row and click <strong>Copy</strong> to copy the converted value to your clipboard.",
];

const faqs = [
  {
    question: "Where do the exchange rates come from?",
    answer:
      "Rates are fetched live from a daily-updated exchange rate feed sourced from the <strong>European Central Bank</strong> and other major financial data providers. Rates are updated once per day.",
  },
  {
    question: "How many currencies are supported?",
    answer:
      "The converter supports <strong>170+ world currencies</strong>, including all major fiat currencies used by G20 nations, as well as many smaller regional currencies.",
  },
  {
    question: "How accurate are the rates?",
    answer:
      "Rates are <strong>indicative mid-market rates</strong> — the midpoint between the buy and sell price used by financial institutions. For personal travel budgeting or quick estimates, these rates are very useful. For actual financial transactions, always verify the exact rate with your bank or payment provider, as they apply their own margins.",
  },
  {
    question: "Does this work offline?",
    answer:
      "The tool requires an <strong>internet connection</strong> to fetch current exchange rates. If rates cannot be loaded, the tool will display an error.",
  },
  {
    question: "What is a mid-market rate?",
    answer:
      "The <strong>mid-market rate</strong> (also called the interbank rate) is the midpoint between the buy and sell prices banks use when trading currency with each other. It is considered the fairest benchmark rate, but the rate you actually get when exchanging money will include a spread or fee applied by your bank or exchange service.",
  },
  {
    question: "How often do exchange rates change?",
    answer:
      "Currency markets operate 24 hours a day on weekdays, with rates fluctuating continuously. The rates shown here are <strong>updated once per day</strong> and represent a daily snapshot. For real-time trading rates, use a financial data service.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Understanding Exchange Rates",
    content: `<p>An <strong>exchange rate</strong> tells you how much of one currency you need to buy one unit of another. For example, an exchange rate of 1.10 for USD/EUR means one US dollar buys 1.10 euros.</p><p>Exchange rates are set by global currency markets and fluctuate constantly based on economic data, interest rate decisions, geopolitical events, and trade flows. The rate you see on this tool is the <strong>mid-market rate</strong> — a neutral benchmark that does not include the fees charged by banks or currency exchange services.</p>`,
  },
  {
    title: "Mid-Market Rate vs. Bank Rate",
    content: `<p>There is often a gap between the mid-market rate and the rate you are offered when exchanging money:</p><ul><li><strong>Mid-market rate</strong> — the theoretical fair-value rate, used as a reference benchmark</li><li><strong>Bank rate</strong> — includes a markup (spread) that is the bank's profit margin, typically 1–3% above mid-market</li><li><strong>Airport / bureau de change rate</strong> — often the least favorable, with spreads of 5% or more</li><li><strong>International transfer services</strong> — typically offer rates closer to mid-market with a small transparent fee</li></ul><p>Use this tool for budgeting and comparison — always confirm the exact rate with your provider before transferring money.</p>`,
  },
  {
    title: "Common Use Cases for Currency Conversion",
    content: `<p>A currency converter is useful in many everyday situations:</p><ul><li><strong>Travel planning</strong> — estimate your spending budget in the local currency before a trip</li><li><strong>Online shopping</strong> — understand the true cost of a purchase priced in a foreign currency</li><li><strong>International invoicing</strong> — convert amounts for cross-border business transactions</li><li><strong>Comparing prices</strong> — evaluate whether a product is cheaper in another country after currency conversion</li></ul>`,
  },
];

export default function CurrencyConverterPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <CurrencyConverter />
    </ToolContainer>
  );
}
