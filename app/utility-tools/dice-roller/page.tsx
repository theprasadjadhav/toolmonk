import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { DiceRoller } from "@/components/tools/utility-tools/DiceRoller";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("dice-roller");
const tool = TOOLS.find((t) => t.slug === "dice-roller")!;

const howToSteps = [
  "Select the <strong>die type</strong>: D4, D6, D8, D10, D12, or D20 — each representing the number of faces on the die.",
  "Use the <strong>+ and −</strong> buttons to set the number of dice to roll at once (1–6 dice per roll).",
  "Click <strong>Roll</strong> — dice animate and results appear immediately with individual face values.",
  "For <strong>multiple dice</strong>, the <strong>sum</strong> and <strong>average</strong> are shown alongside the individual roll values.",
];

const faqs = [
  {
    question: "Are the rolls truly random?",
    answer:
      "Yes. Each die uses the browser's <strong>cryptographically secure random number generator</strong> with rejection sampling to produce <strong>unbiased results</strong> across any die size. Every face has exactly equal probability on every roll.",
  },
  {
    question: "What is rejection sampling?",
    answer:
      "Rejection sampling ensures that even for non-power-of-2 die sizes (like D6 or D10), every face has an <strong>exactly equal probability</strong>. Any random number that would introduce a bias is discarded and a new one is drawn — this prevents the slight skew that simpler modulo division can produce.",
  },
  {
    question: "What are the common uses for these dice types?",
    answer:
      "<strong>D4</strong> is used for small damage rolls. <strong>D6</strong> is the standard six-sided die in most board games. <strong>D8</strong> and <strong>D10</strong> are common in tabletop roleplaying games for weapon damage. <strong>D12</strong> is used for certain weapon types and class features. <strong>D20</strong> is the most iconic tabletop RPG die, used for skill checks and attack rolls.",
  },
  {
    question: "Can I roll different die types together?",
    answer:
      "The tool rolls <strong>multiple dice of the same type</strong> in one click (e.g. 3D6 or 2D20). For mixed-type rolls (like 2D6 + 1D4), roll each die type separately and add the results manually.",
  },
  {
    question: "What does the sum show?",
    answer:
      "When rolling multiple dice, the <strong>sum</strong> is the total of all individual dice values added together — for example, rolling 3D6 might give 2 + 5 + 4 = <strong>11</strong>. This is the value you would typically use in a tabletop game.",
  },
  {
    question: "Can I roll a D100?",
    answer:
      "A D100 roll is traditionally made using two D10 dice — one for the tens digit and one for the units digit. Roll two D10 dice separately: the first result × 10 plus the second result gives a number from 1 to 100.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is a Dice Roller?",
    content: `<p>A virtual dice roller replicates the randomness of rolling physical polyhedral dice using a <strong>secure random number generator</strong>. It supports the standard set of tabletop gaming dice: D4, D6, D8, D10, D12, and D20 — the classic polyhedral set used in roleplaying games, board games, and educational activities.</p><p>Each die type represents a different number of sides. Rolling a D20, for example, produces a random result between 1 and 20 with equal probability for each number — just as a physical 20-sided die would.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul><li><strong>Tabletop RPGs:</strong> Roll dice for character attacks, skill checks, saving throws, and damage rolls in games like Dungeons and Dragons and Pathfinder.</li><li><strong>Board games:</strong> Use as a replacement when physical dice are unavailable or to roll multiple dice types simultaneously.</li><li><strong>Educational probability:</strong> Demonstrate probability concepts by rolling many dice and observing the distribution of results.</li><li><strong>Random number generation:</strong> Use as a fair, random number picker for any activity that requires an unbiased outcome within a set range.</li></ul>`,
  },
];

export default function DiceRollerPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <DiceRoller />
    </ToolContainer>
  );
}
