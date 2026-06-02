import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { UnitConverter } from "@/components/tools/converters/UnitConverter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("volume-converter");

const tool = TOOLS.find((t) => t.slug === "volume-converter")!;

const howToSteps = [
  "Type any <strong>volume value</strong> into the input field at the top of the converter.",
  "Choose your <strong>source unit</strong> from the dropdown — options include litres, millilitres, US gallons, UK gallons, US fluid ounces, cubic metres, cups, pints, quarts, and more.",
  "All other volume units <strong>update instantly</strong> as you type, showing the equivalent in every system.",
  "Click any <strong>result row</strong> to set that value and unit as the new input for further conversions.",
  "Hover over any row and click the <strong>copy icon</strong> to copy a result to your clipboard.",
];

const faqs = [
  {
    question: "How many liters are in a US gallon?",
    answer: "<strong>1 US gallon = 3.78541 litres.</strong> The UK (imperial) gallon is larger: <strong>1 UK gallon = 4.54609 litres.</strong> Always confirm which gallon a recipe or specification uses, as the 20% size difference can significantly affect results.",
  },
  {
    question: "How many milliliters are in a cup?",
    answer: "<strong>1 US cup = 236.588 mL.</strong> A metric cup (used in Australia, Canada, and some other countries) = 250 mL. Recipes from different countries may use different cup sizes, so it is worth checking the source.",
  },
  {
    question: "How many fluid ounces are in a liter?",
    answer: "<strong>1 litre = 33.814 US fluid ounces</strong> and <strong>1 litre = 35.195 UK fluid ounces.</strong> US and UK fluid ounces are different sizes (1 US fl oz ≈ 29.57 mL; 1 UK fl oz ≈ 28.41 mL), so the unit should be specified when precision matters.",
  },
  {
    question: "What is the difference between US and UK pints?",
    answer: "A <strong>US pint = 473 mL (16 US fl oz)</strong>, while a <strong>UK imperial pint = 568 mL (20 UK fl oz)</strong>. This is why a \"pint\" of beer is noticeably larger in the UK than in the US.",
  },
  {
    question: "How many cubic centimeters are in a milliliter?",
    answer: "Exactly <strong>1 mL = 1 cm³ (cubic centimetre)</strong>. These two units are interchangeable for liquid measurements, which is why engine displacements (expressed in cc or cm³) correspond directly to millilitres.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All conversions happen <strong>locally in your browser</strong> — nothing is transmitted.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About Volume Measurement",
    content: `<p><strong>Volume</strong> measures the three-dimensional space that a substance occupies. The SI unit is the <strong>cubic metre (m³)</strong>, but for everyday liquids the <strong>litre (L)</strong> and its subdivisions are standard worldwide.</p>
<p>Volume measurement is one of the most complex areas of unit conversion because both the <strong>US customary</strong> and <strong>UK imperial</strong> systems use the same names (gallon, pint, fluid ounce) for different sizes. A US gallon is smaller than a UK gallon, and a US fluid ounce is slightly larger than a UK fluid ounce — making it essential to know which system a recipe, specification, or label is using.</p>`,
  },
  {
    title: "Common Volume Conversions",
    content: `<ul>
<li><strong>1 L</strong> = 1,000 mL = 0.001 m³ = 1,000 cm³</li>
<li><strong>1 US gallon</strong> = 3.78541 L = 4 US quarts = 8 US pints</li>
<li><strong>1 UK gallon</strong> = 4.54609 L = 8 UK pints</li>
<li><strong>1 US cup</strong> = 236.6 mL | <strong>1 metric cup</strong> = 250 mL</li>
<li><strong>1 US fl oz</strong> ≈ 29.57 mL | <strong>1 UK fl oz</strong> ≈ 28.41 mL</li>
</ul>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Volume conversion is needed in cooking, science, and industry:</p>
<ul>
<li><strong>Cooking and baking</strong> — adapting recipes between metric (mL, L) and US customary (cups, fl oz, gallons) measurements.</li>
<li><strong>Fuel and automotive</strong> — comparing tank capacities or fuel consumption figures listed in different units.</li>
<li><strong>Medical and pharmaceutical</strong> — converting dosage volumes between mL, teaspoons, and tablespoons.</li>
<li><strong>Brewing and winemaking</strong> — scaling recipes between gallons/litres across US and European formats.</li>
</ul>`,
  },
];

export default function VolumeConverterPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <UnitConverter slug="volume-converter" />
    </ToolContainer>
  );
}
