import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { RandomNumberGenerator } from "@/components/tools/generators/RandomNumberGenerator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("random-number-generator");

const tool = TOOLS.find((t) => t.slug === "random-number-generator")!;

const howToSteps = [
  "Set the <strong>minimum and maximum values</strong> that define the range from which numbers will be drawn. Any number within this range (inclusive) may appear in the results.",
  "Enter how many <strong>numbers to generate</strong> (1–1000). Generate a larger set for statistical sampling, simulations, or when you need a full set of values at once.",
  "Set <strong>decimal places</strong> to 0 to generate whole integers, or to a higher number for floating-point values with the specified precision.",
  "Optionally enable <strong>unique numbers</strong> to prevent duplicates — useful for draws, lotteries, and sampling without replacement.",
  "Choose a <strong>sort order</strong> (ascending, descending, or unsorted) then click <strong>Generate</strong> and copy the results.",
];

const faqs = [
  {
    question: "How is the randomness generated?",
    answer:
      "Numbers are generated using <strong>cryptographically secure randomness</strong> from your device's hardware random number generator — the same source used for security-sensitive applications. Results are not predictable or reproducible.",
  },
  {
    question: "Can I generate unique numbers?",
    answer:
      'Yes — enable <strong>unique numbers</strong> to ensure no value appears more than once. This requires generating integers, and the requested count must not exceed the total number of integers in the specified range.',
  },
  {
    question: "What is the maximum count I can generate?",
    answer: "You can generate up to <strong>1,000 numbers</strong> at once.",
  },
  {
    question: "Can I generate decimal numbers?",
    answer:
      "Yes — set the <strong>decimal places</strong> field to 1 or higher to generate floating-point numbers. For example, with a range of 0–1 and 4 decimal places, you might get values like 0.4721 or 0.8843.",
  },
  {
    question: "Is this tool free?",
    answer: "Yes — completely free with no registration required.",
  },
  {
    question: "Can I use this for a lottery or raffle draw?",
    answer:
      "Yes — enable <strong>unique numbers</strong>, set the range to match the lottery pool (e.g., 1–49), and set the count to the number of draws needed (e.g., 6). The resulting numbers are randomly selected without repetition, simulating a fair draw.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is a Random Number?",
    content: `<p>A <strong>random number</strong> is a value selected from a defined range where every possible value has an equal probability of being chosen. True randomness means the result cannot be predicted based on previous outputs.</p><p>Digital random number generators use unpredictable physical processes — electrical noise, timing variations in hardware — to produce values with no pattern. This tool uses your device's hardware-backed generator, which produces numbers that are suitable for security, statistical, and simulation purposes.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Random number generation has applications across many fields:</p><ul><li><strong>Lotteries and raffles:</strong> Draw winners fairly from a pool of participants using unique random numbers.</li><li><strong>Statistical sampling:</strong> Select random subsets from a data population for surveys, audits, or research.</li><li><strong>Games and simulations:</strong> Generate dice rolls, card draws, or random events in games, training exercises, or probability demonstrations.</li><li><strong>Testing and development:</strong> Populate test datasets with realistic random numerical values for debugging or performance testing.</li><li><strong>Decision making:</strong> Use random selection to break ties or make unbiased choices between equally valid options.</li></ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>To get the most from the random number generator:</p><ul><li>Use <strong>unique numbers</strong> mode for any application where the same value appearing twice would be invalid — draws, sampling, assignments.</li><li>For decimal applications, match the <strong>decimal places</strong> to the precision your use case requires — more decimal places is not always better if the results will be rounded later.</li><li>When generating large sets, use <strong>ascending or descending sort</strong> to make it easier to spot gaps, outliers, or patterns in the output.</li><li>Copy results to a spreadsheet for further analysis, filtering, or integration into larger workflows.</li></ul>`,
  },
];

export default function RandomNumberGeneratorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <RandomNumberGenerator />
    </ToolContainer>
  );
}
