import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { StatisticsCalculator } from "@/components/tools/calculators/StatisticsCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("standard-deviation-calculator");
const tool = TOOLS.find((t) => t.slug === "standard-deviation-calculator")!;

const howToSteps = [
  "Enter your numbers into the text area, separated by <strong>spaces, commas, semicolons, or new lines</strong> — you can paste data directly from a spreadsheet column.",
  "The <strong>standard deviation (σ)</strong> row is highlighted in the results table — it expresses the typical distance each value lies from the mean, in the same units as your original data.",
  "The <strong>variance (σ²)</strong> row is also shown directly below; it is the square of the standard deviation and is useful when comparing spread across different datasets.",
];

const faqs = [
  {
    question: "What is standard deviation?",
    answer:
      "<strong>Standard deviation (σ)</strong> measures how much the values in a dataset typically deviate from the mean. A <strong>low standard deviation</strong> means most values are clustered close to the mean; a <strong>high standard deviation</strong> means the values are spread widely. It is expressed in the same units as the original data, making it directly interpretable.",
  },
  {
    question: "Is this population or sample standard deviation?",
    answer:
      "This calculator computes the <strong>population standard deviation</strong>, which divides the sum of squared deviations by <strong>N</strong> (the total count). <strong>Sample standard deviation</strong> divides by <strong>N − 1</strong> instead, which corrects for the tendency of a sample to underestimate the spread of the full population. Use the population formula when you have data for every member of the group; use the sample formula when your data is a subset drawn from a larger population.",
  },
  {
    question: "What is the relationship between standard deviation and variance?",
    answer:
      "<strong>Variance</strong> is the average of the squared deviations from the mean. <strong>Standard deviation</strong> is the square root of variance — it converts the measure back into the original units, making it easier to understand and compare. Both describe spread; standard deviation is usually preferred for reporting because its units match the data.",
  },
  {
    question: "What does a standard deviation of zero mean?",
    answer:
      "A standard deviation of <strong>zero</strong> means every value in the dataset is identical — there is no variation at all. For example, the dataset 5, 5, 5, 5, 5 has a standard deviation of 0.",
  },
  {
    question: "What is the 68-95-99.7 rule?",
    answer:
      "For data that follows a <strong>bell-shaped (normal) distribution</strong>, approximately <strong>68%</strong> of values fall within 1 standard deviation of the mean, <strong>95%</strong> fall within 2 standard deviations, and <strong>99.7%</strong> fall within 3 standard deviations. This rule is widely used to identify typical versus unusual values in a dataset.",
  },
  {
    question: "How is standard deviation used in practice?",
    answer:
      "Standard deviation is used in <strong>quality control</strong> to monitor production consistency, in <strong>finance</strong> to measure investment volatility (risk), in <strong>education</strong> to understand the spread of test scores, and in <strong>scientific research</strong> to report the reliability of measurements. A lower standard deviation generally indicates more consistent, reliable data.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is Standard Deviation?",
    content: `<p><strong>Standard deviation</strong> is a measure of how spread out the values in a dataset are around their mean (average). A small standard deviation means the values are tightly packed together; a large standard deviation means they are widely scattered.</p>
<p>It is calculated in three steps:</p>
<ul>
<li>Find the <strong>mean</strong> of all values.</li>
<li>Calculate the <strong>squared difference</strong> between each value and the mean, then average those squared differences — this gives the <strong>variance</strong>.</li>
<li>Take the <strong>square root</strong> of the variance to get the standard deviation.</li>
</ul>
<p>Because it uses the square root, standard deviation is expressed in the <strong>same units as the original data</strong>, making it the preferred measure of spread for reporting.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Standard deviation is one of the most widely used statistics across many fields:</p>
<ul>
<li><strong>Finance:</strong> The standard deviation of an investment's returns measures its volatility — a higher value means greater risk and greater potential reward.</li>
<li><strong>Manufacturing:</strong> Measuring the standard deviation of product dimensions reveals whether a production process is consistent or erratic.</li>
<li><strong>Education:</strong> A low standard deviation in test scores indicates that most students performed similarly; a high value shows a wide range of performance levels.</li>
<li><strong>Science:</strong> Reporting the standard deviation alongside a mean tells readers how reliable and repeatable the measurements are.</li>
<li><strong>Weather:</strong> The standard deviation of daily temperatures indicates how variable the climate is over a period.</li>
</ul>`,
  },
  {
    title: "Understanding Your Results",
    content: `<p>The highlighted <strong>standard deviation (σ)</strong> tells you the typical distance between each data point and the mean. To interpret it:</p>
<ul>
<li>If σ is <strong>small relative to the mean</strong>, your data is consistent and concentrated.</li>
<li>If σ is <strong>large relative to the mean</strong>, your data is highly variable.</li>
</ul>
<p>For data that is roughly bell-shaped, about <strong>two-thirds of your values</strong> will fall within one standard deviation of the mean, and about <strong>95%</strong> will fall within two standard deviations.</p>
<p>The <strong>variance (σ²)</strong> shown below is the standard deviation squared. It is used in many statistical formulas but is harder to interpret directly because its units are squared.</p>`,
  },
];

export default function StandardDeviationCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <StatisticsCalculator highlight="stdDev" />
    </ToolContainer>
  );
}
