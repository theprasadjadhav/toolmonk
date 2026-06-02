import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { UnitConverter } from "@/components/tools/converters/UnitConverter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("length-converter");

const tool = TOOLS.find((t) => t.slug === "length-converter")!;

const howToSteps = [
  "Type any <strong>length or distance value</strong> into the input field at the top of the converter.",
  "Choose your <strong>source unit</strong> from the dropdown — options include meters, feet, inches, kilometers, miles, nautical miles, yards, and more.",
  "All other length units <strong>update instantly</strong> as you type, showing the equivalent measurement in every system.",
  "Click any <strong>result row</strong> to set that value and unit as the new input for further conversions.",
  "Hover over any row and click the <strong>copy icon</strong> to copy a result to your clipboard.",
];

const faqs = [
  {
    question: "How many feet are in a meter?",
    answer: "<strong>1 meter = 3.28084 feet.</strong> Conversely, 1 foot = 0.3048 meters exactly. This conversion is one of the most commonly needed when comparing measurements between countries that use metric and imperial systems.",
  },
  {
    question: "How many kilometers are in a mile?",
    answer: "<strong>1 mile = 1.60934 km.</strong> Conversely, 1 km ≈ 0.62137 miles. A quick mental approximation is that 5 miles ≈ 8 km, or 1 km is roughly 0.6 miles.",
  },
  {
    question: "What is a nautical mile?",
    answer: "A <strong>nautical mile = 1,852 meters</strong> exactly. It is based on the circumference of the Earth and equals one arcminute of latitude, which makes it ideal for <strong>marine and aviation navigation</strong>. Speed at sea is measured in knots (nautical miles per hour).",
  },
  {
    question: "How many inches are in a centimeter?",
    answer: "<strong>1 inch = 2.54 cm exactly.</strong> Conversely, 1 cm ≈ 0.3937 inches. This is one of the few exact conversions between metric and imperial units.",
  },
  {
    question: "What is the difference between a yard and a meter?",
    answer: "<strong>1 yard = 0.9144 meters</strong>, so a meter is about 9 cm longer than a yard. Both units are used for similar purposes — fabric, sports fields, and short distances — in their respective measurement systems.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All conversions happen <strong>locally in your browser</strong> — nothing is transmitted.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About Length Measurement",
    content: `<p><strong>Length</strong> measures the distance between two points along a straight line. It is one of the seven base quantities in the SI system of measurement.</p>
<p>The world primarily uses two systems: the <strong>metric system</strong>, based on the metre (m), and the <strong>imperial/US customary system</strong>, based on inches, feet, and miles. The metric system uses decimal prefixes (milli-, centi-, kilo-) making conversions within the system simple multiples of 10. The imperial system has historical, non-decimal relationships (12 inches per foot, 3 feet per yard, 1,760 yards per mile) that require a converter.</p>`,
  },
  {
    title: "Common Length Conversions",
    content: `<ul>
<li><strong>1 inch</strong> = 2.54 cm = 25.4 mm</li>
<li><strong>1 foot</strong> = 30.48 cm = 0.3048 m</li>
<li><strong>1 yard</strong> = 0.9144 m</li>
<li><strong>1 mile</strong> = 1.60934 km = 5,280 ft</li>
<li><strong>1 nautical mile</strong> = 1.852 km = 1.15078 miles</li>
<li><strong>1 light-year</strong> ≈ 9.461 × 10¹⁵ m</li>
</ul>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Length conversion is one of the most frequently performed unit conversions:</p>
<ul>
<li><strong>Travel and mapping</strong> — converting road distances between miles and kilometres when driving internationally.</li>
<li><strong>Construction and DIY</strong> — translating measurements between metric and imperial when working with imported materials or plans.</li>
<li><strong>Clothing and furniture</strong> — converting body measurements or room dimensions listed in different units.</li>
<li><strong>Science and engineering</strong> — expressing microscopic or astronomical distances in appropriate units (micrometres, light-years).</li>
</ul>`,
  },
];

export default function LengthConverterPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <UnitConverter slug="length-converter" />
    </ToolContainer>
  );
}
