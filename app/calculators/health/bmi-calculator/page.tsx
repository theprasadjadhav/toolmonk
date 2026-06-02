import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { BmiCalculator } from "@/components/tools/calculators/BmiCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("bmi-calculator");
const tool = TOOLS.find((t) => t.slug === "bmi-calculator")!;

const howToSteps = [
  "Select your preferred <strong>unit system</strong> — metric (kg and cm) or imperial (lbs, feet, and inches) — using the toggle at the top.",
  "Enter your <strong>weight and height</strong> in the corresponding input fields. Use the sub-fields for feet and inches if using imperial units.",
  "Your <strong>BMI value, weight category, and healthy weight range</strong> for your height are displayed instantly below the inputs.",
];

const faqs = [
  {
    question: "What is a healthy BMI range?",
    answer: "For adults, a BMI between <strong>18.5 and 24.9</strong> is considered normal weight. Below 18.5 is underweight, 25–29.9 is overweight, and 30 or above is classified as obese. These thresholds are set by the World Health Organization and are widely used in clinical practice.",
  },
  {
    question: "Is BMI accurate for everyone?",
    answer: "BMI is a useful <strong>population-level screening tool</strong> but has known limitations. It does not distinguish between muscle mass and fat mass, so athletes or people with high muscle mass may score as overweight despite being healthy. Age, sex, and ethnicity can also affect how BMI relates to health risk. For a complete assessment, consult a healthcare professional.",
  },
  {
    question: "How is BMI calculated?",
    answer: "<strong>BMI = weight (kg) ÷ height (m)²</strong>. For example, a person weighing 70 kg at 1.75 m has a BMI of 70 ÷ (1.75 × 1.75) ≈ 22.9, which falls in the normal range.",
  },
  {
    question: "What is the healthy weight range shown in the results?",
    answer: "The <strong>healthy weight range</strong> shows the minimum and maximum body weight that would place you within the normal BMI category (18.5–24.9) for your specific height. It helps you understand how far you are from the healthy range in concrete weight terms.",
  },
  {
    question: "Does BMI apply to children?",
    answer: "Standard BMI categories are designed for <strong>adults aged 20 and over</strong>. For children and teenagers, BMI is interpreted differently using age- and sex-specific growth charts, often called BMI-for-age. This calculator uses adult thresholds.",
  },
  {
    question: "What should I do if my BMI is outside the normal range?",
    answer: "A BMI outside the normal range is a signal worth discussing with a <strong>healthcare provider</strong>, not a diagnosis. Many factors — including muscle mass, bone density, and overall lifestyle — affect health. A doctor can provide personalised guidance based on your full health picture.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is Body Mass Index (BMI)?",
    content: `<p><strong>Body Mass Index (BMI)</strong> is a simple numerical measure calculated from a person's weight and height. It is used worldwide as a quick screening tool to categorise weight status — from underweight to obese — in adult populations.</p><p>BMI does not directly measure body fat, but research has shown it correlates reasonably well with more precise measures of body composition at the population level. It is valued for its simplicity: all you need are two measurements.</p>`,
  },
  {
    title: "Understanding Your BMI Result",
    content: `<p>BMI results fall into four standard categories:</p><ul><li><strong>Underweight</strong> — BMI below 18.5. May indicate inadequate nutrition or other health issues.</li><li><strong>Normal weight</strong> — BMI 18.5 to 24.9. Associated with the lowest health risk in most studies.</li><li><strong>Overweight</strong> — BMI 25 to 29.9. Slightly elevated risk for some conditions; lifestyle changes may be beneficial.</li><li><strong>Obese</strong> — BMI 30 or above. Associated with higher risk for cardiovascular disease, type 2 diabetes, and other conditions.</li></ul><p>Remember that BMI is a screening tool, not a diagnostic measure. Always discuss results with a healthcare professional.</p>`,
  },
  {
    title: "Limitations of BMI",
    content: `<p>While widely used, BMI has several important limitations to be aware of:</p><ul><li><strong>Muscle vs. fat</strong> — athletes with high muscle mass may have an elevated BMI despite low body fat.</li><li><strong>Age</strong> — older adults tend to have more fat and less muscle at the same BMI as younger adults.</li><li><strong>Ethnicity</strong> — some health organisations recommend lower BMI thresholds for certain ethnic groups due to differing risk profiles.</li><li><strong>Pregnancy</strong> — BMI is not a useful measure during pregnancy.</li></ul><p>For a more complete picture of body composition, tools like waist circumference measurement or body fat percentage can provide additional information.</p>`,
  },
];

export default function BmiCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <BmiCalculator />
    </ToolContainer>
  );
}
