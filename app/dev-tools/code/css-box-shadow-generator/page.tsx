import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { CssBoxShadowGenerator } from "@/components/tools/shared/design/CssBoxShadowGenerator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("css-box-shadow-generator");
const tool = TOOLS.find((t) => t.slug === "css-box-shadow-generator" && t.category === "dev-tools")!;

const howToSteps = [
  "Adjust the <strong>X offset</strong> and <strong>Y offset</strong> sliders to control the horizontal and vertical position of the shadow relative to the element.",
  "Set the <strong>blur radius</strong> to soften the shadow edges — a higher value creates a more diffuse, cloud-like shadow, while zero produces a hard edge.",
  "Use the <strong>spread radius</strong> to expand or shrink the shadow size beyond the element's dimensions — positive values grow it outward, negative values contract it.",
  "Pick a <strong>shadow color</strong> and adjust its <strong>opacity</strong> for subtle or bold effects.",
  "Toggle <strong>inset</strong> to flip the shadow inside the element's border, creating a recessed or pressed-in appearance.",
  "Click <strong>+ add</strong> to layer multiple shadows, then switch between them using the tabs. Click <strong>copy CSS</strong> to copy the final property.",
];

const faqs = [
  {
    question: "Can I add multiple shadows?",
    answer:
      "Yes — click <strong>+ add</strong> to layer multiple shadows on the same element. The <strong>box-shadow</strong> property accepts a comma-separated list of shadow values, applied from front to back. Stacking shadows lets you create complex depth effects and glowing outlines simultaneously.",
  },
  {
    question: "What is an inset shadow?",
    answer:
      "An <strong>inset shadow</strong> renders inside the element's border rather than outside it, creating a recessed, pressed, or embossed visual effect. It is commonly used to simulate a button being pressed down, an inner glow, or a sunken input field.",
  },
  {
    question: "What does the spread radius do?",
    answer:
      "The <strong>spread radius</strong> expands or contracts the shadow independently of the blur. A <strong>positive spread</strong> makes the shadow larger than the element on all sides. A <strong>negative spread</strong> shrinks it, which is useful for creating a tight shadow that hugs just below the element.",
  },
  {
    question: "How do I create a soft, realistic drop shadow?",
    answer:
      "For a natural drop shadow, use a <strong>small X offset</strong> (2–4px), a <strong>moderate Y offset</strong> (4–8px), a <strong>generous blur radius</strong> (8–16px), <strong>zero spread</strong>, and a semi-transparent dark color (black at 15–25% opacity). This mimics how light falls in the real world.",
  },
  {
    question: "Is this free to use?",
    answer:
      "Yes — completely free with no registration required. Copy the generated CSS and paste it directly into your stylesheet.",
  },
  {
    question: "What does the X and Y offset control?",
    answer:
      "The <strong>X offset</strong> moves the shadow left (negative) or right (positive) relative to the element. The <strong>Y offset</strong> moves it up (negative) or down (positive). A common pattern is a small positive Y offset to simulate overhead lighting.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is a Box Shadow?",
    content: `<p>A <strong>box shadow</strong> is a visual effect applied around (or inside) an HTML element using a single CSS property. It creates the illusion of depth by casting a shadow behind the element — similar to how a physical object casts a shadow when light shines on it.</p>
<p>The shadow is defined by five parameters: <strong>horizontal offset, vertical offset, blur radius, spread radius,</strong> and <strong>color</strong>. An optional <strong>inset</strong> keyword flips the shadow to appear inside the element instead of outside. Multiple shadows can be stacked in a single property declaration, separated by commas.</p>`,
  },
  {
    title: "Common Shadow Techniques",
    content: `<ul>
<li><strong>Soft card shadow:</strong> A small Y offset, generous blur, zero spread, and low-opacity black (e.g. rgba(0,0,0,0.15)) gives cards a clean, floating look.</li>
<li><strong>Hard retro shadow:</strong> Zero blur, a moderate X and Y offset, and full-opacity color creates a solid offset shadow popular in flat design.</li>
<li><strong>Inset well effect:</strong> An inset shadow with a dark color and small blur makes input fields look sunken into the page.</li>
<li><strong>Glow effect:</strong> Zero offsets, a large blur, zero spread, and a vivid color creates a glow around the element — often used for focused buttons or neon aesthetics.</li>
<li><strong>Layered depth:</strong> Two or three shadows with different blur and opacity values create a more realistic, multi-layer depth effect.</li>
</ul>`,
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
