import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { RandomColorGenerator } from "@/components/tools/generators/RandomColorGenerator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("random-color-generator");

const tool = TOOLS.find((t) => t.slug === "random-color-generator")!;

const howToSteps = [
  "Set the <strong>number of colors</strong> to generate at once (1–100). Generate a larger set to have more options to choose from when building a palette.",
  "Choose the <strong>output format</strong>: HEX for use in design tools and code, RGB for precise red-green-blue values, or HSL for human-readable hue, saturation, and lightness values.",
  "Constrain the <strong>hue range</strong> to target a specific color family — for example, 0–30 for warm reds and oranges, or 200–260 for cool blues.",
  "Adjust the <strong>saturation and lightness ranges</strong> to control how vivid and how bright the generated colors appear.",
  "Click <strong>Generate</strong> — click any swatch to copy its color value, or use <strong>Copy All</strong> to copy the full list.",
];

const faqs = [
  {
    question: "What is the HSL color model?",
    answer:
      "<strong>HSL</strong> stands for Hue (0–360°, the position on the color wheel), Saturation (0–100%, from gray to vivid), and Lightness (0–100%, from black to white). It makes it intuitive to generate colors within a specific tone — for example, all soft pastels or all deep jewel tones.",
  },
  {
    question: "How do I generate a palette of harmonious colors?",
    answer:
      "Narrow the <strong>hue range</strong> to a small band (e.g., 120–150 for greens) and keep saturation and lightness ranges tight. This produces <strong>analogous or monochromatic palettes</strong> — colors that feel visually related and work well together.",
  },
  {
    question: "Can I copy individual colors?",
    answer:
      "Yes — click any <strong>color swatch</strong> to copy its value in the selected format. Use the <strong>Copy All</strong> button to copy the full list as newline-separated values for pasting into a spreadsheet or design file.",
  },
  {
    question: "What is the difference between HEX and RGB?",
    answer:
      "<strong>HEX</strong> is a compact representation of RGB values in hexadecimal notation (e.g., #3a7bd5). <strong>RGB</strong> expresses the same value as three separate 0–255 numbers. HEX is standard in design tools and code; RGB is useful when you need to work with individual channel values.",
  },
  {
    question: "Is this tool free?",
    answer: "Yes — completely free with no registration required.",
  },
  {
    question: "How do I generate pastel colors?",
    answer:
      "Set the <strong>saturation range</strong> to 30–60% and the <strong>lightness range</strong> to 70–90%. This constrains generated colors to the light, desaturated range where pastels live.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is a Color Palette?",
    content: `<p>A <strong>color palette</strong> is a curated set of colors chosen to work together visually. In design, a consistent palette creates a unified, professional appearance across all elements of a brand, website, or product.</p><p>Colors are defined using models like <strong>HEX</strong> (compact code for web use), <strong>RGB</strong> (red, green, blue components for screen display), and <strong>HSL</strong> (hue, saturation, lightness — the most intuitive for humans to reason about). This tool uses HSL constraints to generate palettes within a defined color family, saturation range, and brightness range.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Random color generation is useful across design, development, and creative projects:</p><ul><li><strong>Brand palette exploration:</strong> Quickly generate dozens of color options in a target hue range to find inspiration for a brand color system.</li><li><strong>Data visualization:</strong> Generate a set of distinct, visually separated colors for charts, graphs, and maps.</li><li><strong>UI prototyping:</strong> Populate mockups and wireframes with realistic color values during the design phase.</li><li><strong>Art and illustration:</strong> Discover unexpected color combinations by generating random palettes outside your usual preferences.</li></ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>To generate useful, cohesive color sets:</p><ul><li>Use a <strong>narrow hue range</strong> (20–40° wide) for monochromatic or analogous palettes where colors clearly belong together.</li><li>Keep <strong>lightness range tight</strong> (e.g., 40–60%) to ensure all generated colors have similar perceived brightness — useful for backgrounds or text colors.</li><li>Generate a <strong>larger batch</strong> (20–50 colors) and select the best candidates rather than regenerating small sets repeatedly.</li><li>Test chosen colors for <strong>accessibility contrast</strong> if they will be used for text on a background — a minimum contrast ratio of 4.5:1 is recommended for readable body text.</li></ul>`,
  },
];

export default function RandomColorGeneratorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <RandomColorGenerator />
    </ToolContainer>
  );
}
