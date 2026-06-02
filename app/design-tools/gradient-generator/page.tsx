import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { GradientGenerator } from "@/components/tools/design/GradientGenerator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("gradient-generator");

const tool = TOOLS.find((t) => t.slug === "gradient-generator")!;

const howToSteps = [
  "Choose a <strong>gradient type</strong>: <strong>Linear</strong> for a straight-line transition, <strong>Radial</strong> for a circular burst, or <strong>Conic</strong> for a sweep around a central point.",
  "For <strong>linear gradients</strong>, set the <strong>angle</strong> using the slider or quick-pick buttons (0°, 45°, 90°, 135°, etc.).",
  "Click each <strong>color stop</strong> to change its color, then drag the <strong>position slider</strong> to move it along the gradient.",
  "Add more color stops with the <strong>+ add</strong> button to create multi-color transitions.",
  "Click <strong>Copy CSS</strong> to copy the generated gradient CSS property to your clipboard.",
];

const faqs = [
  {
    question: "What CSS gradient types are supported?",
    answer:
      "All three native CSS gradient functions: <strong>linear-gradient</strong> (straight-line transitions), <strong>radial-gradient</strong> (circular or elliptical transitions), and <strong>conic-gradient</strong> (angular sweep around a centre point).",
  },
  {
    question: "Can I add more than 2 color stops?",
    answer:
      "Yes — click <strong>+ add</strong> to insert additional color stops. Each stop has an independent color and position along the gradient, allowing you to create complex multi-color transitions.",
  },
  {
    question: "How do I remove a color stop?",
    answer:
      "Click the <strong>× button</strong> next to a stop to remove it. At least <strong>2 stops</strong> must remain — a gradient requires a minimum of a start and end color.",
  },
  {
    question: "Is this free?",
    answer: "Yes — completely free with no registration required.",
  },
  {
    question: "What is the difference between linear and radial gradients?",
    answer:
      "A <strong>linear gradient</strong> transitions colors along a straight line at a specified angle. A <strong>radial gradient</strong> radiates colors outward from a central point in a circular or elliptical pattern. A <strong>conic gradient</strong> sweeps colors in a pie-chart-like rotation around a centre point.",
  },
  {
    question: "Can I use gradients as a CSS background?",
    answer:
      "Yes — CSS gradients are used as values for the <strong>background</strong> or <strong>background-image</strong> property. They are not colors themselves but images, which means they cannot be used with the <strong>color</strong> property or for borders directly without additional CSS techniques.",
  },
  {
    question: "How do I create a transparent gradient?",
    answer:
      "Set one of your color stops to a <strong>fully transparent</strong> color — for example, rgba(0, 0, 0, 0) — and set the other to your desired solid color. This creates a fade-to-transparent effect useful for overlays and fade-out edges.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About CSS Gradients",
    content: `<p>CSS gradients allow you to create smooth transitions between two or more colors without using image files. They are rendered natively by the browser at any resolution and scale perfectly to any element size. There are three types: <strong>linear</strong> (straight-line transitions), <strong>radial</strong> (circular or elliptical patterns), and <strong>conic</strong> (angular rotation around a point).</p><p>Gradients are specified as values for the <strong>background-image</strong> property and support multiple color stops, each placed at a specific position along the gradient range.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul><li><strong>Hero backgrounds:</strong> Use a subtle linear gradient to add depth to full-width header sections without a heavy image file.</li><li><strong>Button hover states:</strong> Apply a gradient to buttons for a more polished, three-dimensional appearance.</li><li><strong>Image overlays:</strong> Use a transparent-to-black linear gradient over photos to improve text legibility.</li><li><strong>Progress indicators:</strong> Conic gradients can create circular progress rings by controlling the sweep angle.</li><li><strong>Color palette exploration:</strong> Experiment with radial gradients to visualise how two brand colors interact.</li></ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<ul><li>Keep gradients <strong>subtle</strong> — a 10–20° hue shift between stops looks more professional than a high-contrast rainbow.</li><li>Add a <strong>mid-point stop</strong> at 50% to control the transition curve and prevent a flat, mechanical blend.</li><li>For dark overlays, use <strong>rgba black stops</strong> rather than solid black to preserve the underlying color.</li><li>Test your gradient on both <strong>light and dark backgrounds</strong> to ensure it works across different contexts.</li></ul>`,
  },
];

export default function GradientGeneratorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <GradientGenerator />
    </ToolContainer>
  );
}
