import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { ProbabilityCalculator } from "@/components/tools/calculators/ProbabilityCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("probability-calculator");
const tool = TOOLS.find((t) => t.slug === "probability-calculator")!;

const howToSteps = [
  "Choose a <strong>calculation mode</strong>: <strong>Basic</strong> (favorable outcomes ÷ total outcomes), <strong>Complement</strong> (probability that an event does NOT occur), or <strong>Multiply</strong> (combined probability of two independent events both occurring).",
  "Enter the required values — probabilities can be typed as <strong>decimals</strong> (e.g. 0.3) or <strong>percentages</strong> (e.g. 30%); the calculator detects the format automatically and converts as needed.",
  "Results appear instantly showing the <strong>decimal probability, percentage, and simplified fraction</strong> (in Basic mode), making it easy to interpret the likelihood at a glance.",
];

const faqs = [
  {
    question: "What is probability?",
    answer:
      "Probability is a number between <strong>0 and 1</strong> that expresses how likely an event is to occur. A probability of <strong>0</strong> means the event is impossible; a probability of <strong>1</strong> means it is certain. In the basic case it is calculated as <strong>favorable outcomes ÷ total possible outcomes</strong>.",
  },
  {
    question: "What is a complement in probability?",
    answer:
      "The <strong>complement</strong> of event A is the probability that A does <em>not</em> occur: <strong>P(not A) = 1 − P(A)</strong>. For example, if there is a 30% chance of rain today, there is a 70% chance of no rain. The event and its complement always add up to exactly 1 (or 100%).",
  },
  {
    question: "When can I multiply two probabilities?",
    answer:
      "You can multiply P(A) × P(B) to find P(A and B) <strong>only when A and B are independent</strong> — meaning the outcome of one event has no influence on the other. Flipping a coin and rolling a die are independent; drawing two cards without replacing the first card are <em>not</em> independent.",
  },
  {
    question: "Can I enter probabilities as percentages?",
    answer:
      "Yes. In Complement and Multiply modes you can enter either a <strong>decimal</strong> (e.g. 0.25) or a <strong>percentage</strong> (e.g. 25%). The calculator detects the format automatically and normalises everything to a 0–1 scale before computing.",
  },
  {
    question: "What is the difference between theoretical and experimental probability?",
    answer:
      "<strong>Theoretical probability</strong> is calculated from known, equally likely outcomes — for example, the probability of rolling a 4 on a fair die is 1/6. <strong>Experimental probability</strong> is estimated from actual observed results — if you rolled the die 600 times and got a 4 on 103 of them, the experimental probability is 103/600. As the number of trials increases, experimental probability tends to approach theoretical probability.",
  },
  {
    question: "What does it mean if two events are mutually exclusive?",
    answer:
      "<strong>Mutually exclusive events</strong> cannot both occur at the same time. For example, a single coin flip cannot be both heads and tails. For mutually exclusive events, the probability that <em>either</em> occurs is simply <strong>P(A) + P(B)</strong>. If the events are not mutually exclusive (they can both happen), you must subtract the probability that both occur to avoid counting it twice.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is Probability?",
    content: `<p><strong>Probability</strong> measures how likely an event is to happen, expressed as a number between <strong>0</strong> (impossible) and <strong>1</strong> (certain). It can also be written as a percentage between 0% and 100%.</p>
<p>The basic formula is: <strong>Probability = Favorable Outcomes ÷ Total Possible Outcomes</strong>.</p>
<p>For example, rolling a 3 on a standard six-sided die has 1 favorable outcome out of 6 total, giving a probability of 1/6 ≈ 0.167 ≈ 16.7%.</p>`,
  },
  {
    title: "How It Works",
    content: `<p>This calculator supports three common probability calculations:</p>
<ul>
<li><strong>Basic probability:</strong> Divide the number of favorable outcomes by the total number of equally likely outcomes. The result is shown as a decimal, percentage, and simplified fraction.</li>
<li><strong>Complement:</strong> The probability of an event <em>not</em> happening is 1 minus the probability that it does happen. Useful when it is easier to count the cases where the event fails than the cases where it succeeds.</li>
<li><strong>Multiplication (independent events):</strong> When two events are independent, the probability that <em>both</em> occur is the product of their individual probabilities.</li>
</ul>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Probability calculations appear in everyday decisions and specialised fields alike:</p>
<ul>
<li><strong>Games of chance:</strong> Calculating the odds of drawing a specific card, rolling a target number, or winning a lottery.</li>
<li><strong>Weather forecasting:</strong> A 70% chance of rain means that, under similar atmospheric conditions, rain occurred about 70% of the time historically.</li>
<li><strong>Medical testing:</strong> Understanding the probability that a positive test result is a true positive versus a false positive.</li>
<li><strong>Risk assessment:</strong> Estimating the likelihood of equipment failure, project delays, or adverse events to prioritise mitigation efforts.</li>
<li><strong>Sports and betting:</strong> Evaluating odds and converting between fractional, decimal, and percentage formats.</li>
</ul>`,
  },
];

export default function ProbabilityCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <ProbabilityCalculator />
    </ToolContainer>
  );
}
