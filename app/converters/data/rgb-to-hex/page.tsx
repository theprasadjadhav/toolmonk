import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { RgbToHex } from "@/components/tools/shared/design/RgbToHex";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("rgb-to-hex");
const tool = TOOLS.find((t) => t.slug === "rgb-to-hex" && t.category === "converters")!;

const howToSteps = [
  "Drag the <strong>R, G, and B sliders</strong> to set each color channel from 0 to 255, or type the values directly in the number inputs.",
  "Optionally adjust the <strong>Alpha (A) slider</strong> to set transparency — 100 is fully opaque and 0 is fully transparent.",
  "The <strong>live color preview</strong> updates instantly so you can see exactly what the color looks like.",
  "Click <strong>Copy</strong> next to any output format — HEX, HEX+Alpha, RGB, RGBA, or HSL — to copy it to your clipboard.",
];

const faqs = [
  {
    question: "What does the A slider do?",
    answer:
      "The <strong>Alpha slider</strong> controls the opacity of the color, from 0 (fully transparent) to 100 (fully opaque). It affects the <strong>RGBA</strong> and <strong>8-digit HEX</strong> outputs; the standard 6-digit HEX output always represents a fully opaque color.",
  },
  {
    question: "What is HEX+Alpha (8-digit hex)?",
    answer:
      "<strong>8-digit hex codes</strong> include the alpha channel as the last two digits — for example, <code>#3b82f6ff</code> where <code>ff</code> means fully opaque. This format is supported in modern browsers and design tools that accept CSS color values.",
  },
  {
    question: "Can I type values instead of using sliders?",
    answer:
      "Yes — each slider has a <strong>number input</strong> on the right that you can click and type into directly for precise values.",
  },
  {
    question: "What is HSL and when should I use it?",
    answer:
      "<strong>HSL</strong> (Hue, Saturation, Lightness) is a color model that is more intuitive for designers. Hue is the base color (0–360°), saturation controls how vivid it is (0–100%), and lightness controls brightness (0–100%). HSL is useful when you want to programmatically lighten, darken, or shift the hue of a color.",
  },
  {
    question: "Is this free?",
    answer:
      "Yes — completely free with <strong>no registration</strong> required.",
  },
  {
    question: "What is the RGB color model?",
    answer:
      "The <strong>RGB model</strong> defines colors by specifying the intensity of three light channels: Red, Green, and Blue, each from 0 to 255. Combining all three at full intensity (255, 255, 255) produces white; setting all to 0 produces black. It is the native color model for screens and digital displays.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is the RGB Color Model?",
    content: `<p>The <strong>RGB color model</strong> mixes red, green, and blue light to create every color visible on a screen. Each channel has a value from 0 (no light) to 255 (full intensity). By combining different intensities of the three channels, over 16 million distinct colors can be represented.</p><p>RGB is the native color model for monitors, televisions, cameras, and all digital displays. When you see a color in a design tool, photo editor, or on a screen, it is stored internally as an RGB value — even if it is displayed as a hex code or HSL value.</p>`,
  },
  {
    title: "RGB vs. Hex vs. HSL — Which Should You Use?",
    content: `<p>All three notations describe the same color; the choice depends on context:</p><ul><li><strong>Hex codes</strong> are compact and the most common format in design tools and style sheets. Ideal for copy-pasting between applications.</li><li><strong>RGB / RGBA</strong> is easy to read and the preferred format when you need to control transparency in CSS.</li><li><strong>HSL</strong> is the best choice when writing styles programmatically — adjusting only the lightness value lets you create consistent color palettes and hover states without calculating new RGB values.</li></ul>`,
  },
];

export default function RgbToHexPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <RgbToHex />
    </ToolContainer>
  );
}
