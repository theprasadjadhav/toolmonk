import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { UnitConverter } from "@/components/tools/converters/UnitConverter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("energy-converter");

const tool = TOOLS.find((t) => t.slug === "energy-converter")!;

const howToSteps = [
  "Type any <strong>energy value</strong> into the input field at the top of the converter.",
  "Choose your <strong>source unit</strong> from the dropdown — options include joules, kilowatt-hours, calories, kilocalories, BTUs, electron volts, and more.",
  "All other energy units <strong>update instantly</strong> as you type, showing the equivalent in every system.",
  "Click any <strong>result row</strong> to set that value and unit as the new input for further conversions.",
  "Hover over any row and click the <strong>copy icon</strong> to copy a result to your clipboard.",
];

const faqs = [
  {
    question: "How many joules are in a kilowatt-hour?",
    answer: "<strong>1 kWh = 3,600,000 joules (3.6 MJ).</strong> This is because 1 kilowatt = 1,000 joules per second, and 1 hour = 3,600 seconds. The kilowatt-hour is what electricity suppliers use to bill energy consumption.",
  },
  {
    question: "What is the difference between a calorie and a kilocalorie?",
    answer: "A <strong>kilocalorie (kcal)</strong> equals 1,000 small calories and is the unit used on food nutrition labels — what people commonly call a \"calorie\" in everyday speech. <strong>1 kcal = 4,184 joules.</strong> The small calorie (cal) is a scientific unit used in chemistry.",
  },
  {
    question: "How many joules are in a BTU?",
    answer: "<strong>1 BTU (British Thermal Unit) ≈ 1,055.06 joules.</strong> The BTU is defined as the energy needed to raise the temperature of 1 pound of water by 1°F. It is widely used in the US for rating heating and air-conditioning equipment.",
  },
  {
    question: "What is an electron volt?",
    answer: "An <strong>electron volt (eV)</strong> is a tiny unit of energy equal to approximately 1.602 × 10⁻¹⁹ joules. It is used in atomic physics and chemistry to measure the energy of particles, photons, and chemical bonds.",
  },
  {
    question: "How is energy different from power?",
    answer: "<strong>Energy</strong> is the total amount of work done or heat transferred (measured in joules, kWh, BTU). <strong>Power</strong> is the rate at which energy is used or produced (measured in watts, kilowatts, horsepower). Energy = Power × Time.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All conversions happen <strong>locally in your browser</strong> — nothing is transmitted.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About Energy Measurement",
    content: `<p><strong>Energy</strong> is the capacity to do work or produce heat. It exists in many forms — kinetic, potential, thermal, electrical, and chemical — and all can be measured in the same units.</p>
<p>The SI unit of energy is the <strong>joule (J)</strong>. Other common units include the <strong>kilowatt-hour (kWh)</strong> for electricity, the <strong>kilocalorie (kcal)</strong> for food energy, and the <strong>BTU</strong> for heating and cooling systems in the US. All of these measure the same physical quantity and can be converted between one another.</p>`,
  },
  {
    title: "Common Energy Conversions",
    content: `<ul>
<li><strong>1 kWh</strong> = 3,600,000 J = 3,412 BTU = 860 kcal</li>
<li><strong>1 BTU</strong> ≈ 1,055 J ≈ 252 cal</li>
<li><strong>1 kcal</strong> = 4,184 J = 1,000 cal</li>
<li><strong>1 MJ</strong> = 1,000,000 J ≈ 277.8 Wh</li>
<li><strong>1 eV</strong> ≈ 1.602 × 10⁻¹⁹ J</li>
</ul>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Energy unit conversion is needed in many practical situations:</p>
<ul>
<li><strong>Electricity bills</strong> — understanding kWh usage and its equivalent in joules or BTU.</li>
<li><strong>Nutrition</strong> — comparing food energy in kcal against daily intake guidelines in kJ.</li>
<li><strong>HVAC systems</strong> — converting BTU ratings of air conditioners and heaters to watts or kW.</li>
<li><strong>Renewable energy</strong> — comparing solar panel output in kWh to household consumption data.</li>
</ul>`,
  },
];

export default function EnergyConverterPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <UnitConverter slug="energy-converter" />
    </ToolContainer>
  );
}
