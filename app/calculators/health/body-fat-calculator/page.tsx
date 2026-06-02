import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { BodyFatCalculator } from "@/components/tools/calculators/BodyFatCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("body-fat-calculator");
const tool = TOOLS.find((t) => t.slug === "body-fat-calculator")!;

const howToSteps = [
  "Select your <strong>gender</strong>, then use a soft tape measure to record your <strong>height, neck circumference, and waist circumference</strong> in centimeters or inches.",
  "If female, also enter your <strong>hip circumference</strong> measured at the widest point. Optionally enter your <strong>body weight</strong> to see a breakdown of fat mass vs. lean mass in kilograms or pounds.",
  "Your <strong>body fat percentage and category</strong> are calculated instantly using the US Navy method. Results include a comparison to standard fitness ranges for your gender.",
];

const faqs = [
  {
    question: "How should I measure my waist and neck for accurate results?",
    answer: "Measure your <strong>neck</strong> just below the larynx (Adam's apple), with the tape sloping slightly downward at the front. Measure your <strong>waist</strong> at the narrowest point — typically just above the navel — while standing relaxed, not sucking in. Measure <strong>hips</strong> (women only) at the widest point. For best accuracy, take measurements in the morning before eating.",
  },
  {
    question: "What is the US Navy method?",
    answer: "The <strong>US Navy circumference method</strong> estimates body fat using only a tape measure and your height. For men it uses neck and waist; for women it adds the hip measurement. It is a widely used field assessment method with a typical error margin of approximately 3–4% compared to laboratory-grade body composition tests.",
  },
  {
    question: "What is a healthy body fat percentage?",
    answer: "Ranges vary by gender and fitness goal:<br><strong>Men:</strong><ul><li>Essential fat: below 6%</li><li>Athletic: 6–13%</li><li>Fitness: 14–17%</li><li>Average: 18–24%</li><li>Obese: 25% and above</li></ul><strong>Women:</strong><ul><li>Essential fat: below 14%</li><li>Athletic: 14–20%</li><li>Fitness: 21–24%</li><li>Average: 25–31%</li><li>Obese: 32% and above</li></ul>",
  },
  {
    question: "Is body fat percentage more useful than BMI?",
    answer: "<strong>Body fat percentage</strong> provides more detail about actual body composition and is particularly valuable for athletes, who may have a high BMI due to muscle mass while having very low fat. However, both metrics are <strong>screening tools</strong> and should be interpreted alongside a full health assessment by a professional.",
  },
  {
    question: "How often should I measure body fat?",
    answer: "Body fat changes slowly — measuring more than once every <strong>4–8 weeks</strong> usually shows noise rather than real change. For the most consistent readings, always measure at the same time of day (morning is recommended), under the same conditions, and ideally with the same tape measure.",
  },
  {
    question: "Can I use this for tracking fitness progress?",
    answer: "Yes. The circumference method is excellent for <strong>tracking trends over time</strong>. Even if the absolute percentage has a small margin of error, consistent measurements with the same method reliably show whether body composition is improving. Combine it with weight and waist measurements for the most complete picture.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is Body Fat Percentage?",
    content: `<p><strong>Body fat percentage</strong> is the proportion of your total body weight that is made up of fat tissue. The rest — muscles, bones, organs, and water — is called <strong>lean mass</strong>. Unlike BMI, body fat percentage directly measures how much of your body is fat, making it a more specific indicator of body composition.</p><p>Some fat is <strong>essential</strong> for basic bodily functions such as hormone production, insulation, and organ protection. The goal is not to eliminate fat, but to stay within a range that supports health and fitness.</p>`,
  },
  {
    title: "Understanding Your Results",
    content: `<p>Your body fat percentage is categorised as follows:</p><ul><li><strong>Essential fat</strong> — the minimum level needed for survival. Below 6% for men, below 14% for women.</li><li><strong>Athletic</strong> — typical of competitive athletes with rigorous training.</li><li><strong>Fitness</strong> — lean and active; associated with good cardiovascular health.</li><li><strong>Average</strong> — normal range for most healthy adults.</li><li><strong>Obese</strong> — excess fat associated with elevated health risks.</li></ul><p>If weight is provided, the calculator also shows your <strong>fat mass</strong> (kilograms of fat) and <strong>lean mass</strong> (everything else), which is useful for tracking body composition changes over time.</p>`,
  },
];

export default function BodyFatCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <BodyFatCalculator />
    </ToolContainer>
  );
}
