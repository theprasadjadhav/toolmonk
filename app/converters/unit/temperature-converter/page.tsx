import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { UnitConverter } from "@/components/tools/converters/UnitConverter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("temperature-converter");

const tool = TOOLS.find((t) => t.slug === "temperature-converter")!;

const howToSteps = [
  "Type any <strong>temperature value</strong> into the input field at the top of the converter.",
  "Choose your <strong>source scale</strong> from the dropdown — options include Celsius (°C), Fahrenheit (°F), Kelvin (K), and Rankine (°R).",
  "All other temperature scales <strong>update instantly</strong> as you type, showing the equivalent in every system.",
  "Click any <strong>result row</strong> to switch to that scale and value as the new input for further conversions.",
  "Hover over any row and click the <strong>copy icon</strong> to copy a value to your clipboard.",
];

const faqs = [
  {
    question: "How do I convert Celsius to Fahrenheit?",
    answer: "<strong>°F = (°C × 9/5) + 32.</strong> For example, 100°C = 212°F, and 0°C = 32°F. To go the other way: <strong>°C = (°F − 32) × 5/9.</strong> A quick mental check: 20°C ≈ 68°F (a comfortable room).",
  },
  {
    question: "What is absolute zero?",
    answer: "<strong>Absolute zero</strong> is the lowest theoretically possible temperature: 0 K = −273.15°C = −459.67°F. At this temperature, particles have minimum thermal energy. It is a physical limit that cannot be reached in practice, only approached.",
  },
  {
    question: "What is normal body temperature?",
    answer: "Normal human core body temperature is approximately <strong>37°C = 98.6°F = 310.15 K.</strong> In practice, normal temperature varies between individuals and ranges roughly from 36.1°C to 37.2°C (97°F to 99°F).",
  },
  {
    question: "What is the Kelvin scale and why is it used?",
    answer: "The <strong>Kelvin (K)</strong> is the SI base unit for temperature. Unlike Celsius and Fahrenheit, it starts at absolute zero with no negative values. Kelvin is used in science and engineering because many physical laws and calculations (such as gas laws and thermal radiation) require an absolute temperature scale.",
  },
  {
    question: "At what temperature are Celsius and Fahrenheit equal?",
    answer: "Celsius and Fahrenheit are equal at <strong>−40°</strong> — that is, −40°C = −40°F. This is the only point where the two scales intersect.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All conversions happen <strong>locally in your browser</strong> — nothing is transmitted.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About Temperature Measurement",
    content: `<p><strong>Temperature</strong> measures the thermal energy of matter — how hot or cold something is. There are four main temperature scales in use today.</p>
<p><strong>Celsius (°C)</strong> is the metric standard, with 0° at water's freezing point and 100° at its boiling point. <strong>Fahrenheit (°F)</strong> is used in the United States for everyday measurements. <strong>Kelvin (K)</strong> is the scientific scale starting at absolute zero — essential for physics and chemistry. <strong>Rankine (°R)</strong> is an absolute scale like Kelvin but uses Fahrenheit-sized degrees, used in some US engineering disciplines.</p>`,
  },
  {
    title: "Quick Reference: Key Temperatures",
    content: `<ul>
<li><strong>Absolute zero</strong>: 0 K = −273.15°C = −459.67°F</li>
<li><strong>Water freezes</strong>: 0°C = 32°F = 273.15 K</li>
<li><strong>Room temperature</strong>: ~20°C = 68°F = 293.15 K</li>
<li><strong>Body temperature</strong>: 37°C = 98.6°F = 310.15 K</li>
<li><strong>Water boils</strong>: 100°C = 212°F = 373.15 K</li>
<li><strong>Equal point</strong>: −40°C = −40°F</li>
</ul>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Temperature conversion comes up in many everyday and professional contexts:</p>
<ul>
<li><strong>Cooking and recipes</strong> — converting oven temperatures between Celsius and Fahrenheit in international recipes.</li>
<li><strong>Travel and weather</strong> — understanding local temperature forecasts when travelling between countries that use different scales.</li>
<li><strong>Medicine</strong> — interpreting body temperature readings on thermometers calibrated in °C vs. °F.</li>
<li><strong>Science and engineering</strong> — converting between Celsius and Kelvin for thermodynamics calculations.</li>
</ul>`,
  },
];

export default function TemperatureConverterPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <UnitConverter slug="temperature-converter" />
    </ToolContainer>
  );
}
