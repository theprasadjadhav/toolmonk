import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { BorderRadiusGenerator } from "@/components/tools/design/BorderRadiusGenerator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("border-radius-generator");

const tool = TOOLS.find((t) => t.slug === "border-radius-generator")!;

const howToSteps = [
  "Drag the <strong>corner sliders</strong> to set the border radius for each of the four corners independently.",
  "Enable <strong>linked mode</strong> to apply the same value to all four corners simultaneously — useful for uniform rounding.",
  "Choose a <strong>unit</strong>: <strong>px</strong> for fixed pixel values, <strong>%</strong> for proportional rounding, or <strong>rem</strong> for scalable relative values.",
  "Use the <strong>presets</strong> (None, Sm, Pill, etc.) to instantly jump to common shapes without manual adjustment.",
  "Click <strong>Copy CSS</strong> to copy the generated border-radius property to your clipboard, ready to paste into your stylesheet.",
];

const faqs = [
  {
    question: "What does 'linked' mode do?",
    answer:
      "When <strong>linked</strong> mode is on, all four corners update together when you move any single slider. This makes it quick to apply <strong>uniform rounding</strong> to all corners at once without adjusting each individually.",
  },
  {
    question: "When should I use % vs px?",
    answer:
      "Use <strong>%</strong> for proportional rounding — setting all corners to 50% creates a perfect circle regardless of element size. Use <strong>px</strong> for fixed rounding that stays the same size no matter how large or small the element is.",
  },
  {
    question: "What does the Pill preset do?",
    answer:
      "The <strong>Pill</strong> preset sets the radius to 9999px, which creates <strong>fully rounded ends</strong> on any element. Because 9999px is far larger than any realistic element height, the browser always renders the maximum possible arc on the short axis.",
  },
  {
    question: "Is this free?",
    answer: "Yes — completely free with no registration required.",
  },
  {
    question: "What is the CSS border-radius property?",
    answer:
      "The <strong>border-radius</strong> CSS property rounds the corners of an element's outer border edge. It accepts one to four values — one for all corners, or separate values for top-left, top-right, bottom-right, and bottom-left. You can also define elliptical radii using the <strong>/</strong> separator syntax.",
  },
  {
    question: "When should I use rem instead of px?",
    answer:
      "<strong>rem</strong> values scale with the root font size, which makes them useful for <strong>accessible and responsive designs</strong>. If a user increases their browser's default font size, rem-based radii scale proportionally, keeping the design consistent.",
  },
  {
    question: "Can I set different horizontal and vertical radii?",
    answer:
      "Yes — the CSS border-radius property supports <strong>elliptical corners</strong> using the syntax: border-radius: horizontal-radius / vertical-radius. This creates corner shapes that are wider than they are tall, or vice versa. Advanced elliptical syntax is not covered by this generator's sliders but can be edited manually after copying.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About CSS Border Radius",
    content: `<p>The <strong>border-radius</strong> CSS property controls the roundness of an element's corners. It can round all four corners equally, or assign different radii to each corner individually. The value can be specified in pixels for a fixed size, in percentages for proportional rounding, or in rem units for scalable sizing that respects user font preferences.</p><p>A border-radius of 50% on a square element creates a <strong>circle</strong>. A very large pixel value (such as 9999px) on a rectangular element creates a <strong>pill shape</strong>. Individual corners can be set to create <strong>asymmetric</strong> designs.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul><li><strong>Buttons:</strong> Apply uniform rounding (4px–8px) for a modern, approachable look, or pill-shaped rounding for a bold call-to-action style.</li><li><strong>Cards and panels:</strong> Subtle rounding (8px–16px) softens card edges and gives interfaces a contemporary feel.</li><li><strong>Avatars and profile images:</strong> Use 50% to display profile pictures as perfect circles.</li><li><strong>Tags and badges:</strong> Pill-shaped rounding makes small labels and chips visually distinct from other UI elements.</li></ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<ul><li>Use <strong>consistent values</strong> across similar components (all buttons the same radius, all cards the same radius) to create visual harmony in your design.</li><li>For small elements like checkboxes or icon buttons, a radius of <strong>2px–4px</strong> is usually enough — larger values can look disproportionate.</li><li>Test rounding at multiple <strong>element sizes</strong> — a 12px radius looks subtle on a large card but very prominent on a small badge.</li><li>Percentage-based radii (especially 50%) only produce a circle on <strong>square elements</strong>. On rectangles, 50% creates an ellipse.</li></ul>`,
  },
];

export default function BorderRadiusGeneratorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <BorderRadiusGenerator />
    </ToolContainer>
  );
}
