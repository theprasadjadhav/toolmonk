import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { HexToRgb } from "@/components/tools/design/HexToRgb";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("hex-to-rgb");

const tool = TOOLS.find((t) => t.slug === "hex-to-rgb" && t.category === "design-tools")!;

const howToSteps = [
  "Type or paste a <strong>HEX color code</strong> (e.g. #3b82f6 or 3b82f6) into the input field — the # symbol is optional.",
  "The tool instantly shows the equivalent <strong>RGB</strong>, <strong>RGBA</strong>, and <strong>HSL</strong> values along with a <strong>color preview</strong> swatch.",
  "Click <strong>copy</strong> next to any format to copy that specific value to your clipboard.",
];

const faqs = [
  {
    question: "Do I need the # symbol?",
    answer:
      "No — you can enter the hex code <strong>with or without</strong> the leading # character. Both #3b82f6 and 3b82f6 are accepted and produce the same result.",
  },
  {
    question: "Are 3-digit hex codes supported?",
    answer:
      "Yes. Short hex codes like <strong>#abc</strong> are automatically expanded to their full 6-digit equivalent — #aabbcc — before conversion.",
  },
  {
    question: "What is the difference between RGB and RGBA?",
    answer:
      "<strong>RGBA</strong> includes an <strong>alpha channel</strong> that controls the color's opacity, ranging from 0 (fully transparent) to 1 (fully opaque). The tool outputs RGBA with full opacity (alpha = 1) by default.",
  },
  {
    question: "Is this free?",
    answer: "Yes — completely free with no registration required.",
  },
  {
    question: "What is a HEX color code?",
    answer:
      "A <strong>HEX color code</strong> is a 6-digit hexadecimal representation of an RGB color. The first two digits represent the red channel (00–FF), the next two the green channel, and the last two the blue channel. #ffffff is white, #000000 is black, and #ff0000 is pure red.",
  },
  {
    question: "When should I use RGB instead of HEX?",
    answer:
      "Use <strong>RGB or RGBA</strong> when you need to control transparency (rgba allows a fractional alpha value), or when working in an environment that accepts only rgb() syntax — such as some data visualisation tools, SVGs, or older CSS preprocessors.",
  },
  {
    question: "What is HSL and why is it useful?",
    answer:
      "<strong>HSL</strong> (Hue, Saturation, Lightness) describes color in human-readable terms. Hue is the color angle on a 360° wheel, saturation is the color intensity (0% = grey), and lightness controls brightness (0% = black, 100% = white). It makes creating tints, shades, and harmonious palettes much more intuitive than manipulating raw RGB values.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About HEX and RGB Color Formats",
    content: `<p><strong>HEX</strong> color codes are a compact, widely used way to express colors in web design. A 6-digit hex code (#rrggbb) represents the same information as an RGB value — the intensity of red, green, and blue light — but in hexadecimal notation. For example, #3b82f6 is the same color as rgb(59, 130, 246).</p><p><strong>RGB</strong> format explicitly shows each channel as a decimal number from 0 to 255, which can be easier to read and modify numerically. <strong>RGBA</strong> adds a fourth alpha channel for transparency. <strong>HSL</strong> offers an alternative model based on hue, saturation, and lightness that many designers find more intuitive.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul><li><strong>CSS development:</strong> Convert a HEX color from a design file into RGB format for use in CSS rgba() declarations with custom opacity.</li><li><strong>Design tools:</strong> Some tools accept only RGB values — convert brand HEX colors to use them in these environments.</li><li><strong>Data visualisation:</strong> Chart and graph libraries often require RGB or HSL input rather than HEX strings.</li><li><strong>Color palette building:</strong> Convert to HSL to adjust lightness and saturation systematically when creating a full palette from a single base color.</li></ul>`,
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
