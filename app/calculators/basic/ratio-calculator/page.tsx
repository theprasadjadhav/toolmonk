import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { RatioCalculator } from "@/components/tools/calculators/RatioCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("ratio-calculator");
const tool = TOOLS.find((t) => t.slug === "ratio-calculator")!;

const howToSteps = [
  "Choose a <strong>mode</strong>: <em>Simplify</em> to reduce a ratio to its lowest terms, <em>Proportion</em> to solve A:B = C:? for the missing value, or <em>Scale</em> to multiply a ratio by a given factor.",
  "Enter the <strong>required values</strong> in the input fields for your chosen mode — the tool highlights which fields to fill.",
  "The result <strong>updates instantly</strong>. Click any <strong>copy</strong> button to copy a value.",
];

const faqs = [
  {
    question: "How do I simplify a ratio?",
    answer: "Use <strong>Simplify</strong> mode. Enter the two parts A and B — the tool divides both by their Greatest Common Divisor to give the simplest whole-number form. For example, 12:8 simplifies to 3:2.",
  },
  {
    question: "How do I solve a proportion?",
    answer: "Use <strong>Proportion</strong> mode. Enter A, B, and C in the equation A:B = C:?. The missing value D is calculated as (B × C) ÷ A. This is useful for scaling recipes, maps, or any proportional relationship.",
  },
  {
    question: "What does Scale mode do?",
    answer: "<strong>Scale</strong> mode multiplies both parts of a ratio by a given factor. For example, scaling 2:3 by a factor of 5 gives 10:15. This is useful for enlarging or reducing models, blueprints, or recipes.",
  },
  {
    question: "Is this calculator free?",
    answer: "Yes — completely free with no registration required.",
  },
  {
    question: "What is the difference between a ratio and a fraction?",
    answer: "A <strong>ratio</strong> compares two quantities to each other (e.g. 2:3 means 2 parts of A for every 3 parts of B). A <strong>fraction</strong> expresses a part of a whole (e.g. 2/5 means 2 out of 5). While related, a ratio does not always imply a total — for instance, a 2:3 ratio of juice to water in a drink means the total has 5 parts.",
  },
  {
    question: "How do I check if two ratios are equivalent?",
    answer: "Two ratios are equivalent if they simplify to the same form. For example, 4:6 and 8:12 both simplify to 2:3. You can also cross-multiply: if A × D = B × C, then A:B = C:D.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is a Ratio?",
    content: `<p>A <strong>ratio</strong> expresses the relationship between two quantities — how much of one thing there is compared to another. Ratios are written as A:B (read "A to B") or as a fraction A/B.</p><p>For example, a ratio of 1:4 in a recipe means for every 1 cup of ingredient A you use 4 cups of ingredient B. Ratios do not imply a specific unit — they describe a <strong>proportional relationship</strong>.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Ratios and proportions appear in many practical situations:</p><ul><li><strong>Cooking and baking</strong> — scaling a recipe up or down while preserving flavor balance.</li><li><strong>Maps and blueprints</strong> — a map scale like 1:50,000 means 1 cm on the map = 50,000 cm in reality.</li><li><strong>Mixing solutions</strong> — paint mixing, cement ratios, or chemical dilutions require precise proportions.</li><li><strong>Finance</strong> — price-to-earnings ratios, debt-to-income ratios, and other financial metrics.</li><li><strong>Photography and design</strong> — aspect ratios (16:9, 4:3) define screen and image dimensions.</li></ul>`,
  },
];

export default function RatioCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <RatioCalculator />
    </ToolContainer>
  );
}
