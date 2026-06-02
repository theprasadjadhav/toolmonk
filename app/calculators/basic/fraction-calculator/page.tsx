import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { FractionCalculator } from "@/components/tools/calculators/FractionCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("fraction-calculator");
const tool = TOOLS.find((t) => t.slug === "fraction-calculator")!;

const howToSteps = [
  "Enter the <strong>numerator</strong> (top number) and <strong>denominator</strong> (bottom number) for each fraction using the stacked input fields.",
  "Select the <strong>operation</strong>: add (+), subtract (−), multiply (×), or divide (÷) using the operator buttons between the two fractions.",
  "The result appears instantly, shown as a <strong>simplified fraction</strong>, decimal equivalent, and percentage. Tap any <strong>copy</strong> button to copy a specific form.",
];

const faqs = [
  {
    question: "How do I add fractions with different denominators?",
    answer: "The calculator handles it automatically. It finds a <strong>common denominator</strong>, adds the numerators, then simplifies the result. For example, 1/3 + 1/4 = 4/12 + 3/12 = 7/12.",
  },
  {
    question: "How are results simplified?",
    answer: "Results are reduced to their <strong>lowest terms</strong> by dividing both the numerator and denominator by their Greatest Common Divisor. For example, 6/9 becomes 2/3 and 4/8 becomes 1/2.",
  },
  {
    question: "Can I divide by a fraction?",
    answer: "Yes. <strong>Dividing by a fraction</strong> works by flipping the second fraction (taking its reciprocal) and then multiplying. For example, 1/2 ÷ 1/4 = 1/2 × 4/1 = 4/2 = 2.",
  },
  {
    question: "What happens if I divide by zero?",
    answer: "Dividing by zero is <strong>undefined</strong> in mathematics. The calculator will show an error message if any denominator or divisor is set to zero.",
  },
  {
    question: "Can I enter mixed numbers like 2½?",
    answer: "The calculator works with <strong>improper fractions</strong>. To enter a mixed number like 2½, convert it first: 2½ = 5/2. Enter 5 as the numerator and 2 as the denominator.",
  },
  {
    question: "What is the difference between a proper and improper fraction?",
    answer: "A <strong>proper fraction</strong> has a numerator smaller than its denominator (e.g. 3/4). An <strong>improper fraction</strong> has a numerator equal to or larger than its denominator (e.g. 7/4). The calculator works with both types.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is a Fraction?",
    content: `<p>A <strong>fraction</strong> represents a part of a whole. It is written as two numbers separated by a line: the <strong>numerator</strong> (top) counts how many parts you have, and the <strong>denominator</strong> (bottom) shows how many equal parts make up the whole.</p><p>For example, 3/4 means three out of four equal parts. Fractions appear in cooking, construction, finance, and everyday measurement — any time you need to express a quantity that is not a whole number.</p>`,
  },
  {
    title: "How Fraction Arithmetic Works",
    content: `<p>The four basic operations work as follows:</p><ul><li><strong>Addition and Subtraction</strong> — requires a common denominator. Find the least common multiple of both denominators, convert each fraction, then add or subtract the numerators.</li><li><strong>Multiplication</strong> — multiply the numerators together and the denominators together, then simplify.</li><li><strong>Division</strong> — flip the second fraction (its reciprocal) and multiply. For example, 2/3 ÷ 4/5 = 2/3 × 5/4 = 10/12 = 5/6.</li></ul><p>All results are automatically reduced to their simplest form.</p>`,
  },
];

export default function FractionCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <FractionCalculator />
    </ToolContainer>
  );
}
