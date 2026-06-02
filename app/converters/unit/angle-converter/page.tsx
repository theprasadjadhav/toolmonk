import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { UnitConverter } from "@/components/tools/converters/UnitConverter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("angle-converter");

const tool = TOOLS.find((t) => t.slug === "angle-converter")!;

const howToSteps = [
  "Type any <strong>angle value</strong> into the input field at the top of the converter.",
  "Choose your <strong>source unit</strong> from the dropdown — options include degrees, radians, gradians, arcminutes, arcseconds, and turns.",
  "All other angle units <strong>update instantly</strong> as you type, showing the equivalent value in every system.",
  "Click any <strong>result row</strong> to promote that value and unit to the input, making further conversions easy.",
  "Hover over any row and click the <strong>copy icon</strong> to copy that value to your clipboard.",
];

const faqs = [
  {
    question: "How do I convert degrees to radians?",
    answer: "<strong>Radians = degrees × π / 180.</strong> For example, 180° = π rad ≈ 3.14159 rad. Radians are the standard unit for angle measurement in most scientific and engineering contexts.",
  },
  {
    question: "What is a gradian?",
    answer: "A <strong>gradian</strong> (also called a gon or grad) divides a full circle into 400 equal parts, so 100 grad = 90°. Gradians are used in surveying and some European engineering traditions because right angles are always a round number (100 grad).",
  },
  {
    question: "What is an arcminute and an arcsecond?",
    answer: "<strong>1 arcminute</strong> equals 1/60 of a degree, and <strong>1 arcsecond</strong> equals 1/60 of an arcminute (1/3600 of a degree). These very fine units are used in astronomy for measuring the apparent size and position of stars, and in navigation for precise geographic coordinates.",
  },
  {
    question: "What is a turn?",
    answer: "A <strong>turn</strong> (or revolution) represents one full 360° rotation. It is a convenient unit when working with rotational motion — for example, 2.5 turns = 900° = 5π radians.",
  },
  {
    question: "When would I use radians instead of degrees?",
    answer: "<strong>Radians</strong> are preferred in mathematics and physics because formulas for arc length, angular velocity, and wave functions simplify when angles are expressed in radians. Degrees are more common in everyday contexts like navigation, construction, and general geometry.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All conversions happen <strong>locally in your browser</strong> — nothing is transmitted.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About Angle Measurement",
    content: `<p>An <strong>angle</strong> describes the amount of rotation between two lines or rays that share a common endpoint. Different fields use different units to measure angles.</p>
<p>The three most common systems are <strong>degrees</strong> (0–360 per full circle), <strong>radians</strong> (0–2π per full circle, used in mathematics and physics), and <strong>gradians</strong> (0–400 per full circle, used in surveying). Smaller subdivisions — <strong>arcminutes</strong> and <strong>arcseconds</strong> — are used in astronomy and precision navigation.</p>`,
  },
  {
    title: "Common Angle Conversions",
    content: `<ul>
<li><strong>90°</strong> = π/2 rad ≈ 1.5708 rad = 100 grad</li>
<li><strong>180°</strong> = π rad ≈ 3.1416 rad = 200 grad</li>
<li><strong>360°</strong> = 2π rad ≈ 6.2832 rad = 400 grad = 1 turn</li>
<li><strong>1 radian</strong> ≈ 57.2958°</li>
<li><strong>1°</strong> = 60 arcminutes = 3,600 arcseconds</li>
</ul>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Angle converters are useful across many disciplines:</p>
<ul>
<li><strong>Surveying and civil engineering</strong> — field instruments often report angles in gradians or degrees-minutes-seconds (DMS) format.</li>
<li><strong>Astronomy</strong> — star positions and angular diameters are measured in degrees, arcminutes, and arcseconds.</li>
<li><strong>Robotics and CNC machining</strong> — rotation commands may need to be expressed in radians or turns.</li>
<li><strong>Navigation</strong> — compass bearings use degrees, while GPS coordinates use decimal degrees or DMS.</li>
</ul>`,
  },
];

export default function AngleConverterPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <UnitConverter slug="angle-converter" />
    </ToolContainer>
  );
}
