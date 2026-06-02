import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { ImageCropper } from "@/components/tools/image-tools/ImageCropper";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("image-cropper");

const tool = TOOLS.find((t) => t.slug === "image-cropper")!;

const howToSteps = [
  "Drop or select an image file to load it into the <strong>interactive crop editor</strong>.",
  "Drag the <strong>crop handles</strong> on the corners and edges to define the area you want to keep — the area outside the crop box will be discarded.",
  "Choose a <strong>preset aspect ratio</strong> (1:1 for square, 4:3 for standard, 16:9 for widescreen, etc.) to constrain the crop shape, or select <strong>Free</strong> for an unrestricted crop.",
  "Select an <strong>output format</strong> — keep the original format or convert to JPEG, PNG, or WebP.",
  "Click <strong>Crop</strong> to generate the cropped image and then download it.",
];

const faqs = [
  {
    question: "Can I enter exact crop dimensions?",
    answer:
      "The <strong>live crop box dimensions</strong> are shown as you drag. For exact pixel-perfect output, crop loosely to the right area, then use the <strong>Image Resizer</strong> afterwards to set precise dimensions.",
  },
  {
    question: "What output formats are supported?",
    answer:
      "You can save the crop in the <strong>original format</strong>, or convert to <strong>JPEG, PNG, or WebP</strong>. JPEG and WebP are exported at 92% quality, which preserves excellent visual fidelity at a reasonable file size.",
  },
  {
    question: "What is the difference between aspect ratio presets?",
    answer:
      "<strong>1:1 (square)</strong> is used for profile photos and thumbnails. <strong>4:3</strong> is the classic photo ratio. <strong>16:9</strong> is the standard widescreen ratio for video thumbnails and banner images. <strong>Free</strong> lets you crop to any shape.",
  },
  {
    question: "Is the original image modified?",
    answer:
      "No — the crop is applied to a <strong>copy of your image</strong> in memory. Your original file on disk is never touched or modified.",
  },
  {
    question: "Is any data uploaded to a server?",
    answer:
      "No — all cropping happens <strong>entirely in your browser</strong>. Your image data stays on your device at all times.",
  },
  {
    question: "Is this tool free?",
    answer: "Yes — completely free with no registration required.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Why Cropping Images Matters",
    content: `<p><strong>Cropping</strong> is one of the most fundamental image editing operations. It removes unwanted areas from an image to focus attention on the subject, improve composition, and meet the size requirements of a specific platform.</p>
<p>Every platform has a preferred image ratio — social media profiles expect square images, YouTube thumbnails require 16:9, and printed photos traditionally use 4:3. Uploading an image with the <strong>wrong aspect ratio</strong> often results in the platform cropping it automatically in unexpected ways. Cropping your image beforehand gives you full control over what is shown.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Image cropping is needed across a wide range of everyday tasks:</p>
<ul>
<li><strong>Profile and avatar photos</strong> — crop to a square (1:1) for social media profiles, forum avatars, and team directories</li>
<li><strong>Website banners and headers</strong> — crop to a wide ratio to create hero images that span full-width layouts</li>
<li><strong>Product images</strong> — remove background clutter and center the product for consistent online store listings</li>
<li><strong>Video thumbnails</strong> — crop to 16:9 for YouTube and other video platforms</li>
<li><strong>Print photos</strong> — crop to standard print ratios (4:3, 3:2) to avoid white borders when ordering prints</li>
</ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>A few simple techniques will help you get cleaner crops:</p>
<ul>
<li>Use the <strong>rule of thirds</strong> — place the main subject off-center rather than dead-center for a more visually engaging composition.</li>
<li>Crop <strong>as little as necessary</strong> — removing too much reduces the image resolution and can make the result look soft when displayed large.</li>
<li>For portraits, leave some <strong>breathing room</strong> above the head — cropping too close to the top of the frame feels cramped.</li>
<li>Use an <strong>aspect ratio preset</strong> when you know the target platform, rather than cropping freehand and hoping it fits.</li>
</ul>`,
  },
];

export default function ImageCropperPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <ImageCropper />
    </ToolContainer>
  );
}
