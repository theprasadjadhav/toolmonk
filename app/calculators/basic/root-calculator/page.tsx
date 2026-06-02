import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { SquareRootCalculator } from "@/components/tools/calculators/SquareRootCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("root-calculator");
const tool = TOOLS.find((t) => t.slug === "root-calculator")!;

const howToSteps = [
  "Enter a <strong>number</strong> in the input field — this is the value whose root you want to find.",
  "Set the <strong>root degree</strong>: use the shortcut buttons for square root (2) or cube root (3), or type any positive integer for higher roots. The result updates instantly, and <strong>perfect roots</strong> are highlighted with simplified radical form shown where applicable.",
  "Click <strong>copy</strong> to copy the decimal result or the simplified radical form to your clipboard.",
];

const faqs = [
  {
    question: "What is a perfect square?",
    answer: "A <strong>perfect square</strong> is a whole number whose square root is also a whole number. For example, 4, 9, 16, 25, and 36 are perfect squares (√4 = 2, √9 = 3, √16 = 4, etc.). Numbers that are not perfect squares produce irrational decimal results.",
  },
  {
    question: "What is simplified radical form?",
    answer: "<strong>Simplified radical form</strong> factors out any perfect square from under the root symbol. For example, √12 simplifies to 2√3 (because 12 = 4 × 3 and √4 = 2). This form is commonly required in school mathematics.",
  },
  {
    question: "Can I calculate cube roots or higher?",
    answer: "Yes. Change the <strong>root degree</strong> to 3 for cube roots, 4 for fourth roots, and so on up to any positive integer. For example, the cube root of 27 is 3, and the fourth root of 81 is 3.",
  },
  {
    question: "What happens with negative numbers?",
    answer: "<strong>Even roots</strong> of negative numbers (such as √−4) are not real numbers and will show an error. <strong>Odd roots</strong> of negative numbers are valid — for example, the cube root of −8 equals −2, because (−2)³ = −8.",
  },
  {
    question: "What is the difference between a square root and a cube root?",
    answer: "A <strong>square root</strong> asks: what number multiplied by itself equals X? A <strong>cube root</strong> asks: what number multiplied by itself three times equals X? For example, √25 = 5 (because 5 × 5 = 25) and ∛125 = 5 (because 5 × 5 × 5 = 125).",
  },
  {
    question: "Can roots produce irrational numbers?",
    answer: "Yes. Most roots produce <strong>irrational numbers</strong> — decimals that go on forever without repeating. For example, √2 ≈ 1.41421356... The calculator shows the decimal approximation to several significant figures.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is a Square Root?",
    content: `<p>The <strong>square root</strong> of a number is the value that, when multiplied by itself, gives the original number. For example, the square root of 49 is 7 because 7 × 7 = 49. The square root symbol is √.</p><p>Square roots appear in geometry (finding the side of a square from its area), physics, engineering, and many everyday calculations. Numbers like 1, 4, 9, 16, and 25 are <strong>perfect squares</strong> — their square roots are whole numbers. All other positive numbers have square roots that are irrational decimals.</p>`,
  },
  {
    title: "Square Roots vs. Other Roots",
    content: `<p>Beyond the square root, you can compute the <strong>nth root</strong> of any positive number:</p><ul><li><strong>Cube root (3rd root)</strong> — finds the number that, multiplied three times by itself, equals X. For example, ∛64 = 4.</li><li><strong>Fourth root</strong> — used in statistics and some physics formulas.</li><li><strong>Nth root</strong> — any degree is valid. Higher roots are equivalent to raising a number to the power of 1/n.</li></ul><p>Use the degree selector in the calculator to switch between root types.</p>`,
  },
];

export default function RootCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <SquareRootCalculator />
    </ToolContainer>
  );
}
