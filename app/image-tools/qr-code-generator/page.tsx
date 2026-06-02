import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { QrCodeGeneratorShared as QrCodeGenerator } from "@/components/tools/lazy-client";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("qr-code-generator");
const tool = TOOLS.find((t) => t.slug === "qr-code-generator" && t.category === "image-tools")!;

const howToSteps = [
  "Enter the <strong>content to encode</strong> — a URL, plain text, email address, phone number, or any other data you want the QR code to represent.",
  "Adjust the <strong>size, margin, and error correction level</strong> to suit your use case — a higher error correction level keeps the code scannable even if part of it is damaged or covered.",
  "Customise the <strong>dot and corner styles</strong> — choose from square, rounded, dots, and more to match your brand or design.",
  "Pick <strong>colors for the dots, corners, and background</strong> to integrate the QR code into your visual design while maintaining contrast for reliable scanning.",
  "Download as <strong>PNG</strong> for raster use on screen, or <strong>SVG</strong> for print and vector editing at any size.",
];

const faqs = [
  {
    question: "What content can I encode in a QR code?",
    answer:
      "Any plain text: <strong>URLs, email addresses, phone numbers, Wi-Fi credentials (manual format), vCard contact data</strong>, or free-form text. The most common use is encoding a web address so it can be scanned and opened instantly on a phone.",
  },
  {
    question: "What is the error correction level?",
    answer:
      "<strong>Error correction</strong> allows a QR code to be read even if part of it is physically damaged, dirty, or partially obscured. There are four levels: <strong>L (7%), M (15%), Q (25%), H (30%)</strong> — the percentage indicates how much of the code can be damaged while still being scannable. Higher levels create a denser pattern but are more resilient.",
  },
  {
    question: "What is the difference between PNG and SVG download?",
    answer:
      "<strong>PNG</strong> is a raster image — it has a fixed resolution and looks best at the size it was generated. <strong>SVG</strong> is a vector format that scales to any size without pixelation, making it ideal for print, large-format signage, and embedding in design files.",
  },
  {
    question: "Can I use custom colors in a QR code?",
    answer:
      "Yes — but always ensure <strong>sufficient contrast</strong> between the dots and the background. Light dots on a dark background or dark dots on a light background both work. Avoid low-contrast combinations (e.g. dark red on black) as they may cause scan failures, especially in poor lighting.",
  },
  {
    question: "How much data can a QR code hold?",
    answer:
      "A standard QR code can hold up to <strong>4,296 alphanumeric characters</strong>. However, longer content produces a denser, more complex pattern that is harder to scan quickly. For best scanning performance, keep URLs and text as <strong>short as possible</strong> — use a URL shortener for long web addresses.",
  },
  {
    question: "Can I add a logo to the QR code?",
    answer:
      "The built-in style options do not include logo embedding directly. However, you can download the <strong>SVG or PNG</strong> and overlay a logo using an image editor. Set the <strong>error correction level to H (30%)</strong> before doing so — this ensures the code remains scannable even with the logo covering part of the pattern.",
  },
  {
    question: "Is this tool free?",
    answer: "Yes — completely free with no registration required.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About QR Codes",
    content: `<p>A <strong>QR code (Quick Response code)</strong> is a two-dimensional barcode that stores data as a pattern of black and white squares. Unlike a traditional one-dimensional barcode that only encodes data horizontally, a QR code stores data in both dimensions, allowing it to hold significantly more information in a compact space.</p>
<p>QR codes can be scanned by any modern smartphone camera without a dedicated app — the camera automatically recognizes the pattern and presents the encoded content. This makes them one of the most accessible and widely used ways to <strong>bridge physical and digital experiences</strong>.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>QR codes are used across an enormous range of industries and applications:</p>
<ul>
<li><strong>Marketing and advertising</strong> — printed on flyers, posters, and packaging to link to websites, promotions, or videos</li>
<li><strong>Restaurant menus</strong> — replace printed menus with a QR code linking to an online menu</li>
<li><strong>Event tickets and boarding passes</strong> — encode booking references for fast, contactless entry scanning</li>
<li><strong>Business cards</strong> — encode contact information (vCard) so recipients can save details with a single scan</li>
<li><strong>Wi-Fi sharing</strong> — encode network credentials so guests can connect without typing a password</li>
<li><strong>Payment systems</strong> — link to payment pages or encode payment data for contactless transactions</li>
</ul>`,
  },
  {
    title: "Tips for Printing and Using QR Codes",
    content: `<p>A QR code that looks fine on screen may fail to scan when printed. Follow these guidelines:</p>
<ul>
<li>Always maintain a <strong>quiet zone</strong> — a blank white margin at least 4 modules (squares) wide around the entire code. Without it, scanners may fail to locate the code boundaries.</li>
<li>Print at <strong>sufficient size</strong> — a minimum of 2 × 2 cm (about 0.8 inches square) for scanning at typical smartphone distance. Larger is always better.</li>
<li>Use <strong>SVG format</strong> for print to ensure sharp edges at any size — raster PNG images can look blurry when scaled up for large-format printing.</li>
<li><strong>Test the QR code</strong> before printing a large run by scanning it with multiple devices and apps to confirm reliability.</li>
</ul>`,
  },
];

export default function QrCodeGeneratorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <QrCodeGenerator />
    </ToolContainer>
  );
}
