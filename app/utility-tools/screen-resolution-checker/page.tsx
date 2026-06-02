import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { ScreenResolutionChecker } from "@/components/tools/utility-tools/ScreenResolutionChecker";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("screen-resolution-checker");
const tool = TOOLS.find((t) => t.slug === "screen-resolution-checker")!;

const howToSteps = [
  "Open the page — <strong>all display metrics load automatically</strong> from your browser and operating system.",
  "Resize your browser window to see the <strong>Viewport Size</strong> update in real time, reflecting the available web content area.",
  "Rotate your device or change display orientation to see the <strong>Orientation</strong> value change between portrait and landscape.",
  "Click <strong>Refresh</strong> to re-measure the <strong>refresh rate</strong> after making changes to your display settings.",
  "Use the <strong>copy button</strong> next to any row to copy that specific value to your clipboard.",
];

const faqs = [
  {
    question: "What is the difference between Screen Resolution and Physical Resolution?",
    answer:
      "<strong>Screen Resolution</strong> is reported in CSS pixels by the operating system. <strong>Physical Resolution</strong> multiplies CSS pixels by the Device Pixel Ratio to give the actual pixel count on the display panel. On a Retina or high-DPI screen, the physical count is 2–4× higher than the CSS value.",
  },
  {
    question: "What is Device Pixel Ratio (DPR)?",
    answer:
      "<strong>DPR</strong> is the ratio of physical screen pixels to CSS pixels. A DPR of 2× means one CSS pixel maps to a 2×2 block of 4 physical pixels. Most modern phones have a DPR of 2–3. Standard desktop monitors are typically 1×.",
  },
  {
    question: "How is the refresh rate measured?",
    answer:
      "The refresh rate is estimated by measuring the time between <strong>display frame callbacks</strong> over 40 frames and computing the average. This gives a close approximation of the panel's actual refresh rate, though it may differ slightly when the browser caps frame rate to save power.",
  },
  {
    question: "What is the difference between Viewport Size and Screen Resolution?",
    answer:
      "<strong>Screen Resolution</strong> is the total display area reported by the OS. <strong>Viewport Size</strong> is the portion available to web content inside the browser window, excluding the browser UI such as the address bar, tabs, and toolbars.",
  },
  {
    question: "Why does the viewport size change when I scroll on mobile?",
    answer:
      "On mobile browsers, the browser UI (address bar and navigation bar) may <strong>hide or show</strong> as you scroll, changing the available viewport height. This is expected behaviour across most mobile browsers.",
  },
  {
    question: "What does 'Retina' display mean?",
    answer:
      "A <strong>Retina display</strong> is a marketing term for a high-DPI screen where individual pixels are too small to be distinguishable at normal viewing distance. These screens typically have a DPR of 2× or higher. On web pages, this means images and graphics need to be provided at double resolution to appear sharp.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is Screen Resolution?",
    content: `<p><strong>Screen resolution</strong> describes the total number of pixels that a display can show, expressed as <strong>width × height</strong> in pixels (e.g. 1920×1080). A higher resolution means more pixels and sharper, more detailed images.</p><p>Modern devices distinguish between <strong>CSS pixels</strong> (the logical resolution used by web pages and apps) and <strong>physical pixels</strong> (the actual pixels on the screen). On high-DPI displays, one CSS pixel covers multiple physical pixels, which is what makes text and graphics appear crisp on Retina and similar screens.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul><li><strong>Web development:</strong> Check how a page appears at your current viewport size and pixel ratio when building responsive designs.</li><li><strong>Technical support:</strong> Report your exact screen resolution and browser viewport to a support team when describing a display issue.</li><li><strong>Display configuration:</strong> Verify that your monitor is running at its native resolution for the sharpest image quality.</li><li><strong>Responsive design testing:</strong> Monitor how viewport dimensions change when resizing the browser window across breakpoints.</li></ul>`,
  },
];

export default function ScreenResolutionCheckerPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <ScreenResolutionChecker />
    </ToolContainer>
  );
}
