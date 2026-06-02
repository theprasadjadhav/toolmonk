import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { UnitConverter } from "@/components/tools/converters/UnitConverter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("power-converter");

const tool = TOOLS.find((t) => t.slug === "power-converter")!;

const howToSteps = [
  "Type any <strong>power value</strong> into the input field at the top of the converter.",
  "Choose your <strong>source unit</strong> from the dropdown — options include watts, kilowatts, megawatts, horsepower (mechanical and metric), BTU/hour, and more.",
  "All other power units <strong>update instantly</strong> as you type, showing the equivalent in every system.",
  "Click any <strong>result row</strong> to set that value and unit as the new input for further conversions.",
  "Hover over any row and click the <strong>copy icon</strong> to copy a result to your clipboard.",
];

const faqs = [
  {
    question: "How many watts are in one horsepower?",
    answer: "<strong>1 mechanical horsepower (hp) = 745.7 W.</strong> The metric horsepower (PS or CV), used in Europe for vehicle ratings, equals <strong>735.5 W</strong>. Both are close but not identical, so it matters which definition a specification uses.",
  },
  {
    question: "What is the difference between kW and kWh?",
    answer: "<strong>kW (kilowatt)</strong> is a unit of <em>power</em> — the rate at which energy is used or produced at any given moment. <strong>kWh (kilowatt-hour)</strong> is a unit of <em>energy</em> — the total amount consumed over time. A 1 kW device running for 1 hour uses 1 kWh of energy.",
  },
  {
    question: "How many watts are in a BTU/hour?",
    answer: "<strong>1 BTU/h ≈ 0.29307 W.</strong> This conversion is commonly needed when comparing US air-conditioning ratings (given in BTU/hr) with international ratings (given in watts or kW).",
  },
  {
    question: "What is a megawatt?",
    answer: "<strong>1 MW (megawatt) = 1,000 kW = 1,000,000 W.</strong> Megawatts are used to measure the output of power stations and large industrial installations. A typical nuclear power reactor produces about 1,000 MW (1 GW).",
  },
  {
    question: "What is the difference between mechanical and metric horsepower?",
    answer: "<strong>Mechanical (imperial) horsepower</strong> = 745.699 W, defined historically in the US and UK. <strong>Metric horsepower (PS)</strong> = 735.499 W, defined as the power to lift 75 kg at 1 m/s. The difference is about 1.4%, but for precise engineering calculations the correct variant should be specified.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All conversions happen <strong>locally in your browser</strong> — nothing is transmitted.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About Power Measurement",
    content: `<p><strong>Power</strong> is the rate at which energy is transferred or converted — in other words, how much work is done per unit of time. The SI unit of power is the <strong>watt (W)</strong>, equal to one joule per second.</p>
<p>Power measurements appear in a wide variety of contexts: electrical appliances are rated in watts, vehicle engines in horsepower, and industrial or power-generation equipment in kilowatts and megawatts. The older unit <strong>horsepower</strong> predates the watt and comes in two closely related variants — mechanical (US/UK) and metric (European) — which differ by about 1.4%.</p>`,
  },
  {
    title: "Common Power Conversions",
    content: `<ul>
<li><strong>1 kW</strong> = 1,000 W ≈ 1.341 hp (mechanical) ≈ 1.360 PS (metric)</li>
<li><strong>1 hp (mechanical)</strong> = 745.7 W</li>
<li><strong>1 PS (metric hp)</strong> = 735.5 W</li>
<li><strong>1 BTU/h</strong> ≈ 0.293 W</li>
<li><strong>1 MW</strong> = 1,000 kW = 1,000,000 W</li>
</ul>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Power unit conversion is needed across engineering, consumer products, and energy management:</p>
<ul>
<li><strong>Vehicle specifications</strong> — converting engine output between horsepower and kilowatts when comparing cars from different markets.</li>
<li><strong>Home appliances</strong> — understanding the power draw of heating, cooling, or cooking equipment in watts or BTU/hr.</li>
<li><strong>Solar and wind energy</strong> — expressing generation capacity in kW or MW and comparing to household consumption.</li>
<li><strong>Electrical engineering</strong> — sizing cables, generators, and transformers using consistent power units.</li>
</ul>`,
  },
];

export default function PowerConverterPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <UnitConverter slug="power-converter" />
    </ToolContainer>
  );
}
