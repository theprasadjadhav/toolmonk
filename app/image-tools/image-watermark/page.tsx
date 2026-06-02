import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { ImageWatermark } from "@/components/tools/image-tools/ImageWatermark";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("image-watermark");

const tool = TOOLS.find((t) => t.slug === "image-watermark")!;

const howToSteps = [
  "Drop or select the image you want to <strong>add a watermark to</strong>.",
  "Type your <strong>watermark text</strong> and adjust the font family, font size, color, and opacity to match your branding.",
  "Choose a <strong>position</strong> from the 3×3 grid (top-left, center, bottom-right, etc.) and fine-tune the margin from the edge.",
  "Enable <strong>Repeat mode</strong> to tile the watermark across the entire image for stronger protection, or keep a single stamp for subtle branding.",
  "Adjust the <strong>rotation angle</strong> for a diagonal effect, then click <strong>Download</strong> to save the watermarked image.",
];

const faqs = [
  {
    question: "What fonts are available?",
    answer:
      "The watermark tool uses <strong>web-safe fonts</strong> available in all browsers without external loading: Arial, Georgia, Times New Roman, Courier New, Impact, Trebuchet MS, and Verdana.",
  },
  {
    question: "How does Repeat mode work?",
    answer:
      "<strong>Repeat mode</strong> tiles the watermark text across the entire image in a grid pattern. You can control the <strong>gap between tiles</strong> and the <strong>rotation angle</strong> — a −30° diagonal tiling pattern is a common choice for copyright protection.",
  },
  {
    question: "Is the original image modified?",
    answer:
      "No — the watermark is drawn onto a <strong>copy of the image in memory</strong>. Your original file on disk is never modified. The download produces a new file with the watermark applied.",
  },
  {
    question: "Can I remove a watermark added by this tool?",
    answer:
      "A <strong>semi-transparent tiled watermark</strong> is significantly harder to remove than a single corner stamp because it covers the underlying image content in multiple places. For stronger protection, use a high-opacity repeating pattern.",
  },
  {
    question: "What opacity should I use?",
    answer:
      "It depends on the purpose. For <strong>copyright notices</strong>, 30–50% opacity is visible enough to identify ownership without completely obscuring the image. For <strong>draft or sample marks</strong>, higher opacity (60–80%) makes the watermark harder to overlook.",
  },
  {
    question: "Is any data uploaded to a server?",
    answer:
      "No — all watermark rendering happens <strong>entirely in your browser</strong>. Your image stays on your device at all times.",
  },
  {
    question: "Is this tool free?",
    answer: "Yes — completely free with no registration required.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Why Watermark Your Images?",
    content: `<p>A <strong>watermark</strong> is text or a graphic overlaid on an image to indicate ownership, prevent unauthorized use, or mark an image as a draft or sample. Watermarking is one of the most practical ways to protect <strong>visual content shared online</strong>, where images can be saved and redistributed with a single click.</p>
<p>Even a semi-transparent watermark acts as a visible deterrent and makes it clear who created or owns the image. For professional photographers, designers, and content creators, watermarking shared previews is standard practice before a client makes a purchase or download.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Watermarks are used across many creative and professional fields:</p>
<ul>
<li><strong>Photography portfolios</strong> — add your name or website to photos shared online as a visual copyright notice</li>
<li><strong>Stock and licensed images</strong> — mark preview versions to discourage use without a license</li>
<li><strong>Client proofs</strong> — stamp images as "PROOF" or "DRAFT" before final delivery</li>
<li><strong>E-commerce product photos</strong> — deter competitors from copying product images</li>
<li><strong>Social media content</strong> — brand images with a logo or handle so the creator is credited when images are shared</li>
</ul>`,
  },
  {
    title: "Tips for Effective Watermarks",
    content: `<p>Not all watermarks are equally effective. Follow these guidelines for the best protection:</p>
<ul>
<li>A <strong>tiled repeating watermark</strong> is far harder to remove than a single corner stamp — use Repeat mode for serious copyright protection.</li>
<li>Place the watermark over <strong>important areas of the image</strong> (the subject's face, the product itself) rather than empty background space where it can be cropped out.</li>
<li>Use <strong>30–50% opacity</strong> to keep the image presentable for previews while still clearly marking ownership.</li>
<li>A <strong>diagonal orientation</strong> (e.g. −30° or −45°) is harder to edit out than a horizontal one aligned with the image edges.</li>
</ul>`,
  },
];

export default function ImageWatermarkPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <ImageWatermark />
    </ToolContainer>
  );
}
