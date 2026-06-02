import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { UnitConverter } from "@/components/tools/converters/UnitConverter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("pressure-converter");

const tool = TOOLS.find((t) => t.slug === "pressure-converter")!;

const howToSteps = [
  "Type any <strong>pressure value</strong> into the input field at the top of the converter.",
  "Choose your <strong>source unit</strong> from the dropdown — options include pascals, bar, psi, atmospheres, mmHg, and more.",
  "All other pressure units <strong>update instantly</strong> as you type, showing the equivalent in every system.",
  "Click any <strong>result row</strong> to set that value and unit as the new input for further conversions.",
  "Hover over any row and click the <strong>copy icon</strong> to copy a result to your clipboard.",
];

const faqs = [
  {
    question: "What is standard atmospheric pressure?",
    answer: "<strong>1 atm = 101,325 Pa = 1013.25 hPa = 14.696 psi = 760 mmHg.</strong> This is the reference pressure defined as average sea-level air pressure and is used as a baseline in chemistry, physics, and engineering.",
  },
  {
    question: "What is 1 bar in psi?",
    answer: "<strong>1 bar = 100,000 Pa ≈ 14.504 psi.</strong> The bar is slightly less than 1 atm and is a convenient round-number unit widely used in meteorology, diving, and industrial equipment ratings in Europe.",
  },
  {
    question: "What pressure unit do weather forecasts use?",
    answer: "Most weather services report pressure in <strong>hPa (hectopascals)</strong> or the equivalent <strong>mbar (millibars)</strong>. Standard sea-level pressure is 1013.25 hPa. A falling barometer typically signals approaching storms, while rising pressure indicates improving conditions.",
  },
  {
    question: "What is psi used for?",
    answer: "<strong>psi (pounds per square inch)</strong> is the dominant pressure unit in the US for practical applications: tyre pressure (typically 30–35 psi), blood pressure (measured in mmHg but sometimes discussed in psi), and hydraulic system ratings.",
  },
  {
    question: "What is the difference between gauge pressure and absolute pressure?",
    answer: "<strong>Absolute pressure</strong> is measured relative to a perfect vacuum (zero pressure). <strong>Gauge pressure</strong> is measured relative to local atmospheric pressure, so gauge = absolute − atmospheric. Tyre gauges read gauge pressure — a reading of 0 psi means the tyre pressure equals atmospheric, not that it is a vacuum.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All conversions happen <strong>locally in your browser</strong> — nothing is transmitted.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About Pressure Measurement",
    content: `<p><strong>Pressure</strong> is the force applied per unit area. The SI unit is the <strong>pascal (Pa)</strong>, equal to one newton per square metre. Because the pascal is very small, multiples like <strong>kilopascal (kPa)</strong> and <strong>megapascal (MPa)</strong> are frequently used.</p>
<p>Different industries favour different units: meteorology uses <strong>hPa or mbar</strong>; tyres and industrial systems in the US use <strong>psi</strong>; European hydraulic and pneumatic systems often use <strong>bar</strong>; and medical blood-pressure readings use <strong>mmHg</strong>. All express the same physical quantity and can be freely converted.</p>`,
  },
  {
    title: "Quick Reference: Common Pressure Values",
    content: `<ul>
<li><strong>Standard atmosphere</strong>: 1 atm = 101,325 Pa = 14.696 psi = 1013.25 hPa</li>
<li><strong>Tyre pressure (car)</strong>: ~30–35 psi ≈ 2.0–2.4 bar</li>
<li><strong>Bicycle tyre (road)</strong>: ~90–120 psi ≈ 6.2–8.3 bar</li>
<li><strong>Scuba tank</strong>: ~200–300 bar ≈ 2,900–4,350 psi</li>
<li><strong>Blood pressure (systolic)</strong>: ~120 mmHg ≈ 16,000 Pa</li>
</ul>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Pressure conversion is needed across many fields:</p>
<ul>
<li><strong>Automotive</strong> — inflating tyres to the correct psi or bar as specified in the vehicle manual.</li>
<li><strong>Weather monitoring</strong> — interpreting barometric pressure readings in hPa or inHg from forecasts and instruments.</li>
<li><strong>Industrial and hydraulic systems</strong> — converting equipment ratings between bar, MPa, and psi.</li>
<li><strong>Diving and altitude</strong> — understanding how ambient pressure changes with depth or elevation.</li>
</ul>`,
  },
];

export default function PressureConverterPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <UnitConverter slug="pressure-converter" />
    </ToolContainer>
  );
}
