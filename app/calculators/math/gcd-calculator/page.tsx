import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { GcdLcmCalculator } from "@/components/tools/calculators/GcdLcmCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("gcd-calculator");
const tool = TOOLS.find((t) => t.slug === "gcd-calculator")!;

const howToSteps = [
  "Enter <strong>two or more positive whole numbers</strong> into the input box, separated by spaces, commas, or new lines — for example, type <strong>48 36 60</strong> to find the GCD of those three values.",
  "The calculator works through each pair of numbers, repeatedly replacing the larger value with the remainder of dividing the larger by the smaller until the remainder reaches zero — the last non-zero value is the <strong>Greatest Common Divisor</strong>.",
  "Read the <strong>GCD result</strong> at the top of the output, review the step-by-step reduction shown below, then click <strong>Copy</strong> to copy the value to your clipboard.",
];

const faqs = [
  {
    question: "What is the GCD?",
    answer:
      "The <strong>Greatest Common Divisor (GCD)</strong>, also called the <strong>Highest Common Factor (HCF)</strong>, is the largest positive integer that divides all of the given numbers without leaving a remainder. For example, GCD(48, 36) = 12 because 12 is the biggest number that divides both 48 and 36 evenly.",
  },
  {
    question: "How does the calculation work?",
    answer:
      "The calculator uses a classic repeated-division approach. Given two numbers a and b, it divides the larger by the smaller and takes the remainder, then repeats with the smaller number and the new remainder. This continues until the remainder is zero, at which point the <strong>last non-zero remainder is the GCD</strong>. For more than two inputs, the process is applied pairwise from left to right.",
  },
  {
    question: "Can I enter more than two numbers?",
    answer:
      "Yes. Separate any quantity of positive integers with spaces, commas, or new lines. The calculator folds them into a single GCD step by step, showing each intermediate result so you can follow the full reduction.",
  },
  {
    question: "What is the GCD used for?",
    answer:
      "GCD is used to <strong>simplify fractions</strong> — divide both the numerator and denominator by their GCD to reach the lowest terms. It also provides a shortcut for computing the <strong>Least Common Multiple</strong> via LCM(a, b) = a × b ÷ GCD(a, b), and appears in solving problems about equal sharing, tiling, and scheduling.",
  },
  {
    question: "What is GCD(n, 0) or GCD(0, n)?",
    answer:
      "By convention, <strong>GCD(n, 0) = n</strong> for any positive integer n. Zero is divisible by every positive integer, so n is always a common divisor; and because no integer larger than n can divide n, n is the greatest one. This identity is useful in the repeated-division process where remainders eventually reach zero.",
  },
  {
    question: "What does it mean when the GCD equals 1?",
    answer:
      "When the GCD of two numbers is <strong>1</strong>, the numbers are called <strong>coprime</strong> (or relatively prime). They share no common factors other than 1. For example, GCD(8, 15) = 1, so 8 and 15 are coprime even though neither is a prime number itself.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is the Greatest Common Divisor?",
    content: `<p>The <strong>Greatest Common Divisor (GCD)</strong> of two or more integers is the largest number that divides all of them without leaving a remainder. It is also known as the <strong>Highest Common Factor (HCF)</strong>.</p>
<p>For example, the divisors of 12 are 1, 2, 3, 4, 6, and 12. The divisors of 18 are 1, 2, 3, 6, 9, and 18. The shared divisors are 1, 2, 3, and 6 — the greatest of these is <strong>6</strong>, so GCD(12, 18) = 6.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>The GCD is a practical tool in everyday arithmetic and beyond:</p>
<ul>
<li><strong>Simplifying fractions:</strong> Divide numerator and denominator by their GCD to get the lowest-terms fraction. For example, 24/36 ÷ GCD(24,36)=12 simplifies to 2/3.</li>
<li><strong>Equal sharing problems:</strong> If you have 48 apples and 36 oranges and want to make identical gift bags with no leftovers, each bag can hold GCD(48, 36) = 12 pieces of fruit.</li>
<li><strong>Tile and grid problems:</strong> The largest square tile that fits a rectangular floor exactly is determined by the GCD of the two side lengths.</li>
<li><strong>Finding the LCM:</strong> LCM(a, b) = a × b ÷ GCD(a, b), making GCD calculation a stepping stone to finding the lowest common denominator.</li>
</ul>`,
  },
];

export default function GcdCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <GcdLcmCalculator mode="gcd" />
    </ToolContainer>
  );
}
