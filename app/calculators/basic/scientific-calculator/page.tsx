import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { ScientificCalculator } from "@/components/tools/calculators/ScientificCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("scientific-calculator");

const tool = TOOLS.find((t) => t.slug === "scientific-calculator")!;

const howToSteps = [
  "Type numbers and operators using the <strong>on-screen keypad</strong> or your physical keyboard — digits, +, −, ×, ÷, and parentheses all work directly.",
  "Use the <strong>function buttons</strong> (sin, cos, tan, log, ln, √, etc.) to insert mathematical functions — the opening parenthesis is added automatically so you can type the argument immediately.",
  "Toggle <strong>DEG / RAD</strong> in the top-left corner to switch the angle mode used by trigonometric functions (degrees vs. radians).",
  "Press <strong>= or Enter</strong> to evaluate your expression. The result is displayed and automatically stored as <strong>ANS</strong> for use in your next calculation.",
  "Press the <strong>ANS</strong> button (or key) to recall the previous result and chain it into a new expression without retyping.",
];

const faqs = [
  {
    question: "What is the difference between DEG and RAD mode?",
    answer: "<strong>DEG mode</strong> interprets angles in degrees — the unit most people learn in school where a full circle is 360°. <strong>RAD mode</strong> uses radians where a full circle is 2π. For example, sin(90°) = 1 in DEG mode, and sin(π/2) = 1 in RAD mode. Use the toggle in the top-left to switch.",
  },
  {
    question: "How do I calculate log base 10 vs natural log?",
    answer: "The <strong>log</strong> button computes the base-10 logarithm (common log), used in engineering and decibel calculations. The <strong>ln</strong> button computes the natural logarithm (base e ≈ 2.718), used in calculus, growth models, and many scientific formulas.",
  },
  {
    question: "Can I type expressions with my keyboard?",
    answer: "Yes — <strong>digits, operators (+, −, *, /), parentheses, ^ for powers, and ! for factorial</strong> all work from the keyboard. Press <strong>Enter or =</strong> to evaluate. Press <strong>p</strong> to insert π and <strong>e</strong> to insert Euler's number.",
  },
  {
    question: "What does ANS do?",
    answer: "<strong>ANS</strong> inserts the result of your most recently evaluated expression into your current input. This lets you chain calculations — for example, calculating √16 = 4, then pressing ANS + 3 to get 7 — without retyping the previous answer.",
  },
  {
    question: "Is this calculator free?",
    answer: "Yes — completely free with no registration required. All calculations run entirely in your browser.",
  },
  {
    question: "What is the factorial function?",
    answer: "The <strong>factorial</strong> of a non-negative integer n (written n!) is the product of all positive integers up to n. For example, 5! = 5 × 4 × 3 × 2 × 1 = 120. Factorials are used in combinatorics, probability, and many mathematical formulas.",
  },
  {
    question: "How do I calculate a power or root?",
    answer: "Use the <strong>^ button</strong> for any power — for example, 2^8 = 256. For square roots use the <strong>√</strong> button. For cube roots and other roots, use the power with a fractional exponent: 27^(1/3) = 3.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Can a Scientific Calculator Do?",
    content: `<p>A <strong>scientific calculator</strong> goes beyond basic arithmetic to handle the full range of mathematical operations used in school, university, and professional work:</p><ul><li><strong>Trigonometry</strong> — sine, cosine, tangent and their inverses, in degrees or radians.</li><li><strong>Logarithms</strong> — base-10 (log) and natural log (ln), plus their inverses.</li><li><strong>Powers and roots</strong> — any exponent and any root degree.</li><li><strong>Constants</strong> — π (pi) and e (Euler's number) built in.</li><li><strong>Factorials</strong> — for combinatorics and probability.</li></ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>Get the most out of this calculator with these practical tips:</p><ul><li>Always <strong>check your angle mode</strong> (DEG vs RAD) before doing trigonometry — a wrong mode is the most common source of errors.</li><li>Use <strong>parentheses</strong> to control the order of operations. For example, 2+3×4 = 14, but (2+3)×4 = 20.</li><li>Use <strong>ANS</strong> to build on your last result instead of retyping numbers — this avoids rounding errors from manual re-entry.</li><li>For very large or very small numbers, results are shown in <strong>scientific notation</strong> automatically.</li></ul>`,
  },
];

export default function ScientificCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <ScientificCalculator />
    </ToolContainer>
  );
}
