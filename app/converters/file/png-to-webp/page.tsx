import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { PngToWebp } from "@/components/tools/converters/file/PngToWebp";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("png-to-webp");

const tool = TOOLS.find((t) => t.slug === "png-to-webp")!;

const howToSteps = [
  "Drop one or more <strong>PNG images</strong> onto the drop zone, or click to browse and select files from your device.",
  "Adjust the <strong>quality slider</strong> to set the compression level — 85% is a good starting point for most images.",
  "Click <strong>Convert</strong> to process all selected PNGs into <strong>WebP format</strong>.",
  "Download the resulting <strong>WebP files</strong> — they are ready to use on any modern website.",
];

const faqs = [
  {
    question: "How much smaller will the WebP file be?",
    answer:
      "WebP is typically <strong>25–35% smaller</strong> than an equivalent PNG at comparable visual quality. The quality slider lets you fine-tune the trade-off between file size and image clarity.",
  },
  {
    question: "What quality setting should I use?",
    answer:
      "<strong>80–90%</strong> is a good balance for most web images. For photographic or complex content, <strong>75–85%</strong> is often visually indistinguishable from the original while achieving significant size savings.",
  },
  {
    question: "Does my image leave my device?",
    answer:
      "No. Conversion happens <strong>entirely in your browser</strong>. Your images are never uploaded to any server.",
  },
  {
    question: "Is WebP supported by all browsers?",
    answer:
      "<strong>WebP is supported by all modern browsers</strong>, including Chrome, Firefox, Edge, and Safari 14+. For very old browsers or Safari 13 and earlier, PNG or JPG is a safer fallback.",
  },
  {
    question: "Does WebP support transparency?",
    answer:
      "Yes. WebP supports an <strong>alpha channel</strong> (transparency), just like PNG. Your transparent PNGs will retain their transparent backgrounds when converted to WebP.",
  },
  {
    question: "Why use WebP instead of PNG on a website?",
    answer:
      "Smaller image files mean <strong>faster page load times</strong>, which improves user experience and search engine rankings. WebP achieves smaller sizes than PNG without noticeable quality loss for most images.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is WebP?",
    content: `<p><strong>WebP</strong> is a modern image format developed for the web. It uses advanced compression to produce files that are significantly smaller than PNG or JPG at equivalent visual quality. WebP supports both <strong>lossy and lossless compression</strong>, as well as transparency (alpha channel) and animation.</p><p>WebP was designed specifically to speed up web pages by reducing image file sizes. It is supported by all major modern browsers and is now widely used by websites to improve performance and reduce bandwidth.</p>`,
  },
  {
    title: "PNG vs. WebP — Key Differences",
    content: `<p>Both PNG and WebP support transparency, but they differ in efficiency and use case:</p><ul><li><strong>File size</strong> — WebP is 25–35% smaller than PNG for comparable quality, making it better for web performance</li><li><strong>Compression</strong> — PNG uses lossless compression only; WebP supports both lossless and lossy modes</li><li><strong>Transparency</strong> — both support full alpha transparency</li><li><strong>Browser support</strong> — PNG is universally supported everywhere; WebP requires modern browsers (Safari 14+)</li><li><strong>Editing</strong> — PNG is better for images you will continue editing; WebP is ideal for final web-ready images</li></ul>`,
  },
  {
    title: "When to Use WebP on Your Website",
    content: `<p>WebP is the recommended format for images on modern websites because it reduces page weight without sacrificing quality. Use it for:</p><ul><li><strong>Hero images, banners, and backgrounds</strong> — large images where size reduction has the biggest impact</li><li><strong>Product images</strong> in online stores where fast loading directly affects conversions</li><li><strong>Blog and article images</strong> to improve page speed scores</li><li><strong>Icons and UI graphics with transparency</strong> — WebP replaces PNG with smaller files</li></ul>`,
  },
];

export default function PngToWebpPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <PngToWebp />
    </ToolContainer>
  );
}
