import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { UnitConverter } from "@/components/tools/converters/UnitConverter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("force-converter");

const tool = TOOLS.find((t) => t.slug === "force-converter")!;

const howToSteps = [
  "Type any <strong>force value</strong> into the input field at the top of the converter.",
  "Choose your <strong>source unit</strong> from the dropdown — options include newtons, pound-force, kilogram-force, dynes, and more.",
  "All other force units <strong>update instantly</strong> as you type, showing the equivalent in every system.",
  "Click any <strong>result row</strong> to set that value and unit as the new input for further conversions.",
  "Hover over any row and click the <strong>copy icon</strong> to copy a result to your clipboard.",
];

const faqs = [
  {
    question: "How many newtons are in a pound-force?",
    answer: "<strong>1 lbf (pound-force) = 4.44822 N.</strong> Conversely, 1 N ≈ 0.22481 lbf. The newton is the SI unit of force; the pound-force is used in US customary and imperial engineering.",
  },
  {
    question: "What is kilogram-force?",
    answer: "<strong>1 kgf (kilogram-force)</strong> is the force exerted by gravity on a mass of 1 kilogram at standard gravity, equal to exactly <strong>9.80665 N</strong>. It is sometimes called a kilopond and is used informally to express the weight of objects.",
  },
  {
    question: "What is a dyne?",
    answer: "<strong>1 dyne = 10⁻⁵ N.</strong> The dyne is the unit of force in the older CGS (centimetre-gram-second) system. It is still encountered in surface tension measurements and some older scientific literature.",
  },
  {
    question: "What is the difference between force and weight?",
    answer: "<strong>Force</strong> is any push or pull measured in newtons or pound-force. <strong>Weight</strong> is specifically the gravitational force acting on a mass. An object with a mass of 1 kg has a weight of approximately 9.81 N on Earth, but its mass does not change on the Moon.",
  },
  {
    question: "What is a kilonewton?",
    answer: "<strong>1 kN (kilonewton) = 1,000 N ≈ 224.8 lbf.</strong> Kilonewtons are used in structural engineering to express loads on beams, columns, and foundations.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All conversions happen <strong>locally in your browser</strong> — nothing is transmitted.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About Force Measurement",
    content: `<p><strong>Force</strong> is any interaction that changes the motion of an object. It is measured as mass multiplied by acceleration. The SI unit of force is the <strong>newton (N)</strong>, defined as the force needed to accelerate a 1 kg mass at 1 m/s².</p>
<p>Other commonly used force units include the <strong>pound-force (lbf)</strong> in US engineering, the <strong>kilogram-force (kgf)</strong> used informally in everyday settings, and the <strong>dyne</strong> from the older CGS measurement system. Understanding these units is essential in mechanics, structural engineering, and physics.</p>`,
  },
  {
    title: "Common Force Conversions",
    content: `<ul>
<li><strong>1 N</strong> ≈ 0.22481 lbf = 0.10197 kgf = 100,000 dynes</li>
<li><strong>1 lbf</strong> = 4.44822 N = 0.45359 kgf</li>
<li><strong>1 kgf</strong> = 9.80665 N ≈ 2.2046 lbf</li>
<li><strong>1 kN</strong> = 1,000 N ≈ 224.81 lbf</li>
<li><strong>1 dyne</strong> = 10⁻⁵ N</li>
</ul>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Force unit conversion is relevant across engineering, science, and everyday contexts:</p>
<ul>
<li><strong>Structural engineering</strong> — converting load values between kN and lbf when working with international codes and standards.</li>
<li><strong>Mechanical design</strong> — expressing spring constants and actuator outputs in the correct unit system for a given specification.</li>
<li><strong>Physics education</strong> — translating problems between SI and US customary units.</li>
<li><strong>Fitness and equipment</strong> — understanding force ratings of gym equipment or towing capacities listed in different units.</li>
</ul>`,
  },
];

export default function ForceConverterPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <UnitConverter slug="force-converter" />
    </ToolContainer>
  );
}
