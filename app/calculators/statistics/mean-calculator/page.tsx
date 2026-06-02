import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { StatisticsCalculator } from "@/components/tools/calculators/StatisticsCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("mean-calculator");
const tool = TOOLS.find((t) => t.slug === "mean-calculator")!;

const howToSteps = [
  "Enter your numbers into the text area, using <strong>spaces, commas, semicolons, or new lines</strong> to separate each value — you can also paste a column of numbers directly from a spreadsheet.",
  "The <strong>mean (arithmetic average)</strong> is calculated instantly by summing all values and dividing by the count; it is highlighted at the top of the results table alongside the sum, count, min, and max.",
  "Use the <strong>Copy button</strong> next to any statistic in the results table to copy that individual value to your clipboard for use in other applications.",
];

const faqs = [
  {
    question: "What is the arithmetic mean?",
    answer:
      "The <strong>arithmetic mean</strong> is the sum of all values in a dataset divided by how many values there are. It represents the <strong>central balancing point</strong> of the data and is the most commonly used measure of central tendency, often simply called 'the average'.",
  },
  {
    question: "How is the mean different from the median?",
    answer:
      "The mean uses <strong>every value</strong> in the dataset, so a single extreme outlier can pull it significantly higher or lower. The <strong>median</strong> is the middle value when the data is sorted and is unaffected by outliers. For symmetric, bell-shaped data they are similar; for skewed data like incomes they can differ greatly.",
  },
  {
    question: "When should I use the mean instead of the median?",
    answer:
      "Use the mean when your data is <strong>symmetrically distributed without extreme outliers</strong> — for example, repeated measurements of a physical quantity, exam scores in a large class, or heights of people. Use the median when your data is skewed or when outliers are present, such as property prices or household incomes.",
  },
  {
    question: "Can I paste a spreadsheet column of numbers?",
    answer:
      "Yes. Copy a column from any spreadsheet application and paste it directly into the input area. <strong>Each number on its own line is fully supported</strong>, and any blank lines between values are ignored automatically.",
  },
  {
    question: "What is the difference between population mean and sample mean?",
    answer:
      "The <strong>population mean</strong> (μ) is calculated from every member of the entire group you are studying. The <strong>sample mean</strong> (x̄) is calculated from a subset drawn from that population. Both use the same formula — sum divided by count — but the sample mean is used to <em>estimate</em> the population mean when measuring every member is impractical.",
  },
  {
    question: "Why does the mean not always represent a 'typical' value?",
    answer:
      "The mean can be misleading when data is <strong>heavily skewed or contains outliers</strong>. For example, the mean salary in a company is pulled upward by a few very high earners, making it appear higher than what most employees earn. In such cases, the <strong>median</strong> better represents the typical experience.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is the Mean?",
    content: `<p>The <strong>arithmetic mean</strong> — commonly called the average — is found by adding all values in a dataset and dividing by the number of values. It answers the question: "If all values were redistributed equally, what would each one be?"</p>
<p>For example, the mean of 4, 7, 13, and 16 is (4 + 7 + 13 + 16) ÷ 4 = 40 ÷ 4 = <strong>10</strong>.</p>
<p>The mean is sensitive to every value in the dataset, which makes it a thorough summary measure — but also means that a single very large or very small value can shift it considerably.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>The mean is used across almost every field that works with numbers:</p>
<ul>
<li><strong>Education:</strong> Calculating a student's average grade across multiple assignments or tests.</li>
<li><strong>Science:</strong> Averaging repeated experimental measurements to reduce the effect of random variation.</li>
<li><strong>Finance:</strong> Computing the average return on an investment over multiple periods.</li>
<li><strong>Sports:</strong> Determining a player's average score, speed, or performance rating across a season.</li>
<li><strong>Quality control:</strong> Monitoring the average dimension of manufactured parts to detect drift from specification.</li>
</ul>`,
  },
  {
    title: "Understanding Your Results",
    content: `<p>The results table shows several statistics at once. The <strong>mean</strong> is highlighted as the primary result. Alongside it you will find the <strong>sum</strong> (total of all values), the <strong>count</strong> (how many values you entered), and the <strong>min</strong> and <strong>max</strong>.</p>
<p>If the mean is very close to the median, your data is likely <strong>roughly symmetric</strong>. If the mean is noticeably higher or lower than the median, your data is <strong>skewed</strong>, and the median may be a more representative measure of the centre.</p>`,
  },
];

export default function MeanCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <StatisticsCalculator highlight="mean" />
    </ToolContainer>
  );
}
