import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { CssBoxShadowGenerator } from "@/components/tools/design/CssBoxShadowGenerator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("css-box-shadow-generator");

const tool = TOOLS.find((t) => t.slug === "css-box-shadow-generator" && t.category === "design-tools")!;

const howToSteps = [
  "Adjust the <strong>X offset</strong> and <strong>Y offset</strong> sliders to position the shadow — positive X moves it right, positive Y moves it down.",
  "Set the <strong>blur radius</strong> to control how soft or sharp the shadow edges are — higher values create a more diffuse shadow.",
  "Adjust the <strong>spread radius</strong> to expand or shrink the shadow size relative to the element.",
  "Pick a <strong>shadow color</strong> and set the <strong>opacity</strong> for more subtle, realistic shadows.",
  "Toggle <strong>inset</strong> to render the shadow inside the element, creating a recessed or pressed appearance.",
  "Add multiple shadows with <strong>+ add</strong> and switch between them using the tabs to layer effects.",
  "Click <strong>Copy CSS</strong> to copy the complete box-shadow property, ready to paste into your stylesheet.",
];

const faqs = [
  {
    question: "Can I add multiple shadows?",
    answer:
      "Yes — click <strong>+ add</strong> to layer multiple shadows on a single element. The CSS box-shadow property accepts a <strong>comma-separated list</strong> of shadow values, all applied simultaneously. Layering is useful for creating complex depth effects like soft outer glow combined with a hard offset shadow.",
  },
  {
    question: "What is an inset shadow?",
    answer:
      "An <strong>inset shadow</strong> renders inside the element's border rather than outside it, creating a <strong>recessed or pressed</strong> effect. It is commonly used on input fields, sunken panels, and pressed button states.",
  },
  {
    question: "What does the spread radius do?",
    answer:
      "A <strong>positive spread</strong> expands the shadow outward in all directions beyond the element's edges. A <strong>negative spread</strong> shrinks it, which is useful for creating precise soft shadows that stay close to the element's shape.",
  },
  {
    question: "Is this free?",
    answer: "Yes — completely free with no registration required.",
  },
  {
    question: "What is the CSS box-shadow property?",
    answer:
      "The <strong>box-shadow</strong> CSS property adds one or more shadow effects around an element's frame. The syntax is: box-shadow: X-offset Y-offset blur spread color. Each shadow in a multi-shadow list is separated by a comma. The <strong>inset</strong> keyword makes the shadow appear inside the element.",
  },
  {
    question: "How do I create a realistic-looking shadow?",
    answer:
      "Realistic shadows typically use a <strong>low opacity</strong> (10–30%), a <strong>subtle offset</strong> (2–8px), a moderate blur, and zero or negative spread. Avoid pure black — a dark version of the background color often looks more natural. Layering two shadows (one small and sharp, one large and soft) closely mimics how real shadows fall.",
  },
  {
    question: "Can box-shadow affect layout?",
    answer:
      "No — <strong>box-shadow does not affect layout</strong>. Unlike margins or padding, shadows are drawn outside the element's box model and do not push surrounding elements. Only the visual appearance is affected.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About CSS Box Shadow",
    content: `<p>The <strong>box-shadow</strong> CSS property lets you add one or more shadow effects around an element. Each shadow is defined by its horizontal offset, vertical offset, blur radius, spread radius, and color. The optional <strong>inset</strong> keyword reverses the direction so the shadow appears inside the element.</p><p>Multiple shadows can be stacked in a comma-separated list, applied in order from front to back. This makes it possible to create sophisticated depth effects — such as a sharp near shadow layered behind a soft far shadow — that closely replicate real-world lighting.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul><li><strong>Card elevation:</strong> Apply a subtle shadow to cards and panels to lift them visually off the background.</li><li><strong>Button depth:</strong> Use a small offset shadow on buttons to give them a three-dimensional, pressable appearance.</li><li><strong>Input focus states:</strong> Add an inset shadow or glowing outer shadow to text inputs when they receive focus.</li><li><strong>Modal overlays:</strong> Use a large, soft shadow on modals and dialogs to emphasise their layered position above the page.</li><li><strong>Text highlights:</strong> Apply a soft, coloured shadow around images or icons to make them stand out from the background.</li></ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<ul><li>Keep <strong>shadow opacity low</strong> (10–25%) for a natural look — very dark shadows appear heavy and artificial.</li><li>Match the shadow angle to a consistent <strong>light source direction</strong> across your entire UI for visual coherence.</li><li>Use a <strong>slightly coloured shadow</strong> (e.g. a dark blue instead of pure black) to complement your design palette.</li><li>For flat design, use <strong>zero blur and spread</strong> with a moderate offset for a hard geometric shadow effect.</li></ul>`,
  },
];

export default function CssBoxShadowGeneratorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <CssBoxShadowGenerator />
    </ToolContainer>
  );
}
