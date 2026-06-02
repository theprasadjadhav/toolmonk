import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { ColorPicker } from "@/components/tools/design/ColorPicker";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("color-picker");

const tool = TOOLS.find((t) => t.slug === "color-picker")!;

const howToSteps = [
  "Click the <strong>color swatch</strong> to open the native color picker, or type a <strong>HEX value</strong> directly into the hex input field.",
  "Use the <strong>RGB sliders</strong> to fine-tune the red, green, and blue channels individually for precise control.",
  "Copy the color in any format — <strong>HEX</strong>, <strong>RGB</strong>, or <strong>HSL</strong> — with a single click on the copy button next to each value.",
  "Your <strong>recently used colors</strong> are saved in the history at the bottom of the tool for quick reuse.",
];

const faqs = [
  {
    question: "What color formats does this tool support?",
    answer:
      "The tool supports <strong>HEX</strong> (#rrggbb), <strong>RGB</strong> (rgb(r, g, b)), <strong>HSL</strong> (hsl(h, s%, l%)), and <strong>HSV</strong> (hsv(h, s%, v%)). All formats update simultaneously as you adjust the color.",
  },
  {
    question: "Can I type a color value directly?",
    answer:
      "Yes — click the <strong>HEX field</strong> and type any valid 6-digit hex code. The color picker and all other format outputs update live as you type.",
  },
  {
    question: "Is my color history saved?",
    answer:
      "Color history is stored in <strong>session state</strong> for the current browser session. It resets when you refresh the page. To save colors permanently, copy the values you want to keep before leaving.",
  },
  {
    question: "Is this tool free?",
    answer: "Yes — completely free with no registration required.",
  },
  {
    question: "What is the difference between HEX and RGB?",
    answer:
      "<strong>HEX</strong> is a compact way to express the same RGB values in hexadecimal notation — #3b82f6 is equivalent to rgb(59, 130, 246). Both represent the same color; the choice of format depends on where you are using it in your code or design tool.",
  },
  {
    question: "What is HSL and when should I use it?",
    answer:
      "<strong>HSL</strong> stands for Hue, Saturation, and Lightness. It is often more intuitive than RGB for creating color variations — you can adjust only the lightness to create tints and shades of the same hue, or only the saturation to make a color more or less vibrant. It is widely supported in CSS.",
  },
  {
    question: "How do I find a color from an image to use on my website?",
    answer:
      "Use your operating system's built-in screen color picker (on macOS, Digital Color Meter; on Windows, PowerToys Color Picker) to sample any color from your screen, then paste the HEX value into this tool to get the RGB and HSL equivalents.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About Color Formats",
    content: `<p>Web colors can be expressed in several equivalent formats. <strong>HEX</strong> codes (like #3b82f6) are the most compact and commonly used in HTML and CSS. <strong>RGB</strong> specifies how much red, green, and blue light to mix, with each channel ranging from 0 to 255. <strong>HSL</strong> describes the color by its hue (0–360 degrees on a color wheel), saturation (0–100%), and lightness (0–100%), which many designers find more intuitive for creating systematic color palettes.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul><li><strong>Brand color management:</strong> Convert a brand's official HEX color to RGB or HSL for use in different design contexts.</li><li><strong>CSS theming:</strong> Identify HSL values to build consistent color scales by adjusting lightness.</li><li><strong>Design handoff:</strong> Copy colors in the exact format expected by your design tool or front-end framework.</li><li><strong>Accessibility checks:</strong> Use specific color values with contrast-ratio tools to verify WCAG compliance.</li></ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<ul><li>Use <strong>HSL</strong> when building a color palette — keeping the same hue and varying lightness creates a natural set of tints and shades.</li><li>For dark mode designs, shift the <strong>lightness</strong> value rather than choosing entirely different colors to maintain palette consistency.</li><li>Keep your brand's primary colors in a reference document with all three formats (HEX, RGB, HSL) so any team member can use the right format for their tool.</li></ul>`,
  },
];

export default function ColorPickerPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <ColorPicker />
    </ToolContainer>
  );
}
