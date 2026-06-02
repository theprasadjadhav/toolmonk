import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { UnitConverter } from "@/components/tools/converters/UnitConverter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("weight-converter");

const tool = TOOLS.find((t) => t.slug === "weight-converter")!;

const howToSteps = [
  "Type any <strong>weight or mass value</strong> into the input field at the top of the converter.",
  "Choose your <strong>source unit</strong> from the dropdown — options include kilograms, pounds, ounces, grams, stone, metric tonnes, short tons, long tons, and more.",
  "All other weight units <strong>update instantly</strong> as you type, showing the equivalent in every system.",
  "Click any <strong>result row</strong> to set that value and unit as the new input for further conversions.",
  "Hover over any row and click the <strong>copy icon</strong> to copy a result to your clipboard.",
];

const faqs = [
  {
    question: "How many pounds are in a kilogram?",
    answer: "<strong>1 kg = 2.20462 lbs.</strong> Conversely, 1 lb = 0.453592 kg. This is one of the most common weight conversions needed when travelling between countries that use metric and imperial measurement systems.",
  },
  {
    question: "What is the difference between a metric ton, a short ton, and a long ton?",
    answer: "A <strong>metric ton (tonne) = 1,000 kg ≈ 2,204.6 lbs.</strong> A <strong>US short ton = 2,000 lbs = 907.185 kg.</strong> A <strong>UK long ton = 2,240 lbs = 1,016.05 kg.</strong> The term \"ton\" alone is ambiguous, so the type should always be specified in technical or commercial contexts.",
  },
  {
    question: "How many grams are in an ounce?",
    answer: "<strong>1 oz (avoirdupois) = 28.3495 grams.</strong> Note that the <strong>troy ounce</strong>, used for precious metals like gold and silver, is heavier: 1 troy oz = 31.1035 grams.",
  },
  {
    question: "What is a stone and where is it used?",
    answer: "A <strong>stone = 14 pounds = 6.35029 kg.</strong> It is used informally in the <strong>UK and Ireland</strong> to express body weight. For example, a person weighing 70 kg is approximately 11 stone.",
  },
  {
    question: "What is the difference between mass and weight?",
    answer: "<strong>Mass</strong> is the amount of matter in an object, measured in kilograms or pounds-mass, and does not change based on location. <strong>Weight</strong> is the gravitational force acting on that mass, measured in newtons or pound-force. In everyday usage, the terms are used interchangeably, but in science they are distinct quantities.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All conversions happen <strong>locally in your browser</strong> — nothing is transmitted.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About Weight and Mass Measurement",
    content: `<p>In everyday usage, <strong>weight</strong> and <strong>mass</strong> are treated as the same thing, though they are technically different: mass is the amount of matter in an object, while weight is the gravitational force acting on it.</p>
<p>The metric system uses <strong>grams (g) and kilograms (kg)</strong> as its core units. The US customary system uses <strong>ounces (oz) and pounds (lbs)</strong>. The UK uses a mix, with <strong>stone</strong> still common for body weight. For large quantities, the <strong>metric tonne (1,000 kg)</strong>, US short ton (2,000 lbs), and UK long ton (2,240 lbs) are all in use, making it important to clarify which "ton" is meant.</p>`,
  },
  {
    title: "Common Weight Conversions",
    content: `<ul>
<li><strong>1 kg</strong> = 1,000 g ≈ 2.2046 lbs = 35.274 oz</li>
<li><strong>1 lb</strong> = 16 oz = 453.592 g</li>
<li><strong>1 stone</strong> = 14 lbs ≈ 6.350 kg</li>
<li><strong>1 metric tonne</strong> = 1,000 kg ≈ 2,204.6 lbs</li>
<li><strong>1 US short ton</strong> = 2,000 lbs ≈ 907.2 kg</li>
<li><strong>1 troy oz</strong> = 31.1035 g (precious metals)</li>
</ul>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Weight conversion is one of the most frequent everyday calculations:</p>
<ul>
<li><strong>Cooking and recipes</strong> — converting ingredient weights between grams and ounces when using international recipes.</li>
<li><strong>Travel and shipping</strong> — checking baggage weight limits that may be listed in kg or lbs, or calculating shipping costs.</li>
<li><strong>Health and fitness</strong> — converting body weight between kg, lbs, and stone for medical records or fitness tracking.</li>
<li><strong>Commerce and logistics</strong> — reconciling cargo and product weights between metric tonnes and short or long tons.</li>
</ul>`,
  },
];

export default function WeightConverterPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <UnitConverter slug="weight-converter" />
    </ToolContainer>
  );
}
