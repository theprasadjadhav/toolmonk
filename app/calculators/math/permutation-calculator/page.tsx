import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { PermCombCalculator } from "@/components/tools/calculators/PermCombCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("permutation-calculator");
const tool = TOOLS.find((t) => t.slug === "permutation-calculator")!;

const howToSteps = [
  "Enter <strong>n</strong> (the total number of distinct items) and <strong>r</strong> (how many items you want to arrange) into the two input fields, or click a preset to load a ready-made example.",
  "The calculator applies the <strong>permutation formula P(n, r) = n! / (n − r)!</strong>, which counts every ordered sequence of r items that can be drawn from the set of n — different orderings of the same items are treated as distinct results.",
  "Review the <strong>step-by-step factorial breakdown</strong> beneath the result to see how each value was computed, then click <strong>Copy</strong> to copy the final count.",
];

const faqs = [
  {
    question: "What is a permutation?",
    answer:
      "A <strong>permutation</strong> is an ordered arrangement of r items selected from a set of n distinct items. <strong>Order matters</strong> — the sequence (A, B, C) is a different permutation from (C, B, A) even though they contain the same items. The total count is given by <strong>P(n, r) = n! / (n − r)!</strong>.",
  },
  {
    question: "How is permutation different from combination?",
    answer:
      "In a <strong>permutation</strong>, the order of selection matters; in a <strong>combination</strong>, it does not. For the same n and r, the permutation count is always greater than or equal to the combination count. Specifically, <strong>P(n, r) = C(n, r) × r!</strong> — multiplying the combination by r! accounts for all the orderings of each group.",
  },
  {
    question: "What does P(n, n) mean?",
    answer:
      "<strong>P(n, n) = n!</strong> is the total number of ways to arrange all n items in a sequence. For example, P(3, 3) = 6 because the three distinct items A, B, C can be ordered in exactly 6 ways: ABC, ACB, BAC, BCA, CAB, CBA.",
  },
  {
    question: "Why is n limited to 20?",
    answer:
      "Factorials grow extremely quickly. <strong>20!</strong> is the largest factorial that can be represented as an exact whole number within standard numeric precision. Values above 20 would exceed that precision and produce inaccurate results, so the calculator caps n at 20 to guarantee correctness.",
  },
  {
    question: "What is a permutation with repetition?",
    answer:
      "This calculator computes <strong>permutations without repetition</strong> — each item can be chosen at most once. In a permutation <em>with</em> repetition, items can be reused, and the count is simply <strong>n^r</strong> (n raised to the power r). For example, a 4-digit PIN from digits 0–9 with repeats allowed has 10^4 = 10,000 possible codes.",
  },
  {
    question: "What real-world problems use permutations?",
    answer:
      "Permutations arise whenever <strong>order matters</strong>: ranking contestants (1st, 2nd, 3rd place from 10 finalists), creating unique access codes or PINs, scheduling events in a specific sequence, and determining the number of distinct anagrams of a word.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is a Permutation?",
    content: `<p>A <strong>permutation</strong> is an ordered arrangement of items selected from a larger group. Unlike a combination, the <strong>sequence in which items appear matters</strong> — placing first, second, and third is a permutation problem because swapping two items gives a different result.</p>
<p>The number of permutations of r items chosen from n distinct items is written <strong>P(n, r)</strong> and calculated as:</p>
<p><strong>P(n, r) = n! / (n − r)!</strong></p>
<p>This formula counts the n × (n−1) × … ways to fill each position in sequence, stopping after r positions have been filled.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Permutations appear any time order is significant:</p>
<ul>
<li><strong>Award ceremonies:</strong> Assigning gold, silver, and bronze medals to 3 of 10 athletes gives P(10, 3) = 720 possible outcomes.</li>
<li><strong>Passwords and codes:</strong> A 4-character code from 26 letters (no repeats) has P(26, 4) = 358,800 possibilities.</li>
<li><strong>Race finishing positions:</strong> The number of possible top-5 finishing orders for 20 cars in a race is P(20, 5) = 1,860,480.</li>
<li><strong>Scheduling:</strong> Arranging 5 tasks in the most efficient order involves P(5, 5) = 120 possible sequences.</li>
</ul>`,
  },
  {
    title: "Understanding Your Result",
    content: `<p>The result tells you the <strong>total number of distinct ordered sequences</strong> you can form by choosing r items from your set of n. A higher result means more possible orderings — useful for estimating the strength of passwords or the rarity of a particular ranking.</p>
<p>If order does not matter for your problem, use the <strong>Combination Calculator</strong> instead — its result will always be smaller, since it treats different orderings of the same group as one outcome.</p>`,
  },
];

export default function PermutationCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <PermCombCalculator mode="permutation" />
    </ToolContainer>
  );
}
