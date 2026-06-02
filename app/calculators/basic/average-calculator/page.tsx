import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { StatisticsCalculator } from "@/components/tools/calculators/StatisticsCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("average-calculator");
const tool = TOOLS.find((t) => t.slug === "average-calculator")!;

const howToSteps = [
  "Enter your numbers in the text area — separated by <strong>spaces, commas, semicolons, or new lines</strong>. You can paste data directly from a spreadsheet.",
  "Statistics are <strong>calculated instantly</strong> as you type: mean, median, sum, count, min, max, range, and standard deviation — no button press needed.",
  "Click any <strong>copy button</strong> next to a result to copy that specific statistic to your clipboard for use elsewhere.",
];

const faqs = [
  {
    question: "What separators can I use between numbers?",
    answer: "You can use <strong>spaces, commas, semicolons, or new lines</strong> — or mix them freely in the same input. The tool parses all valid numbers and ignores unrecognized characters.",
  },
  {
    question: "What is the difference between mean and median?",
    answer: "The <strong>mean</strong> (average) is calculated by adding all numbers and dividing by the count. The <strong>median</strong> is the middle value when the numbers are sorted. The median is less affected by extreme outliers — for example, a list like 1, 2, 3, 4, 100 has a mean of 22 but a median of 3.",
  },
  {
    question: "What is standard deviation?",
    answer: "<strong>Standard deviation</strong> measures how spread out the numbers are around the mean. A low standard deviation means most values cluster tightly near the mean; a high one means the values are widely spread. It is commonly used in statistics, science, finance, and quality control.",
  },
  {
    question: "Is there a limit to how many numbers I can enter?",
    answer: "There is no hard limit — the calculator handles thousands of numbers comfortably. For very large datasets you can paste data copied from a spreadsheet or text file.",
  },
  {
    question: "What is the range?",
    answer: "The <strong>range</strong> is simply the largest value minus the smallest value in your dataset. It gives a quick sense of how wide the spread of your data is, though it is sensitive to extreme outliers.",
  },
  {
    question: "When should I use mean vs. median?",
    answer: "Use the <strong>mean</strong> when your data has no extreme outliers and you want a true arithmetic average — for example, averaging test scores. Use the <strong>median</strong> when your data is skewed or has outliers — for example, household income data where a few very high earners would pull the mean upward.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Understanding the Statistics",
    content: `<p>This calculator computes several common descriptive statistics at once:</p><ul><li><strong>Mean</strong> — the arithmetic average; the sum of all values divided by the count.</li><li><strong>Median</strong> — the middle value in a sorted list; splits the dataset in half.</li><li><strong>Sum</strong> — the total of all numbers added together.</li><li><strong>Min / Max</strong> — the smallest and largest values in the dataset.</li><li><strong>Range</strong> — the difference between the max and min; a simple measure of spread.</li><li><strong>Standard Deviation</strong> — measures how far values typically deviate from the mean.</li></ul><p>Together, these statistics give you a complete snapshot of any set of numbers.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>An average and statistics calculator is useful across many fields:</p><ul><li><strong>Academics</strong> — calculating grade averages or test score distributions.</li><li><strong>Finance</strong> — finding the average return, median price, or spread of investment values.</li><li><strong>Science and research</strong> — summarizing experimental measurements quickly.</li><li><strong>Sports and fitness</strong> — averaging lap times, distances, or performance metrics.</li><li><strong>Business</strong> — analyzing sales figures, customer ratings, or survey responses.</li></ul>`,
  },
];

export default function AverageCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <StatisticsCalculator highlight="mean" />
    </ToolContainer>
  );
}
