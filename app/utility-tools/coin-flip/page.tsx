import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { CoinFlip } from "@/components/tools/utility-tools/CoinFlip";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("coin-flip");
const tool = TOOLS.find((t) => t.slug === "coin-flip")!;

const howToSteps = [
  "Click <strong>Flip Coin</strong> to flip — the coin animates with a realistic <strong>3D rotation</strong> before landing on the result.",
  "The result (<strong>Heads</strong> or <strong>Tails</strong>) is displayed clearly below the coin once the animation completes.",
  "A <strong>running tally</strong> of heads, tails, and total flips is shown after the first flip so you can track results over multiple flips.",
  "Click <strong>Reset</strong> to clear the tally and start a fresh session from zero.",
];

const faqs = [
  {
    question: "Is the coin flip truly fair?",
    answer:
      "Yes. Each flip uses the browser's <strong>cryptographically secure random number generator</strong> to produce an unbiased result. The outcome is exactly <strong>50/50</strong> for every flip regardless of previous results — there is no memory of past flips.",
  },
  {
    question: "Can I use this for making decisions?",
    answer:
      "Yes — the coin flip is <strong>genuinely random</strong> and suitable for settling disputes, deciding turn order in games, making a binary choice, or any situation where you want a completely unbiased outcome.",
  },
  {
    question: "Does flipping many heads in a row mean tails is 'due'?",
    answer:
      "No — this is the <strong>gambler's fallacy</strong>. Each flip is an <strong>independent event</strong> with exactly 50% probability. Past results have no influence on future flips. Ten consecutive heads does not make tails any more likely on the eleventh flip.",
  },
  {
    question: "Can I flip multiple coins at once?",
    answer:
      "The current tool flips <strong>one coin per click</strong>. For tracking the statistical distribution over many flips, use the tally counter to build up a sample over multiple individual flips.",
  },
  {
    question: "Is this suitable for competitive use or prizes?",
    answer:
      "The result is genuinely random and unbiased, making it suitable for settling friendly disputes or game decisions. For anything with significant stakes, both parties should witness the flip result together on the same screen.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is a Virtual Coin Flip?",
    content: `<p>A virtual coin flip replicates the randomness of tossing a physical coin using a <strong>random number generator</strong> built into your browser. Each flip produces a binary outcome — heads or tails — with equal probability, exactly as a fair physical coin would.</p><p>Unlike a physical coin where slight imbalances, toss technique, or catching method can introduce tiny biases, a well-implemented virtual coin flip uses a <strong>cryptographically secure source of randomness</strong> that produces results with statistically perfect 50/50 distribution.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul><li><strong>Decision making:</strong> Settle any binary choice — which restaurant to visit, who pays for coffee, which option to pick.</li><li><strong>Game setup:</strong> Determine who goes first, which team gets ball possession, or which side picks their role.</li><li><strong>Fair draws:</strong> Use for eliminating options one-by-one in tournament brackets or random selection tasks.</li><li><strong>Probability demonstrations:</strong> Use the tally feature over many flips to observe the <strong>law of large numbers</strong> in action — results converge to 50/50 as the sample grows.</li></ul>`,
  },
];

export default function CoinFlipPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <CoinFlip />
    </ToolContainer>
  );
}
