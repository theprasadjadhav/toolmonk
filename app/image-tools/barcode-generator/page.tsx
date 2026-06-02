import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { BarcodeGeneratorShared as BarcodeGenerator } from "@/components/tools/lazy-client";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("barcode-generator");
const tool = TOOLS.find((t) => t.slug === "barcode-generator" && t.category === "image-tools")!;

const howToSteps = [
  "Select the <strong>barcode format</strong> that matches your use case — Code 128 for general text, EAN-13 or UPC-A for retail products, ITF-14 for shipping cartons.",
  "Enter the <strong>value to encode</strong> in the input field. Each format has its own rules — EAN-13 requires exactly 12 numeric digits, Code 128 accepts any ASCII text.",
  "Adjust <strong>bar width, height, and colors</strong> using the styling controls to match your print or design requirements.",
  "Toggle the <strong>text label</strong> below the barcode on or off depending on whether you need the human-readable value displayed.",
  "Click <strong>Download SVG</strong> to save a scalable vector file that can be printed at any size without losing sharpness.",
];

const faqs = [
  {
    question: "Which barcode format should I use?",
    answer:
      "<strong>Code 128</strong> is the most versatile — it encodes any ASCII character and is widely supported in logistics and inventory. <strong>EAN-13</strong> and <strong>UPC-A</strong> are the standards for retail product packaging. <strong>Code 39</strong> is common in industrial and government contexts. <strong>ITF-14</strong> is used for outer shipping containers.",
  },
  {
    question: "Why does EAN-13 require 12 digits instead of 13?",
    answer:
      "The <strong>13th digit is a check digit</strong> calculated automatically from the first 12. Enter the 12 data digits and the tool includes the correct check digit in the final barcode. Entering an incorrect number of digits will result in a validation error.",
  },
  {
    question: "Can I change the barcode colors?",
    answer:
      "Yes — you can set any color for the <strong>bars and the background</strong>. For reliable scanning in the real world, always ensure sufficient contrast between bar and background. <strong>Black bars on a white background</strong> is the most universally readable combination.",
  },
  {
    question: "Why use SVG instead of PNG?",
    answer:
      "<strong>SVG is a vector format</strong> — it scales to any size without becoming blurry or pixelated. This makes it ideal for print labels, packaging, and any use where the barcode may be printed at varying sizes. PNG is a fixed-resolution format and can look soft when enlarged.",
  },
  {
    question: "Can scanners read barcodes generated here?",
    answer:
      "Yes — the barcodes follow the official symbology specifications for each format. Any standard barcode scanner, mobile app, or point-of-sale system will be able to read them, provided the <strong>contrast and quiet zones</strong> (blank margins around the barcode) are maintained.",
  },
  {
    question: "Is this tool free?",
    answer: "Yes — completely free with no registration required.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About Barcode Formats",
    content: `<p>A <strong>barcode</strong> is a machine-readable representation of data — typically numbers or text — encoded as a pattern of parallel bars and spaces. Different industries and applications use different <strong>symbologies</strong> (barcode formats), each designed for specific data types and scanning environments.</p>
<p><strong>1D barcodes</strong> like Code 128, EAN-13, and UPC-A encode data horizontally and are read by laser scanners and camera-based readers. They are the standard for retail, logistics, healthcare, and manufacturing. Each format has defined rules for character sets, lengths, and check digits to ensure data integrity.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Barcodes are used wherever items need to be <strong>tracked, identified, or priced efficiently</strong>:</p>
<ul>
<li><strong>Retail products</strong> — EAN-13 and UPC-A appear on product packaging for point-of-sale scanning worldwide</li>
<li><strong>Inventory and warehousing</strong> — Code 128 and Code 39 label boxes, shelves, and assets for stock management</li>
<li><strong>Shipping and logistics</strong> — ITF-14 and Code 128 identify cartons and pallets throughout the supply chain</li>
<li><strong>Event tickets and boarding passes</strong> — barcodes encode booking references for fast entry scanning</li>
<li><strong>Healthcare</strong> — patient wristbands and medication labels use barcodes to reduce errors</li>
</ul>`,
  },
  {
    title: "Tips for Printing Barcodes",
    content: `<p>A barcode that looks correct on screen may fail to scan if it is not printed properly. Follow these guidelines:</p>
<ul>
<li>Always maintain a <strong>quiet zone</strong> — a blank margin at least 10 times the bar width on each side of the barcode.</li>
<li>Print at <strong>sufficient resolution</strong> — at minimum 200 DPI, with 300 DPI or higher recommended for small labels.</li>
<li>Use <strong>high contrast</strong> — dark bars on a light background. Avoid colored backgrounds that reduce contrast.</li>
<li>Test the printed barcode with your actual scanner before producing large runs of labels.</li>
</ul>`,
  },
];

export default function BarcodeGeneratorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <BarcodeGenerator />
    </ToolContainer>
  );
}
