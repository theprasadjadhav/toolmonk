import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { HexToRgb } from "@/components/tools/shared/design/HexToRgb";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("hex-to-rgb");
const tool = TOOLS.find((t) => t.slug === "hex-to-rgb" && t.category === "converters")!;

const howToSteps = [
  "Type or paste a <strong>hex color code</strong> (e.g. <code>#3b82f6</code> or <code>3b82f6</code>) into the input field — the # symbol is optional.",
  "The tool instantly displays the equivalent <strong>RGB, RGBA, and HSL values</strong> alongside a live color preview swatch.",
  "Click <strong>Copy</strong> next to any format to copy that value directly to your clipboard.",
];

const faqs = [
  {
    question: "Do I need the # symbol?",
    answer:
      "No — you can enter the hex code <strong>with or without the leading #</strong>. Both <code>#3b82f6</code> and <code>3b82f6</code> are accepted.",
  },
  {
    question: "Are 3-digit hex codes supported?",
    answer:
      "Yes. <strong>Short hex codes</strong> like <code>#abc</code> are automatically expanded to their 6-digit equivalent (<code>#aabbcc</code>) before conversion.",
  },
  {
    question: "What is the difference between RGB and RGBA?",
    answer:
      "<strong>RGB</strong> defines a color using three channels: Red, Green, and Blue, each from 0 to 255. <strong>RGBA</strong> adds a fourth <strong>alpha channel</strong> for opacity, from 0 (fully transparent) to 1 (fully opaque). The tool outputs RGBA with full opacity (alpha = 1) by default.",
  },
  {
    question: "What is HSL?",
    answer:
      "<strong>HSL</strong> stands for Hue, Saturation, and Lightness. It is an alternative way to describe a color that is often more intuitive for designers — hue is the base color angle (0–360°), saturation controls how vivid it is, and lightness controls how light or dark it appears.",
  },
  {
    question: "Is this free?",
    answer:
      "Yes — completely free with <strong>no registration</strong> required.",
  },
  {
    question: "Why do designers use hex codes?",
    answer:
      "<strong>Hex color codes</strong> are compact, copy-paste friendly, and universally supported in design tools, CSS, and HTML. They represent the same RGB values in hexadecimal notation — for example, #ff0000 is pure red (R=255, G=0, B=0).",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is a Hex Color Code?",
    content: `<p>A <strong>hex color code</strong> is a six-character string (preceded by #) that represents a color by specifying the intensity of its red, green, and blue components in hexadecimal notation. The first two characters represent red (00–FF), the next two represent green, and the last two represent blue.</p><p>For example, <strong>#ff5733</strong> breaks down as: Red = 255, Green = 87, Blue = 51. Hex codes are the most common color notation in web design because they are compact and supported everywhere — HTML, CSS, design tools, and image editors all use them.</p>`,
  },
  {
    title: "Hex vs. RGB — Which Should You Use?",
    content: `<p>Both notations describe the same color; the choice is mostly about context:</p><ul><li><strong>Hex codes</strong> are shorter and easier to copy-paste. Most design tools and color pickers export hex by default.</li><li><strong>RGB</strong> is easier to read and manipulate when writing styles by hand — it's obvious that rgb(255, 0, 0) is pure red.</li><li><strong>RGBA</strong> is the go-to choice when you need transparency, since hex codes don't convey opacity unless you use the 8-digit variant.</li><li><strong>HSL</strong> is preferred when programmatically adjusting brightness or saturation, because you only change one value instead of three.</li></ul>`,
  },
];

export default function HexToRgbPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <HexToRgb />
    </ToolContainer>
  );
}
