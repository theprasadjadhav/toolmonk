import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { StatisticsCalculator } from "@/components/tools/calculators/StatisticsCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("median-calculator");
const tool = TOOLS.find((t) => t.slug === "median-calculator")!;

const howToSteps = [
  "Enter your numbers separated by <strong>spaces, commas, semicolons, or new lines</strong> — you can enter them in any order because the calculator sorts them internally before finding the middle value.",
  "The <strong>median</strong> is highlighted in the results table — it is the exact middle value of your sorted dataset, giving a central point that is unaffected by outliers.",
  "For an <strong>even count of numbers</strong>, the median is automatically computed as the average of the two middle values, and both middle positions are shown so you can verify the result.",
];

const faqs = [
  {
    question: "What is the median?",
    answer:
      "The <strong>median</strong> is the middle value when a dataset is arranged in ascending order. It divides the dataset into two equal halves — half the values fall below it and half above. If there is an even number of values, the median is the <strong>average of the two central values</strong>.",
  },
  {
    question: "Why is the median useful?",
    answer:
      "The median is a <strong>robust measure of central tendency</strong> — unlike the mean, it is not pulled by extreme outliers. This makes it ideal for describing skewed distributions such as <strong>household incomes, house prices, or age distributions</strong>, where a small number of very high values would distort the mean.",
  },
  {
    question: "Does the order I enter numbers matter?",
    answer:
      "No. The calculator <strong>sorts your numbers internally</strong> before computing the median, so you can enter them in any order — random, ascending, descending, or completely unsorted.",
  },
  {
    question: "What if two numbers share the middle position?",
    answer:
      "When the dataset has an <strong>even count</strong>, two values share the middle. The median is calculated as <strong>(lower middle + upper middle) ÷ 2</strong>. For example, in the dataset 3, 7, 10, 15 the two middle values are 7 and 10, so the median is (7 + 10) ÷ 2 = 8.5.",
  },
  {
    question: "When is the median a better choice than the mean?",
    answer:
      "The median is preferred when the data is <strong>skewed or contains outliers</strong>. For example, if nine people earn $30,000 and one person earns $1,000,000, the mean salary is $127,000 — which does not represent anyone's actual pay. The median salary of $30,000 is far more informative in that case.",
  },
  {
    question: "Can the median be a value that does not appear in my dataset?",
    answer:
      "Yes, when there is an <strong>even number of values</strong>. The median is then the average of the two middle numbers, which may produce a value that is not itself in the dataset. For example, the median of 4, 6, 8, 10 is 7 — a number that does not appear in the list.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is the Median?",
    content: `<p>The <strong>median</strong> is the middle value in a dataset when the values are arranged from smallest to largest. It splits the data into two equal halves: half the values are below the median and half are above.</p>
<p>For an <strong>odd</strong> number of values, the median is the single central value. For an <strong>even</strong> number of values, it is the average of the two values nearest the centre.</p>
<p>Unlike the mean, the median is <strong>not influenced by extreme values</strong>, making it a reliable indicator of the centre even when the data contains outliers or is skewed.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>The median is the preferred summary statistic in many real-world contexts:</p>
<ul>
<li><strong>Income and wages:</strong> Reporting the median household income rather than the mean avoids distortion from very high earners.</li>
<li><strong>Property prices:</strong> The median sale price of homes gives buyers a realistic benchmark unaffected by a few luxury properties.</li>
<li><strong>Medical studies:</strong> Median survival time in clinical trials is often more meaningful than the mean when data is skewed.</li>
<li><strong>Test scores:</strong> When a class has a few very high or very low scores, the median gives a better sense of where most students performed.</li>
</ul>`,
  },
  {
    title: "Understanding Your Results",
    content: `<p>The results table highlights the <strong>median</strong> prominently alongside the mean, mode, standard deviation, and other statistics. Comparing the median to the mean tells you about the shape of your data:</p>
<ul>
<li>If <strong>mean ≈ median</strong>, the data is roughly symmetric.</li>
<li>If <strong>mean &gt; median</strong>, the data is positively skewed (pulled up by high values).</li>
<li>If <strong>mean &lt; median</strong>, the data is negatively skewed (pulled down by low values).</li>
</ul>`,
  },
];

export default function MedianCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <StatisticsCalculator highlight="median" />
    </ToolContainer>
  );
}
