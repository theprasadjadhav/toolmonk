import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { ExponentCalculator } from "@/components/tools/calculators/ExponentCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("exponent-calculator");
const tool = TOOLS.find((t) => t.slug === "exponent-calculator")!;

const howToSteps = [
  "Enter the <strong>base number</strong> in the first field — this is the number being multiplied by itself.",
  "Enter the <strong>exponent (power)</strong> in the second field — this is how many times the base is multiplied. The result appears instantly, along with alternate forms such as squared, cubed, reciprocal, and scientific notation where applicable.",
  "Click <strong>copy</strong> next to any result to save it to your clipboard.",
];

const faqs = [
  {
    question: "What is a negative exponent?",
    answer: "A <strong>negative exponent</strong> means the reciprocal of the positive power: x<sup>−n</sup> = 1 ÷ x<sup>n</sup>. For example, 2<sup>−3</sup> = 1 ÷ 8 = 0.125. Negative exponents are common in scientific notation for very small numbers.",
  },
  {
    question: "What does a fractional exponent mean?",
    answer: "A <strong>fractional exponent</strong> represents a root. Specifically, x<sup>1/n</sup> is the nth root of x. For example, 9<sup>0.5</sup> = √9 = 3, and 27<sup>1/3</sup> = ∛27 = 3. Any fractional exponent can be interpreted this way.",
  },
  {
    question: "What is anything to the power of 0?",
    answer: "Any <strong>non-zero number raised to the power of 0 equals 1</strong>. This is a fundamental rule in mathematics. Zero to the power of zero is technically undefined, though it is often treated as 1 in many practical applications.",
  },
  {
    question: "Can I use decimal exponents?",
    answer: "Yes. The calculator accepts <strong>any real-number exponent</strong> including decimals (e.g. 2.5) and negative values (e.g. −3). Decimal exponents are equivalent to fractional powers and are handled precisely.",
  },
  {
    question: "What is scientific notation and when does it appear?",
    answer: "<strong>Scientific notation</strong> expresses very large or very small numbers as a number between 1 and 10 multiplied by a power of 10. For example, 5,000,000 is written as 5 × 10<sup>6</sup>. The calculator shows scientific notation automatically when the result would otherwise be unwieldy.",
  },
  {
    question: "What happens with a base of 0?",
    answer: "Zero raised to any <strong>positive</strong> exponent equals 0. Zero raised to a <strong>negative</strong> exponent is undefined (division by zero). Zero to the power of zero is a special mathematical case that is left undefined.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is an Exponent?",
    content: `<p>An <strong>exponent</strong> (also called a <strong>power</strong>) tells you how many times to multiply a number by itself. For example, 2<sup>4</sup> means 2 × 2 × 2 × 2 = 16. The number being multiplied is called the <strong>base</strong>, and the small raised number is the <strong>exponent</strong>.</p><p>Exponents appear throughout everyday mathematics — from calculating compound interest and area of squares to working with very large or very small quantities in science and engineering.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Exponent calculations are needed in many real-world situations:</p><ul><li><strong>Compound interest</strong> — the formula for compound growth uses an exponent for the number of periods.</li><li><strong>Area and volume</strong> — squaring a side gives area; cubing gives volume.</li><li><strong>Scientific measurements</strong> — the mass of atoms, distances between stars, and computer memory sizes are all expressed with powers of 10 or 2.</li><li><strong>Population growth</strong> — exponential growth models use repeated multiplication over time.</li></ul>`,
  },
];

export default function ExponentCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <ExponentCalculator />
    </ToolContainer>
  );
}
