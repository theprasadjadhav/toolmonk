import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { UnitConverter } from "@/components/tools/converters/UnitConverter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("area-converter");

const tool = TOOLS.find((t) => t.slug === "area-converter")!;

const howToSteps = [
  "Type any <strong>area value</strong> into the input field at the top of the converter.",
  "Choose your <strong>source unit</strong> from the dropdown — options include square meters, square feet, acres, hectares, and more.",
  "All other area units <strong>update instantly</strong> as you type, displaying the equivalent measurement in every system.",
  "Click any <strong>result row</strong> to set that value and unit as your new input for further conversions.",
  "Hover over any row and click the <strong>copy icon</strong> to copy a result to your clipboard.",
];

const faqs = [
  {
    question: "How many square feet are in an acre?",
    answer: "<strong>1 acre = 43,560 square feet</strong> = 4,046.86 m². The acre is primarily used in the United States and the United Kingdom for measuring land area, especially in real estate and agriculture.",
  },
  {
    question: "How many acres are in a hectare?",
    answer: "<strong>1 hectare = 10,000 m² ≈ 2.471 acres.</strong> The hectare is the standard unit for agricultural and land-use measurement in most countries that use the metric system.",
  },
  {
    question: "How many square meters are in a square foot?",
    answer: "<strong>1 ft² = 0.0929 m²</strong>, and conversely <strong>1 m² = 10.764 ft²</strong>. This conversion is commonly needed when comparing property sizes between countries that use metric and imperial systems.",
  },
  {
    question: "What is the difference between a square mile and a section?",
    answer: "They are the same size: <strong>1 section = 1 square mile = 640 acres = 259 hectares.</strong> The term \"section\" is used in US land surveying under the Public Land Survey System.",
  },
  {
    question: "How do I convert square kilometers to square miles?",
    answer: "<strong>1 km² = 0.3861 square miles.</strong> Conversely, 1 square mile = 2.58999 km². This conversion is useful for comparing geographic regions or country sizes.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All conversions happen <strong>locally in your browser</strong> — nothing is transmitted.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About Area Measurement",
    content: `<p><strong>Area</strong> measures the size of a two-dimensional surface. It is expressed in <strong>square units</strong> — the square of a length unit, such as square meters (m²) or square feet (ft²).</p>
<p>The two main measurement systems are the <strong>metric system</strong> (using m², km², hectares) and the <strong>imperial/US customary system</strong> (using ft², acres, square miles). Hectares and acres are the dominant units for measuring land, while square meters and square feet are used for buildings and rooms.</p>`,
  },
  {
    title: "Common Area Conversions",
    content: `<ul>
<li><strong>1 hectare</strong> = 10,000 m² ≈ 2.471 acres</li>
<li><strong>1 acre</strong> = 43,560 ft² ≈ 4,047 m²</li>
<li><strong>1 km²</strong> = 100 hectares ≈ 0.386 square miles</li>
<li><strong>1 square mile</strong> = 640 acres ≈ 2.59 km²</li>
<li><strong>1 m²</strong> ≈ 10.764 ft²</li>
</ul>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Area converters are used in many real-world contexts:</p>
<ul>
<li><strong>Real estate</strong> — comparing property sizes listed in different countries (m² vs. ft²).</li>
<li><strong>Agriculture</strong> — converting between acres and hectares for crop planning and land records.</li>
<li><strong>Urban planning</strong> — working with zoning maps that may use square kilometers, hectares, or acres.</li>
<li><strong>Home improvement</strong> — calculating flooring or paint coverage when specifications use different units.</li>
</ul>`,
  },
];

export default function AreaConverterPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <UnitConverter slug="area-converter" />
    </ToolContainer>
  );
}
