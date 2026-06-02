import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { ImageResizer } from "@/components/tools/image-tools/ImageResizer";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("image-resizer");

const tool = TOOLS.find((t) => t.slug === "image-resizer")!;

const howToSteps = [
  "Drop or select any image file — <strong>JPEG, PNG, WebP, GIF</strong>, and other common formats are supported.",
  "Choose a <strong>resize mode</strong>: enter exact pixel dimensions, or use percentage mode to scale the image relative to its original size.",
  "Toggle the <strong>aspect ratio lock</strong> to keep proportions (changing width adjusts height automatically) or unlock to set width and height independently.",
  "Select a <strong>fit mode</strong>: <em>Stretch</em> fills the exact target size; <em>Contain</em> scales to fit inside with a background fill; <em>Cover</em> scales and crops to fill the target exactly.",
  "Click <strong>Resize</strong> to process the image, then download the result in your chosen format.",
];

const faqs = [
  {
    question: "What is aspect ratio lock?",
    answer:
      "When the lock is enabled, changing the <strong>width</strong> automatically recalculates the <strong>height</strong> (and vice versa) to preserve the original image proportions. Unlock it when you need to set width and height to specific independent values.",
  },
  {
    question: "What is the difference between Stretch, Contain, and Cover?",
    answer:
      "<strong>Stretch</strong> fills the exact target dimensions, which may distort the image if the ratio differs. <strong>Contain</strong> scales the image to fit inside the target while maintaining the aspect ratio, filling leftover space with a background color. <strong>Cover</strong> scales and crops the image to fill the target dimensions exactly — no distortion and no empty space.",
  },
  {
    question: "Is there a size limit?",
    answer:
      "The maximum output dimension is <strong>16,000 px per side</strong> (the browser's canvas limit). Input files larger than 50 MB are rejected to avoid browser memory issues.",
  },
  {
    question: "Will resizing make the image blurry?",
    answer:
      "<strong>Scaling down</strong> (reducing dimensions) generally produces sharp results. <strong>Scaling up</strong> (enlarging beyond the original size) will introduce softness because the tool must estimate pixel values that do not exist in the original — no upscaling method can recover lost detail.",
  },
  {
    question: "Can I resize to a specific file size?",
    answer:
      "This tool resizes by <strong>pixel dimensions</strong>. For controlling output file size, use the Image Compressor and adjust the quality slider alongside a dimension reduction to achieve a target file size.",
  },
  {
    question: "Is this tool free?",
    answer: "Yes — completely free with no registration required.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Why Resize Images?",
    content: `<p>Images are often captured at much higher resolutions than needed for their final use. A photo from a modern camera might be 5000 × 4000 pixels and several megabytes in size, but a web page may only display it at 800 × 600 pixels. Displaying an oversized image wastes <strong>bandwidth, storage, and load time</strong> without any visible benefit to the viewer.</p>
<p>Resizing images to match their <strong>actual display dimensions</strong> is one of the simplest and highest-impact steps you can take to improve website performance and reduce storage costs.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Image resizing is needed in many everyday workflows:</p>
<ul>
<li><strong>Web publishing</strong> — scale photos to the exact display size required by a page layout</li>
<li><strong>Email attachments</strong> — reduce large photos to a size that is practical to send</li>
<li><strong>Social media uploads</strong> — match the required dimensions for profile photos, banners, and post images</li>
<li><strong>E-commerce product photos</strong> — standardize all product images to a consistent pixel size</li>
<li><strong>App and icon assets</strong> — produce specific pixel sizes required by design systems or app stores</li>
</ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>Keep these points in mind to get the sharpest, most efficient resized images:</p>
<ul>
<li>Always <strong>scale down from the original</strong>, not from a previously resized copy — each resize degrades quality slightly.</li>
<li>Use <strong>percentage mode</strong> when you want to halve or quarter an image without needing to calculate the exact pixel values.</li>
<li>For web use, export as <strong>WebP</strong> for the best balance of quality and file size after resizing.</li>
<li>If you need an image to fit a specific container with a different aspect ratio, use <strong>Cover mode</strong> to fill the frame without distortion.</li>
</ul>`,
  },
];

export default function ImageResizerPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <ImageResizer />
    </ToolContainer>
  );
}
