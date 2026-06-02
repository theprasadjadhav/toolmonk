import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { StatisticsCalculator } from "@/components/tools/calculators/StatisticsCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("mode-calculator");
const tool = TOOLS.find((t) => t.slug === "mode-calculator")!;

const howToSteps = [
  "Enter your numbers separated by <strong>spaces, commas, semicolons, or new lines</strong> — include duplicate values deliberately, since the mode is determined by which value repeats most often.",
  "The <strong>mode row is highlighted</strong> in the results table, showing the value or values that appear with the highest frequency in your dataset.",
  "If no value repeats, the result shows <strong>no mode</strong>; if multiple values tie for the highest frequency, <strong>all are listed together</strong> as co-modes.",
];

const faqs = [
  {
    question: "What is the mode?",
    answer:
      "The <strong>mode</strong> is the value that appears most frequently in a dataset. A dataset can have <strong>one mode</strong> (unimodal), <strong>two modes</strong> (bimodal), or more (multimodal) if several values share the highest frequency.",
  },
  {
    question: "What does 'no mode' mean?",
    answer:
      "If every value in the dataset appears <strong>exactly once</strong>, no value is more frequent than any other, so there is no mode. The calculator displays <strong>'no mode'</strong> in this case rather than listing every value.",
  },
  {
    question: "Can there be more than one mode?",
    answer:
      "Yes. When two or more values share the highest frequency, all of them are reported as modes. For example, in the dataset 1, 2, 2, 3, 3 the values 2 and 3 each appear twice — both are modes, making the dataset <strong>bimodal</strong>.",
  },
  {
    question: "Is the mode useful for continuous data?",
    answer:
      "The mode is most meaningful for <strong>discrete or categorical data</strong> — such as survey responses, shoe sizes, or the number of times an event occurs. For continuous numerical measurements (like height or temperature), individual values rarely repeat exactly, so the mean or median is usually more informative.",
  },
  {
    question: "How does the mode differ from the mean and median?",
    answer:
      "The <strong>mean</strong> is the arithmetic average of all values. The <strong>median</strong> is the middle value when sorted. The <strong>mode</strong> is the most common value. In a perfectly symmetric, bell-shaped distribution all three are equal. In skewed or multimodal data they can differ substantially, and using all three together gives the fullest picture of the data.",
  },
  {
    question: "What is a bimodal distribution?",
    answer:
      "A <strong>bimodal distribution</strong> has two distinct peaks — two values (or ranges of values) that occur more frequently than others. This often signals that the data comes from <strong>two different groups or populations</strong> mixed together. For example, the heights of a group containing both adults and children might form a bimodal distribution.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is the Mode?",
    content: `<p>The <strong>mode</strong> is the value that occurs most often in a set of numbers. While the mean and median describe the centre of the data mathematically, the mode tells you which value is the most <strong>common or popular</strong>.</p>
<p>A dataset can have <strong>no mode</strong> (when all values are unique), <strong>one mode</strong> (unimodal), or <strong>multiple modes</strong> (bimodal, trimodal, etc.) when several values share the top frequency.</p>
<p>The mode is the only measure of central tendency that can be used with <strong>non-numeric data</strong>, such as the most popular colour or most frequently chosen answer in a survey.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>The mode is particularly useful when you need to know the most common outcome:</p>
<ul>
<li><strong>Retail and inventory:</strong> The most frequently purchased shoe size or clothing size helps retailers decide how much stock to order.</li>
<li><strong>Survey analysis:</strong> The mode of a multiple-choice question reveals the most popular answer.</li>
<li><strong>Quality control:</strong> The most common defect type in a manufacturing run indicates where to focus improvement efforts.</li>
<li><strong>Scheduling:</strong> The most common arrival time of customers helps optimise staffing levels.</li>
<li><strong>Education:</strong> The most common score on a test can highlight whether the difficulty was well-calibrated.</li>
</ul>`,
  },
];

export default function ModeCalculatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <StatisticsCalculator highlight="mode" />
    </ToolContainer>
  );
}
