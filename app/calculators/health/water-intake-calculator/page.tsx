import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { WaterIntakeCalculator } from "@/components/tools/calculators/WaterIntakeCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("water-intake-calculator");
const tool = TOOLS.find((t) => t.slug === "water-intake-calculator")!;

const howToSteps = [
  "Enter your <strong>body weight</strong> in kg or lbs — use the unit toggle to switch between the two.",
  "Select your <strong>activity level</strong> (sedentary to very active) and the <strong>climate</strong> you live or work in (temperate, hot, or very hot/humid).",
  "Your <strong>recommended daily water intake</strong> is shown in liters, milliliters, standard glasses, and fluid ounces — along with a breakdown showing how each factor contributes to the total.",
];

const faqs = [
  {
    question: "How much water should I drink per day?",
    answer: "A common general guideline is <strong>33 ml per kg of body weight</strong>. For a 70 kg person that is approximately 2.3 liters per day under normal conditions. Activity level and climate both increase your needs, which is why this calculator adjusts for both factors.",
  },
  {
    question: "Does coffee or tea count toward my water intake?",
    answer: "Caffeinated drinks have a mild diuretic effect but research shows they still provide a <strong>net positive contribution to hydration</strong>. Most health guidelines count coffee, tea, juice, and other beverages toward your daily fluid intake. However, plain water is preferable as the primary source because it contains no calories, sugar, or additives.",
  },
  {
    question: "Why does hot climate increase water needs?",
    answer: "You lose significantly more water through <strong>sweating</strong> when temperatures and humidity are high. The calculator adds a 10% adjustment for <strong>hot climates</strong> and 20% for <strong>very hot or humid conditions</strong> to account for these additional losses.",
  },
  {
    question: "Can you drink too much water?",
    answer: "Yes. <strong>Overhydration (hyponatremia)</strong> can occur when large volumes are consumed rapidly, diluting sodium in the blood to dangerous levels. In everyday life this is rare, but it is a recognised risk in endurance sports. The amounts in this calculator represent <strong>totals spread throughout the day</strong>, not amounts to drink at once.",
  },
  {
    question: "Does exercise change how much water I need?",
    answer: "Yes — exercise increases water needs substantially. A general rule is to drink an extra <strong>500–750 ml per hour of moderate exercise</strong>. In hot weather or very intense activity, losses can be even higher. Selecting the appropriate activity level in this calculator accounts for a portion of this increased need.",
  },
  {
    question: "What are signs of dehydration?",
    answer: "Common signs of <strong>mild to moderate dehydration</strong> include dark yellow urine, thirst, dry mouth, headache, and reduced concentration. <strong>Severe dehydration</strong> causes dizziness, rapid heartbeat, and confusion and requires prompt medical attention. The goal is to keep urine a pale straw colour throughout the day.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Why Hydration Matters",
    content: `<p>Water makes up approximately <strong>60% of the human body</strong> and is essential for virtually every bodily function — from regulating temperature and transporting nutrients to flushing waste and lubricating joints. Even mild dehydration (as little as 1–2% of body weight lost) can impair physical performance, concentration, and mood.</p><p>Despite its importance, many people do not drink enough water during the day, particularly when busy, in air-conditioned environments, or in cooler weather when thirst signals are weaker.</p>`,
  },
  {
    title: "Factors That Affect Your Water Needs",
    content: `<p>Daily water requirements are not one-size-fits-all. Several factors increase or decrease how much you need:</p><ul><li><strong>Body weight</strong> — larger bodies have more cells to hydrate and typically need more water.</li><li><strong>Physical activity</strong> — exercise increases fluid loss through sweat significantly.</li><li><strong>Climate and temperature</strong> — heat and humidity increase sweat rates and water loss.</li><li><strong>Diet</strong> — fruits, vegetables, and soups provide fluid; salty or high-protein diets increase water needs.</li><li><strong>Health conditions</strong> — fever, illness, and some medications affect fluid requirements.</li></ul>`,
  },
  {
    title: "Tips for Staying Hydrated",
    content: `<p>Practical strategies to meet your daily water intake:</p><ul><li><strong>Start your day with water</strong> — drink a glass first thing in the morning to replace fluid lost overnight.</li><li><strong>Carry a reusable bottle</strong> — having water visible and accessible makes it far easier to drink consistently.</li><li><strong>Drink before meals</strong> — a glass of water before each meal adds up quickly and may help with portion control.</li><li><strong>Monitor urine colour</strong> — pale straw yellow is well-hydrated; dark yellow means you need more water.</li><li><strong>Eat water-rich foods</strong> — cucumbers, watermelon, oranges, and lettuce all contribute to your daily fluid intake.</li></ul>`,
  },
];

export default function WaterIntakeCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <WaterIntakeCalculator />
    </ToolContainer>
  );
}
