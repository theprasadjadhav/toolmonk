import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { PermCombCalculator } from "@/components/tools/calculators/PermCombCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("combination-calculator");
const tool = TOOLS.find((t) => t.slug === "combination-calculator")!;

const howToSteps = [
  "Enter <strong>n</strong> (the total number of items in the set) and <strong>r</strong> (how many items you want to select) into the two input fields. You can also click a preset like C(52,5) to load a classic poker-hand example instantly.",
  "The calculator applies the <strong>combination formula C(n, r) = n! / (r! × (n − r)!)</strong> and displays the total number of unique, unordered selections — where no group is counted more than once regardless of the order its members were picked.",
  "Review the <strong>step-by-step factorial breakdown</strong> displayed below the result to see exactly how the numerator and denominator were computed, then click <strong>Copy</strong> to copy the final count to your clipboard.",
];

const faqs = [
  {
    question: "What is a combination?",
    answer:
      "A <strong>combination</strong> is a selection of r items chosen from a set of n distinct items where <strong>order does not matter</strong>. The total count is given by C(n, r) = n! / (r! × (n − r)!), also called the <strong>binomial coefficient</strong> and written as 'n choose r'. For example, choosing 3 fruits from a basket of 5 gives C(5, 3) = 10 unique groups.",
  },
  {
    question: "How is combination different from permutation?",
    answer:
      "Combinations count <strong>unordered groups</strong>; permutations count <strong>ordered sequences</strong>. When you pick items A and B, a combination treats {A, B} and {B, A} as the same group — a permutation counts them as two distinct arrangements. As a result, C(5, 2) = 10 while P(5, 2) = 20.",
  },
  {
    question: "What is C(n, 0) and C(n, n)?",
    answer:
      "Both equal <strong>1</strong>. C(n, 0) = 1 because there is exactly one way to choose nothing from a set. C(n, n) = 1 because there is exactly one way to choose every item. These edge cases are consistent with the factorial definition since 0! = 1.",
  },
  {
    question: "Where are combinations used in real life?",
    answer:
      "Combinations appear throughout <strong>probability and statistics</strong> — calculating the odds of a poker hand (C(52, 5) = 2,598,960), a lottery ticket, or sampling without replacement. They also underpin the <strong>binomial distribution</strong>, which models the number of successes in a fixed number of independent trials.",
  },
  {
    question: "What is Pascal's Triangle and how does it relate?",
    answer:
      "Pascal's Triangle is a triangular number pattern where each entry is the sum of the two entries directly above it. Every entry in row n at position r is exactly <strong>C(n, r)</strong>. This makes the triangle a quick visual reference for small combination values and reveals important patterns like the binomial theorem.",
  },
  {
    question: "Can C(n, r) ever be zero?",
    answer:
      "Yes. If <strong>r is greater than n</strong>, it is impossible to choose more items than exist in the set, so C(n, r) = 0 for any r &gt; n. The calculator will display 0 in this case.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is a Combination?",
    content: `<p>A <strong>combination</strong> is a way of selecting items from a larger group where the order of selection does not matter. If you pick members for a committee, the group {Alice, Bob, Carol} is the same regardless of the order you chose them — that is a combination.</p>
<p>The number of possible combinations is written <strong>C(n, r)</strong> or <strong>nCr</strong> and is read as "n choose r." The formula is:</p>
<p><strong>C(n, r) = n! / (r! × (n − r)!)</strong></p>
<p>where <strong>n!</strong> (n factorial) is the product of all positive integers up to n. The denominator removes the duplicate orderings that would otherwise be counted.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Combinations arise whenever you need to count distinct groups without regard to order:</p>
<ul>
<li><strong>Card games:</strong> The number of possible 5-card poker hands dealt from a 52-card deck is C(52, 5) = 2,598,960.</li>
<li><strong>Lotteries:</strong> Picking 6 numbers from 49 gives C(49, 6) = 13,983,816 possible tickets.</li>
<li><strong>Team selection:</strong> Choosing 3 players from a squad of 11 to receive a bonus uses C(11, 3) = 165 equally likely selections.</li>
<li><strong>Survey sampling:</strong> Determining how many different groups of survey respondents can be drawn from a population.</li>
<li><strong>Menu planning:</strong> Counting how many different 3-item meal combinations can be made from a list of 10 dishes.</li>
</ul>`,
  },
  {
    title: "Understanding Your Result",
    content: `<p>The result is the <strong>total number of unique groups</strong> you can form by choosing r items from n. A larger result means there are more possible selections — useful for estimating how rare or common a particular outcome is.</p>
<p>If you need to account for <strong>order</strong> (for example, assigning first, second, and third place from a group), use the <strong>Permutation Calculator</strong> instead.</p>
<p>When the result is very large, consider expressing it in <strong>scientific notation</strong> for easier comparison. The step-by-step breakdown beneath the result shows each factorial value so you can verify every stage of the calculation.</p>`,
  },
];

export default function CombinationCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <PermCombCalculator mode="combination" />
    </ToolContainer>
  );
}
