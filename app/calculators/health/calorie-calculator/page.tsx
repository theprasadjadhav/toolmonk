import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { CalorieCalculator } from "@/components/tools/calculators/CalorieCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("calorie-calculator");
const tool = TOOLS.find((t) => t.slug === "calorie-calculator")!;

const howToSteps = [
  "Select your <strong>gender and unit system</strong>, then enter your <strong>age, weight, and height</strong> in the input fields provided.",
  "Choose the <strong>activity level</strong> that best describes a typical week — options range from sedentary (desk job, little exercise) to extra active (hard training daily or physical labour).",
  "The calculator instantly shows your <strong>BMR</strong> (calories at rest), <strong>TDEE</strong> (maintenance calories), and <strong>daily targets</strong> for gradual weight loss or gain.",
];

const faqs = [
  {
    question: "What is the difference between BMR and TDEE?",
    answer: "<strong>BMR (Basal Metabolic Rate)</strong> is the number of calories your body burns at complete rest just to keep you alive — breathing, circulation, organ function. <strong>TDEE (Total Daily Energy Expenditure)</strong> multiplies your BMR by an activity factor that accounts for all the movement in your day, giving your actual calorie needs.",
  },
  {
    question: "Which formula does this calculator use?",
    answer: "This calculator uses a widely accepted energy expenditure formula to estimate BMR based on weight, height, age, and gender. The result is then multiplied by an activity factor matching your lifestyle to produce your TDEE.",
  },
  {
    question: "How many calories should I cut to lose weight?",
    answer: "A <strong>deficit of approximately 500 calories per day</strong> below your TDEE generally produces about 0.5 kg (1 lb) of fat loss per week. Avoid going below <strong>1,200 kcal/day for women</strong> or <strong>1,500 kcal/day for men</strong> without medical supervision, as very low intakes can impair metabolism and nutrient status.",
  },
  {
    question: "How accurate are calorie calculators?",
    answer: "Calorie estimates are a <strong>useful starting point</strong>, not an exact measurement. Individual metabolism varies with genetics, hormones, muscle mass, and health conditions. A good practice is to use the estimate for 2–3 weeks, monitor your actual weight trend, then adjust your intake by 100–200 calories if results differ from expectations.",
  },
  {
    question: "Which activity level should I choose?",
    answer: "Be honest about your typical week — most people overestimate their activity level. General guidance:<ul><li><strong>Sedentary</strong> — desk job, little to no deliberate exercise.</li><li><strong>Lightly active</strong> — light exercise 1–3 days per week.</li><li><strong>Moderately active</strong> — moderate exercise 3–5 days per week.</li><li><strong>Very active</strong> — hard exercise 6–7 days per week.</li><li><strong>Extra active</strong> — very hard training daily or a physically demanding job.</li></ul>",
  },
  {
    question: "How many calories do I need to build muscle?",
    answer: "To build muscle effectively, aim for a <strong>modest surplus of 200–500 calories per day</strong> above your TDEE while following a strength training programme. Larger surpluses tend to result in more fat gain than muscle gain.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is a Calorie?",
    content: `<p>A <strong>calorie</strong> (technically a kilocalorie, kcal) is a unit of energy. In nutrition, it measures the amount of energy your body extracts from food and drink. Your body uses this energy constantly — to breathe, circulate blood, regulate temperature, move, and think.</p><p>Every person has a <strong>unique energy need</strong> that depends on their size, age, sex, and how active they are. Eating more than you burn leads to weight gain; eating less leads to weight loss. The goal of a calorie calculator is to estimate that personal threshold.</p>`,
  },
  {
    title: "Understanding Your Results",
    content: `<p>The calculator provides three key numbers:</p><ul><li><strong>BMR</strong> — the calories you burn doing nothing at all. This is your baseline.</li><li><strong>TDEE (Maintenance)</strong> — the calories you need to maintain your current weight given your activity level. Eat this amount and your weight stays roughly stable.</li><li><strong>Weight loss / gain targets</strong> — daily calorie amounts adjusted below or above maintenance. A 500 kcal/day deficit produces roughly 0.5 kg of fat loss per week.</li></ul><p>These are estimates. Use them as a starting point and adjust based on real-world results over 2–3 weeks.</p>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>To get the most reliable guidance from your calorie calculation:</p><ul><li><strong>Weigh yourself consistently</strong> — same time of day (morning, after using the bathroom) and same day of the week.</li><li><strong>Track what you eat</strong> — even for a few weeks. Most people are surprised by how many calories common foods contain.</li><li><strong>Adjust gradually</strong> — if your weight is not changing as expected, modify by 100–200 calories at a time rather than making large jumps.</li><li><strong>Account for non-exercise activity</strong> — standing, walking, and fidgeting all burn calories beyond formal exercise.</li></ul>`,
  },
];

export default function CalorieCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <CalorieCalculator />
    </ToolContainer>
  );
}
