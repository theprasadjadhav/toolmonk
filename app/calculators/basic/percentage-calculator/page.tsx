import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { PercentageCalculator } from "@/components/tools/calculators/PercentageCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("percentage-calculator");
const tool = TOOLS.find((t) => t.slug === "percentage-calculator")!;

const howToSteps = [
  "Choose a <strong>calculation mode</strong>: <em>X% of Y</em> to find a percentage of a number, <em>X of Y = ?%</em> to find what percentage one number is of another, or <em>% change</em> to find a percentage increase or decrease between two values.",
  "Enter the <strong>two values</strong> in the input fields that appear for your chosen mode.",
  "The result is <strong>calculated instantly</strong> — use the copy button to copy it to your clipboard.",
];

const faqs = [
  {
    question: "How do I calculate what percent one number is of another?",
    answer: "Use the <strong>X of Y = ?%</strong> mode. Enter the <strong>part</strong> as X and the <strong>whole</strong> as Y. For example, to find what percent 30 is of 120, enter 30 and 120 — the result is 25%.",
  },
  {
    question: "How do I calculate a percentage increase or decrease?",
    answer: "Use the <strong>% change</strong> mode. Enter the original value as <em>From</em> and the new value as <em>To</em>. A positive result is a <strong>percentage increase</strong>; a negative result is a <strong>percentage decrease</strong>. For example, going from 80 to 100 is a 25% increase.",
  },
  {
    question: "How do I find X% of a number?",
    answer: "Use the <strong>X% of Y</strong> mode. Enter the percentage and the number. For example, 15% of 200 = 30. This is the most common use case — useful for finding sale discounts, tips, or tax amounts.",
  },
  {
    question: "Is this calculator free?",
    answer: "Yes — completely free with no registration required. All calculations happen instantly in your browser.",
  },
  {
    question: "What is the formula for percentage change?",
    answer: "The formula is: <strong>((New Value − Old Value) ÷ Old Value) × 100</strong>. A positive result means an increase; a negative result means a decrease. For example, (120 − 100) ÷ 100 × 100 = 20% increase.",
  },
  {
    question: "How do I work backwards from a percentage?",
    answer: "To find the <strong>original value</strong> before a percentage was applied, use the <em>X of Y = ?%</em> mode or divide the known result by the percentage. For example, if 25 is 20% of something, the original value is 25 ÷ 0.20 = 125.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is a Percentage?",
    content: `<p>A <strong>percentage</strong> is a number expressed as a fraction of 100. The word literally means "per hundred." For example, 45% means 45 out of every 100, or equivalently 0.45 as a decimal.</p><p>Percentages are used everywhere in daily life — from <strong>discounts and sales tax</strong> to <strong>interest rates, test scores, nutritional labels, and statistics</strong>. Understanding how to calculate percentages is one of the most practical math skills you can have.</p>`,
  },
  {
    title: "Three Essential Percentage Calculations",
    content: `<p>Most percentage problems fall into one of three types:</p><ul><li><strong>Finding a percentage of a number</strong> — "What is 20% of 150?" → multiply 150 × 0.20 = 30.</li><li><strong>Finding what percent one number is of another</strong> — "30 is what percent of 150?" → divide 30 ÷ 150 × 100 = 20%.</li><li><strong>Finding percentage change</strong> — "How much did it change?" → (new − old) ÷ old × 100. Positive = increase, negative = decrease.</li></ul><p>Each of these is a separate mode in the calculator above.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Percentage calculations come up in countless real-world situations:</p><ul><li><strong>Shopping</strong> — calculating a discount (30% off $80 = $24 savings).</li><li><strong>Finance</strong> — finding interest earned, portfolio gains, or loan costs.</li><li><strong>Health</strong> — tracking body weight changes or calorie percentages.</li><li><strong>Work</strong> — computing profit margins, growth rates, or performance targets.</li><li><strong>School</strong> — converting scores to grades or comparing results.</li></ul>`,
  },
];

export default function PercentageCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <PercentageCalculator />
    </ToolContainer>
  );
}
