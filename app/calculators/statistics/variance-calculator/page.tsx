import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { StatisticsCalculator } from "@/components/tools/calculators/StatisticsCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("variance-calculator");
const tool = TOOLS.find((t) => t.slug === "variance-calculator")!;

const howToSteps = [
  "Enter your numbers separated by <strong>spaces, commas, semicolons, or new lines</strong> — you can paste a list directly from a spreadsheet or text document.",
  "The <strong>variance (σ²)</strong> row is highlighted in the results table — it represents the average squared distance of each value from the mean, capturing how dispersed your data is.",
  "The <strong>standard deviation (σ)</strong> row is also shown; it is the square root of variance and expresses spread in the <strong>same units as your original data</strong> for easier interpretation.",
];

const faqs = [
  {
    question: "What is variance?",
    answer:
      "<strong>Variance (σ²)</strong> is the average of the squared differences between each value and the mean of the dataset. It quantifies how spread out the values are — a variance close to zero means the values are tightly clustered around the mean, while a large variance means they are widely dispersed.",
  },
  {
    question: "Is this population or sample variance?",
    answer:
      "This calculator computes <strong>population variance</strong>, which divides the sum of squared deviations by <strong>N</strong> (the full count). <strong>Sample variance</strong> divides by <strong>N − 1</strong> instead — this adjustment, known as Bessel's correction, compensates for the fact that a sample tends to underestimate the true spread of the larger population it was drawn from.",
  },
  {
    question: "Why is variance squared while standard deviation is not?",
    answer:
      "Variance uses <strong>squared differences</strong> to ensure that positive deviations (values above the mean) and negative deviations (values below the mean) do not cancel each other out. The squaring also penalises larger deviations more heavily. Standard deviation is the square root of variance, which converts the measure back into the <strong>original units</strong> of the data.",
  },
  {
    question: "When should I use variance instead of standard deviation?",
    answer:
      "Variance is commonly used in <strong>statistical derivations and formulas</strong> — for example, in analysis of variance (ANOVA) and in combining the spreads of multiple datasets. <strong>Standard deviation</strong> is usually preferred for reporting and communication because it is expressed in the same unit as the original data and is therefore easier to interpret directly.",
  },
  {
    question: "Can variance ever be negative?",
    answer:
      "No. Because variance is computed from <strong>squared differences</strong>, every term in the sum is zero or positive. Variance is always <strong>zero or greater</strong>. It equals zero only when all values in the dataset are identical.",
  },
  {
    question: "How does variance relate to the spread of a distribution?",
    answer:
      "Variance is a direct mathematical measure of spread. <strong>Doubling the variance</strong> means the data is more dispersed, not that every value has doubled. Because variance is in squared units, comparing variances across datasets with different units or scales can be misleading — standard deviation (the square root) is often easier to compare. However, variance is additive in ways that standard deviation is not, which makes it valuable in advanced statistical analysis.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is Variance?",
    content: `<p><strong>Variance</strong> measures how far the values in a dataset are spread from their mean. It is calculated by:</p>
<ul>
<li>Finding the <strong>mean</strong> of all values.</li>
<li>Subtracting the mean from each value to get the <strong>deviation</strong>.</li>
<li><strong>Squaring</strong> each deviation (to eliminate negatives and amplify larger gaps).</li>
<li>Averaging the squared deviations — this average is the <strong>variance</strong>.</li>
</ul>
<p>Because of the squaring step, variance is expressed in <strong>squared units</strong> (e.g., if your data is in metres, variance is in metres²). Taking the square root gives the <strong>standard deviation</strong>, which returns the measure to the original units.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Variance is fundamental to statistical analysis across many disciplines:</p>
<ul>
<li><strong>Finance:</strong> Portfolio variance measures the total risk of a collection of investments; lower variance indicates more stable, predictable returns.</li>
<li><strong>Quality control:</strong> Manufacturers track variance in product dimensions to ensure consistency — a rising variance signals a process that is drifting out of control.</li>
<li><strong>Scientific research:</strong> Variance quantifies how repeatable an experiment is; low variance means results are consistent across trials.</li>
<li><strong>Comparing datasets:</strong> Variance provides a single number to compare the spread of two different groups — for example, whether Group A or Group B showed more variable outcomes.</li>
</ul>`,
  },
  {
    title: "Understanding Your Results",
    content: `<p>The highlighted <strong>variance (σ²)</strong> is the primary result. A <strong>large variance</strong> indicates the values are widely scattered; a <strong>small variance</strong> indicates they are tightly grouped around the mean.</p>
<p>The <strong>standard deviation (σ)</strong> shown directly below is the square root of variance. Because it is in the original units of your data, it is usually easier to communicate and compare. For example, if your dataset contains heights in centimetres, the standard deviation is also in centimetres — while the variance would be in cm².</p>
<p>If variance is <strong>zero</strong>, all values in your dataset are identical and there is no spread at all.</p>`,
  },
];

export default function VarianceCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <StatisticsCalculator highlight="variance" />
    </ToolContainer>
  );
}
