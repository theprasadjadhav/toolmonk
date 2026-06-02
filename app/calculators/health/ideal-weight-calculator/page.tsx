import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { IdealWeightCalculator } from "@/components/tools/calculators/IdealWeightCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("ideal-weight-calculator");
const tool = TOOLS.find((t) => t.slug === "ideal-weight-calculator")!;

const howToSteps = [
  "Select your <strong>gender and unit system</strong> (metric or imperial), then enter your <strong>height</strong> in centimeters or feet and inches.",
  "The calculator simultaneously computes four established ideal body weight formulas — <strong>Devine, Robinson, Miller, and Hamwi</strong> — and displays each result side by side.",
  "The <strong>average of all four formulas</strong> is highlighted as the primary result. Use the copy buttons to copy any individual formula value.",
];

const faqs = [
  {
    question: "Which ideal weight formula is most accurate?",
    answer: "No single formula is universally most accurate — each was developed for a different purpose and population. The <strong>Devine formula</strong> is the most widely used in clinical settings, particularly for medication dosing. The Robinson, Miller, and Hamwi formulas are refinements developed later. <strong>Averaging all four</strong> provides a balanced, less biased estimate.",
  },
  {
    question: "Why do the formulas give different results?",
    answer: "Each formula was derived from <strong>different population studies</strong> conducted at different times and uses slightly different mathematical coefficients. The differences between formulas are typically small — a few kilograms — and all results should be treated as a <strong>range</strong> rather than a single target.",
  },
  {
    question: "Do these formulas account for muscle mass or body composition?",
    answer: "No — all four formulas are based <strong>solely on height and gender</strong>. They do not account for muscle mass, bone density, frame size, or age. Athletes or individuals with high muscle mass may have a healthy body weight well above the formula estimates.",
  },
  {
    question: "What is ideal weight used for clinically?",
    answer: "<strong>Ideal body weight (IBW)</strong> is most commonly used in medicine to calculate medication doses for drugs where dosing by actual body weight would be inappropriate — such as some antibiotics and chemotherapy agents — and for setting ventilator parameters in critical care.",
  },
  {
    question: "Is ideal weight the same as my goal weight?",
    answer: "Not necessarily. <strong>Ideal body weight formulas</strong> are mathematical estimates based on height and gender, designed primarily for medical purposes. Your personal <strong>goal weight</strong> may differ based on your fitness goals, body composition, and what weight you feel best at. Use ideal weight as a reference point, not a rigid target.",
  },
  {
    question: "Should I aim for the average of all four formulas?",
    answer: "The average is a reasonable starting point for most people. If you have a <strong>larger frame or higher muscle mass</strong>, the upper end of the range is likely more appropriate. For a personalised target, consult a healthcare professional who can assess your full body composition.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is Ideal Body Weight?",
    content: `<p><strong>Ideal body weight (IBW)</strong> is an estimated weight range considered healthy and appropriate for a given height and gender. Unlike BMI — which tells you whether your current weight is in a healthy range — IBW gives you a <strong>target weight</strong> to aim for based on established formulas.</p><p>IBW has a long history in clinical medicine, where it is used to calculate drug doses and set parameters for medical equipment. For general users, it provides a practical weight goal tied directly to height.</p>`,
  },
  {
    title: "The Four Ideal Weight Formulas",
    content: `<p>This calculator uses four widely recognised formulas, each derived from different research:</p><ul><li><strong>Devine (1974)</strong> — the most commonly cited formula in clinical medicine; widely used for medication dosing.</li><li><strong>Robinson (1983)</strong> — a revision of the Devine formula based on a larger dataset.</li><li><strong>Miller (1983)</strong> — another Devine refinement, producing slightly lower estimates.</li><li><strong>Hamwi (1964)</strong> — an older formula still used in some clinical contexts, particularly for diabetes management.</li></ul><p>The average of all four provides a balanced estimate that reduces the bias of any single formula.</p>`,
  },
  {
    title: "Understanding Your Results",
    content: `<p>Your results show both the individual formula estimates and their average. Key things to remember:</p><ul><li>Treat the range across formulas as a <strong>healthy weight window</strong>, not a fixed target.</li><li>These formulas do not account for <strong>body composition</strong> — someone with significant muscle mass may be healthy at a weight above the formula range.</li><li>IBW is most useful as a <strong>directional guide</strong>. Your actual ideal weight depends on your genetics, lifestyle, and individual health goals.</li></ul>`,
  },
];

export default function IdealWeightCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <IdealWeightCalculator />
    </ToolContainer>
  );
}
