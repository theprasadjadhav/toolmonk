import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { FactorialCalculator } from "@/components/tools/calculators/FactorialCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("factorial-calculator");
const tool = TOOLS.find((t) => t.slug === "factorial-calculator")!;

const howToSteps = [
  "Type a <strong>non-negative whole number</strong> between 0 and 20 into the input field, or click one of the preset buttons to load a common example such as 5! or 10!.",
  "The calculator multiplies every positive integer from <strong>1 up to n</strong> and displays the exact product instantly — for example, 6! = 720.",
  "For larger inputs (n ≥ 13) the result is also shown in <strong>scientific notation</strong> alongside the full exact value. Click <strong>Copy</strong> to copy the result to your clipboard.",
];

const faqs = [
  {
    question: "What is a factorial?",
    answer:
      "The <strong>factorial</strong> of a non-negative integer n, written <strong>n!</strong>, is the product of every positive integer from 1 to n. For example, 5! = 5 × 4 × 3 × 2 × 1 = 120. By definition, <strong>0! = 1</strong>. Factorials grow extremely quickly — 20! already exceeds two quintillion.",
  },
  {
    question: "Why is 0! equal to 1?",
    answer:
      "0! = 1 is a mathematical convention that keeps formulas for <strong>permutations and combinations</strong> consistent when selecting zero items. It also follows naturally from the recursive definition n! = n × (n−1)!: applying it at n = 1 gives 1! = 1 × 0!, which requires 0! = 1.",
  },
  {
    question: "Why is the maximum input limited to 20?",
    answer:
      "Numbers have a precision limit on any computing platform. <strong>20!</strong> is the largest factorial that can be represented exactly as a whole number within that limit. The value of 21! exceeds the threshold of exact integer representation and would produce a slightly inaccurate result, so the calculator caps input at 20 to guarantee correctness.",
  },
  {
    question: "Where are factorials used?",
    answer:
      "Factorials are fundamental in <strong>combinatorics</strong> — they form the basis of permutation and combination formulas. They also appear in <strong>probability theory</strong>, in the denominators of Taylor series expansions (used to approximate functions like e^x and sin(x)), and in the analysis of sorting algorithms.",
  },
  {
    question: "How fast do factorials grow?",
    answer:
      "Factorials grow <strong>super-exponentially</strong>. To put it in perspective: 10! = 3,628,800 (about 3.6 million), 15! ≈ 1.3 trillion, and 20! ≈ 2.4 quintillion. This rapid growth is why factorials are used to count arrangements — even a small set of items has an astronomically large number of possible orderings.",
  },
  {
    question: "What is the relationship between factorials and permutations?",
    answer:
      "The number of ways to arrange n distinct items in a sequence is exactly <strong>n!</strong>. When you select only r items from a larger set of n, the count of ordered arrangements is P(n, r) = n! / (n − r)!. Factorials are the building block for all counting problems involving order.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is a Factorial?",
    content: `<p>A <strong>factorial</strong> is the product of all positive integers up to a given whole number. It is written with an exclamation mark after the number — for example, <strong>4!</strong> means 4 × 3 × 2 × 1 = 24.</p>
<p>The special case <strong>0! = 1</strong> is defined by convention so that formulas in counting and probability work consistently when zero items are selected.</p>
<p>Factorials grow extremely fast: the number of ways to arrange a standard deck of 52 playing cards is 52!, a number with 68 digits — far greater than the number of atoms in the observable universe.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Factorials appear whenever you need to count arrangements or selections:</p>
<ul>
<li><strong>Counting arrangements:</strong> The number of ways to seat 6 people at a dinner table is 6! = 720.</li>
<li><strong>Permutations:</strong> Arranging r items chosen from n uses n! in the numerator.</li>
<li><strong>Combinations:</strong> Choosing r items from n without regard to order divides by r! to remove duplicate orderings.</li>
<li><strong>Probability:</strong> Computing the likelihood of a specific ordering of events or outcomes.</li>
<li><strong>Series expansions:</strong> Factorials appear in the denominators of infinite series that define fundamental mathematical constants and functions.</li>
</ul>`,
  },
];

export default function FactorialCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <FactorialCalculator />
    </ToolContainer>
  );
}
