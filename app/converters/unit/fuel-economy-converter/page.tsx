import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { UnitConverter } from "@/components/tools/converters/UnitConverter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("fuel-economy-converter");

const tool = TOOLS.find((t) => t.slug === "fuel-economy-converter")!;

const howToSteps = [
  "Type any <strong>fuel economy value</strong> into the input field at the top of the converter.",
  "Choose your <strong>source unit</strong> from the dropdown — options include MPG (US), MPG (UK), L/100km, and km/L.",
  "All other fuel efficiency units <strong>update instantly</strong> as you type, showing the equivalent rating in every system.",
  "Click any <strong>result row</strong> to set that value and unit as the new input for further conversions.",
  "Hover over any row and click the <strong>copy icon</strong> to copy a result to your clipboard.",
];

const faqs = [
  {
    question: "How do I convert MPG to L/100km?",
    answer: "<strong>L/100km = 235.215 ÷ MPG (US).</strong> For example, 30 MPG = 7.84 L/100km. Note that a higher MPG corresponds to a lower L/100km, since they measure efficiency in opposite directions.",
  },
  {
    question: "What is the difference between US and UK MPG?",
    answer: "The difference is in the gallon size: a <strong>US gallon = 3.785 L</strong> while a <strong>UK (imperial) gallon = 4.546 L</strong>. This means the same car will have a higher MPG rating in UK terms — roughly 30 US MPG ≈ 36 UK MPG. Always check which gallon a rating uses.",
  },
  {
    question: "Is higher MPG or lower L/100km better?",
    answer: "<strong>Higher MPG = better fuel economy</strong> (the car travels more miles per gallon). <strong>Lower L/100km = better fuel economy</strong> (the car uses fewer litres to cover 100 km). Both measure efficiency; they just express it from opposite perspectives.",
  },
  {
    question: "What is km/L and where is it used?",
    answer: "<strong>km/L (kilometres per litre)</strong> is the metric equivalent of MPG — it measures how far a vehicle travels on one litre of fuel. It is commonly used in Japan, India, and other Asian markets. Higher values mean better efficiency.",
  },
  {
    question: "What is the average fuel economy for a modern car?",
    answer: "A typical modern passenger car achieves roughly <strong>30–40 MPG (US)</strong>, or about <strong>6–8 L/100km</strong>. Hybrid and electric vehicles can far exceed this, while large trucks and SUVs typically fall below 25 MPG.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All conversions happen <strong>locally in your browser</strong> — nothing is transmitted.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About Fuel Economy Measurement",
    content: `<p><strong>Fuel economy</strong> describes how efficiently a vehicle uses fuel to cover a given distance. Different regions use fundamentally different units to express this efficiency.</p>
<p>The <strong>US and UK</strong> use miles per gallon (MPG), though they use different gallon sizes. Most of the <strong>metric world</strong> uses litres per 100 kilometres (L/100km), which expresses consumption rather than efficiency. Some countries in Asia use <strong>km/L</strong>, which works like MPG but with metric units. Because the systems are inverses of each other, comparisons require a formula rather than a simple multiplier.</p>`,
  },
  {
    title: "Quick Reference: Fuel Economy Ranges",
    content: `<ul>
<li><strong>Excellent</strong>: &gt;50 MPG US / &lt;5 L/100km (hybrids and small efficient cars)</li>
<li><strong>Good</strong>: 35–50 MPG US / 5–7 L/100km (compact and mid-size cars)</li>
<li><strong>Average</strong>: 25–35 MPG US / 7–9 L/100km (sedans, crossovers)</li>
<li><strong>Below average</strong>: 15–25 MPG US / 9–15 L/100km (SUVs, pickups)</li>
<li><strong>Poor</strong>: &lt;15 MPG US / &gt;15 L/100km (heavy trucks, performance cars)</li>
</ul>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Fuel economy conversion is useful in several practical situations:</p>
<ul>
<li><strong>Buying an imported vehicle</strong> — comparing a car's efficiency rating listed in L/100km against familiar MPG figures.</li>
<li><strong>Travel planning</strong> — estimating fuel costs for a road trip when the car's rating and fuel prices use different units.</li>
<li><strong>Fleet management</strong> — standardising fuel efficiency data across vehicles from different countries.</li>
<li><strong>Environmental impact</strong> — converting consumption figures to compare CO₂ emissions per kilometre or mile.</li>
</ul>`,
  },
];

export default function FuelEconomyConverterPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <UnitConverter slug="fuel-economy-converter" />
    </ToolContainer>
  );
}
