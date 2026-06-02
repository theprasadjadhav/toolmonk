import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { UnitConverter } from "@/components/tools/converters/UnitConverter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("speed-converter");

const tool = TOOLS.find((t) => t.slug === "speed-converter")!;

const howToSteps = [
  "Type any <strong>speed value</strong> into the input field at the top of the converter.",
  "Choose your <strong>source unit</strong> from the dropdown — options include km/h, mph, m/s, knots, Mach, and more.",
  "All other speed units <strong>update instantly</strong> as you type, showing the equivalent in every system.",
  "Click any <strong>result row</strong> to set that value and unit as the new input for further conversions.",
  "Hover over any row and click the <strong>copy icon</strong> to copy a result to your clipboard.",
];

const faqs = [
  {
    question: "How many km/h are in one mph?",
    answer: "<strong>1 mph = 1.60934 km/h.</strong> Conversely, 1 km/h ≈ 0.62137 mph. A useful approximation is that 100 km/h ≈ 62 mph, which is close to a typical motorway speed limit.",
  },
  {
    question: "What is Mach 1 in km/h?",
    answer: "<strong>Mach 1 ≈ 1,225 km/h (340.29 m/s)</strong> at sea level in dry air at 15°C. The speed of sound changes with altitude and temperature — at cruising altitude where the air is colder, Mach 1 is closer to 1,062 km/h.",
  },
  {
    question: "What is a knot?",
    answer: "<strong>1 knot = 1 nautical mile per hour = 1.852 km/h ≈ 1.151 mph.</strong> Knots are the standard unit for speed in maritime and aviation contexts worldwide because nautical miles are tied directly to geographic coordinates.",
  },
  {
    question: "How fast is m/s compared to km/h?",
    answer: "<strong>1 m/s = 3.6 km/h.</strong> To convert m/s to km/h, multiply by 3.6. This conversion appears frequently in physics problems and scientific data, where speeds are often expressed in m/s.",
  },
  {
    question: "What is the speed of light?",
    answer: "The <strong>speed of light in a vacuum</strong> is exactly 299,792,458 m/s ≈ 1,079,252,848 km/h ≈ 670,616,629 mph. It is the fundamental speed limit of the universe and is used as a unit itself in astronomy (light-seconds, light-years).",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All conversions happen <strong>locally in your browser</strong> — nothing is transmitted.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About Speed Measurement",
    content: `<p><strong>Speed</strong> measures how fast an object moves — the distance it covers per unit of time. The SI unit is <strong>metres per second (m/s)</strong>, though kilometres per hour (km/h) and miles per hour (mph) are more familiar in everyday life.</p>
<p>Different industries use different units: road transport uses <strong>km/h or mph</strong>, aviation and maritime navigation use <strong>knots</strong>, and aerospace uses <strong>Mach numbers</strong> relative to the speed of sound. Scientific work typically uses m/s for consistency with other SI quantities.</p>`,
  },
  {
    title: "Quick Reference: Notable Speeds",
    content: `<ul>
<li><strong>Walking pace</strong>: ~5 km/h ≈ 3.1 mph ≈ 1.4 m/s</li>
<li><strong>City speed limit</strong>: 50 km/h ≈ 31 mph</li>
<li><strong>Motorway / highway</strong>: 100–130 km/h ≈ 62–81 mph</li>
<li><strong>Mach 1 (sea level)</strong>: ≈ 1,225 km/h ≈ 761 mph ≈ 340 m/s</li>
<li><strong>Speed of light</strong>: ≈ 1,079,252,848 km/h ≈ 299,792 km/s</li>
</ul>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Speed conversion is needed across travel, science, and sports:</p>
<ul>
<li><strong>Driving abroad</strong> — interpreting speed limits posted in km/h when used to mph, or vice versa.</li>
<li><strong>Aviation and sailing</strong> — translating knot-based speeds to km/h or mph for passengers and ground teams.</li>
<li><strong>Weather reports</strong> — converting wind speed between m/s, km/h, and mph across different forecasting systems.</li>
<li><strong>Sports performance</strong> — comparing athletes' speeds recorded in different units across events and countries.</li>
</ul>`,
  },
];

export default function SpeedConverterPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <UnitConverter slug="speed-converter" />
    </ToolContainer>
  );
}
