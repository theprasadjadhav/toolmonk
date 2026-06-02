import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { ImageRotator } from "@/components/tools/image-tools/ImageRotator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("image-rotator");

const tool = TOOLS.find((t) => t.slug === "image-rotator")!;

const howToSteps = [
  "Drop or select an image to load it into the <strong>rotation editor</strong>.",
  "Enter a <strong>custom rotation angle</strong> in the input field, or use the preset buttons to rotate by <strong>90°, 180°, 270°, or −90°</strong> with a single click.",
  "Toggle <strong>Flip H</strong> or <strong>Flip V</strong> to mirror the image horizontally or vertically, independently of the rotation angle.",
  "Choose whether to <strong>expand the canvas</strong> to accommodate the rotated image without clipping corners, or keep the original canvas dimensions.",
  "Select an <strong>output format</strong> and click Download to save the rotated image.",
];

const faqs = [
  {
    question: "What does 'Expand canvas' do?",
    answer:
      "When enabled, the <strong>output canvas grows</strong> to fit the entire rotated image so no corners are clipped. The background color fills the new space. When disabled, the output keeps the original dimensions and any corners that fall outside the frame are clipped.",
  },
  {
    question: "Can I set the background color for rotated areas?",
    answer:
      "Yes — the <strong>background color picker</strong> controls the fill color used for areas revealed when the canvas expands or when a rotation leaves empty space. For transparent backgrounds, export as PNG and be aware that the canvas fill is always opaque.",
  },
  {
    question: "Is there a live preview?",
    answer:
      "Yes — the <strong>preview updates automatically</strong> as you adjust the angle, flip settings, and other options. The download button exports the full-resolution version, not the scaled preview.",
  },
  {
    question: "Can I rotate by an arbitrary angle?",
    answer:
      "Yes — any angle from <strong>−360° to 360°</strong> can be entered. Positive values rotate clockwise, negative values rotate counter-clockwise. The preset buttons are just shortcuts for the most common 90-degree increments.",
  },
  {
    question: "Will rotating by 90° change the image dimensions?",
    answer:
      "Yes — rotating by <strong>90° or 270°</strong> swaps the width and height of the image. A 1920 × 1080 image becomes 1080 × 1920 after a 90° rotation. If you use expand-canvas with an <strong>arbitrary angle</strong> (e.g. 45°), the output will be larger than the original in both dimensions.",
  },
  {
    question: "Is this tool free?",
    answer: "Yes — completely free with no registration required.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Why Rotate or Flip Images?",
    content: `<p>Images often end up in the wrong orientation. Photos taken on a phone may be <strong>saved sideways or upside-down</strong> depending on how the device was held, and some cameras embed orientation information that not all software reads correctly. Rotating the actual pixel data ensures the image displays correctly everywhere, regardless of how the viewer handles metadata.</p>
<p><strong>Flipping</strong> (mirroring) is used in photography to correct the effect of a front-facing camera capturing a mirror image, and in graphic design to create symmetrical compositions.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Rotation and flipping are needed in a wide range of situations:</p>
<ul>
<li><strong>Correcting camera orientation</strong> — fix photos that were shot with the phone held sideways or upside-down</li>
<li><strong>Selfie correction</strong> — flip front-camera photos that appear mirrored compared to reality</li>
<li><strong>Document scanning</strong> — straighten scanned documents that were placed upside-down or sideways</li>
<li><strong>Design and layout</strong> — rotate images to specific angles for creative compositions</li>
<li><strong>Batch correction</strong> — quickly standardize orientation for a set of images before uploading to a website or gallery</li>
</ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>A few things to keep in mind when rotating images:</p>
<ul>
<li>For <strong>90°, 180°, and 270° rotations</strong>, the image quality is lossless — no pixel information is lost.</li>
<li>For <strong>arbitrary angles</strong> (e.g. 15°), the output is slightly resampled to fill in sub-pixel positions, which may introduce a very small amount of softness.</li>
<li>Use <strong>expand canvas</strong> for arbitrary angles to avoid having the rotated image clipped to the original frame.</li>
<li>Export as <strong>PNG</strong> if you need the expanded background areas to appear transparent rather than filled with a color.</li>
</ul>`,
  },
];

export default function ImageRotatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <ImageRotator />
    </ToolContainer>
  );
}
