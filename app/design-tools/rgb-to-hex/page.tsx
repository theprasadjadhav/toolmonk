import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { RgbToHex } from "@/components/tools/design/RgbToHex";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("rgb-to-hex");

const tool = TOOLS.find((t) => t.slug === "rgb-to-hex")!;

const howToSteps = [
  "Drag the <strong>R, G, and B sliders</strong> to set each color channel — values range from 0 to 255.",
  "Optionally adjust the <strong>Alpha (A) slider</strong> to control transparency from 0 (fully transparent) to 100 (fully opaque).",
  "The <strong>live color preview</strong> box updates instantly to show the selected color.",
  "Click <strong>copy</strong> next to any output to copy the <strong>HEX</strong>, <strong>HEX+Alpha</strong>, <strong>RGB</strong>, <strong>RGBA</strong>, or <strong>HSL</strong> value to your clipboard.",
];

const faqs = [
  {
    question: "What does the A slider do?",
    answer:
      "The <strong>A (Alpha)</strong> slider controls the <strong>opacity</strong> of the color from 0 (fully transparent) to 100 (fully opaque). It affects the RGBA output and the 8-digit HEX+Alpha output.",
  },
  {
    question: "What is HEX+A?",
    answer:
      "<strong>HEX+A</strong> is an 8-digit hex color code that includes the alpha channel as the final two digits — for example, #3b82f6ff (ff = fully opaque). It is supported in modern CSS and is the hex equivalent of rgba().",
  },
  {
    question: "Can I type values instead of using sliders?",
    answer:
      "Yes — each slider has a <strong>number input</strong> on the right side that you can click and type into directly for precise entry.",
  },
  {
    question: "Is this free?",
    answer: "Yes — completely free with no registration required.",
  },
  {
    question: "What is the difference between RGB and RGBA?",
    answer:
      "<strong>RGB</strong> defines a color using three channels (red, green, blue), each from 0–255. <strong>RGBA</strong> adds a fourth <strong>alpha channel</strong> for transparency. Use rgba() in CSS when you want a color with partial transparency — for example, a translucent overlay or a semi-transparent button.",
  },
  {
    question: "When should I use HEX instead of RGB?",
    answer:
      "<strong>HEX</strong> codes are more compact and widely used in HTML and CSS for solid colors. Use <strong>RGB or RGBA</strong> when you need to control transparency, or when a tool requires decimal channel values. Both formats describe the same colors — the choice is usually determined by the context where you will use the value.",
  },
  {
    question: "How is HEX calculated from RGB?",
    answer:
      "Each RGB channel (0–255) is converted to a <strong>two-digit hexadecimal number</strong>. For example, the decimal value 59 becomes 3b in hex. The three pairs are concatenated: rgb(59, 130, 246) → #3b82f6. The reverse — hex to decimal — uses the same hexadecimal-to-decimal conversion.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About RGB and HEX Color Formats",
    content: `<p><strong>RGB</strong> represents color as a mix of red, green, and blue light, each channel ranging from 0 (none) to 255 (full intensity). It is the native color model of screens and displays. <strong>HEX</strong> codes express the same three channels in hexadecimal notation — a more compact format widely used in HTML and CSS.</p><p>Converting between the two is a straightforward numerical translation. The key difference is usage context: HEX codes are the standard in web development style sheets, while RGB and RGBA are preferred when you need precise numeric control or transparency through the alpha channel.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul><li><strong>CSS development:</strong> Convert RGB values from a design tool into HEX codes for use in CSS color properties.</li><li><strong>Transparency layers:</strong> Use the RGBA output to apply a specific color at reduced opacity for overlays, tooltips, or backgrounds.</li><li><strong>Design handoff:</strong> Translate colors between formats to match what a developer or design tool expects.</li><li><strong>Brand guidelines:</strong> Document brand colors in all formats (HEX, RGB, HSL) so they can be used in any tool or medium.</li></ul>`,
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
