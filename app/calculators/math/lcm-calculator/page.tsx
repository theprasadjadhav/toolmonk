import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { GcdLcmCalculator } from "@/components/tools/calculators/GcdLcmCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("lcm-calculator");
const tool = TOOLS.find((t) => t.slug === "lcm-calculator")!;

const howToSteps = [
  "Enter <strong>two or more positive whole numbers</strong> into the input box, separated by spaces, commas, or new lines — for example, type <strong>4 6 10</strong> to find the smallest number divisible by all three.",
  "The calculator derives the LCM using the relationship <strong>LCM(a, b) = (a ÷ GCD(a, b)) × b</strong>, processing numbers pairwise from left to right so larger lists are handled accurately without overflow.",
  "Read the <strong>LCM result</strong>, review the reduction chain shown below, then click <strong>Copy</strong> to copy the value to your clipboard.",
];

const faqs = [
  {
    question: "What is the LCM?",
    answer:
      "The <strong>Least Common Multiple (LCM)</strong> of two or more integers is the smallest positive integer that is <strong>evenly divisible by all of them</strong>. For example, LCM(4, 6) = 12 because 12 is the smallest number that both 4 and 6 divide into without a remainder.",
  },
  {
    question: "How is LCM calculated from GCD?",
    answer:
      "For any two positive integers a and b: <strong>LCM(a, b) = (a ÷ GCD(a, b)) × b</strong>. Dividing by the GCD first prevents the product from becoming unnecessarily large during the calculation, ensuring accuracy even for bigger numbers.",
  },
  {
    question: "Can I find the LCM of more than two numbers?",
    answer:
      "Yes. Enter as many positive integers as you need, separated by spaces, commas, or new lines. The calculator applies the LCM formula pairwise from left to right: LCM(a, b, c) = LCM(LCM(a, b), c), and so on, showing each intermediate step.",
  },
  {
    question: "What is the LCM useful for?",
    answer:
      "LCM is most commonly used to find the <strong>lowest common denominator</strong> when adding or subtracting fractions with different denominators. It also helps solve problems about <strong>synchronising repeating events</strong> — for example, determining when two recurring schedules will next coincide — and appears in modular arithmetic.",
  },
  {
    question: "What is the relationship between LCM and GCD?",
    answer:
      "For any two positive integers a and b, <strong>LCM(a, b) × GCD(a, b) = a × b</strong>. This means knowing either the LCM or the GCD immediately gives you the other. The two measures together fully characterise the divisibility relationship between a pair of numbers.",
  },
  {
    question: "What is LCM(a, 1) and LCM(a, a)?",
    answer:
      "<strong>LCM(a, 1) = a</strong> because every integer is a multiple of 1. <strong>LCM(a, a) = a</strong> because the smallest multiple shared by two identical numbers is the number itself. These edge cases confirm the LCM is always at least as large as the larger of the two inputs.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is the Least Common Multiple?",
    content: `<p>The <strong>Least Common Multiple (LCM)</strong> of two or more numbers is the smallest positive number that all of the given numbers divide into without a remainder. It is sometimes called the <strong>Lowest Common Multiple</strong> or <strong>Smallest Common Multiple</strong>.</p>
<p>For example, multiples of 4 are 4, 8, 12, 16, 20 … and multiples of 6 are 6, 12, 18, 24 … The first number that appears in both lists is <strong>12</strong>, so LCM(4, 6) = 12.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>The LCM solves a wide range of everyday and academic problems:</p>
<ul>
<li><strong>Adding fractions:</strong> To add 1/4 + 1/6, you need the LCM of 4 and 6 (which is 12) as the common denominator, giving 3/12 + 2/12 = 5/12.</li>
<li><strong>Scheduling:</strong> If bus A runs every 8 minutes and bus B every 12 minutes, LCM(8, 12) = 24 tells you they next depart together in 24 minutes.</li>
<li><strong>Gear and cycle problems:</strong> Determining when two rotating gears or cyclical processes return to their starting position at the same time.</li>
<li><strong>Distributing items equally:</strong> Finding the smallest batch size that can be divided evenly into groups of different sizes.</li>
</ul>`,
  },
];

export default function LcmCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <GcdLcmCalculator mode="lcm" />
    </ToolContainer>
  );
}
