import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { QrCodeGeneratorTool as QrCodeGenerator } from "@/components/tools/lazy-client";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("qr-code-generator");

const tool = TOOLS.find((t) => t.slug === "qr-code-generator" && t.category === "generators")!;

const howToSteps = [
  "Enter the <strong>content to encode</strong> — a website URL, plain text, email address, phone number, or any other information you want scanners to retrieve.",
  "Adjust the <strong>size, margin, and error correction level</strong> to suit your use case. Higher error correction allows the code to remain scannable even if partially obscured or damaged.",
  "Customise the <strong>dot style and corner styles</strong> to create a distinctive look — choose from square, rounded, dots, and more to match your brand.",
  "Pick <strong>colors for the dots, corners, and background</strong>. Keep sufficient contrast between foreground and background for reliable scanning.",
  "Download as <strong>PNG</strong> for digital use or <strong>SVG</strong> for print and professional design work.",
];

const faqs = [
  {
    question: "What content can I encode in a QR code?",
    answer:
      "Any plain text up to a few thousand characters: <strong>URLs, email addresses, phone numbers, Wi-Fi credentials, vCard contact data</strong>, location coordinates, or free-form text. URLs are the most common use case.",
  },
  {
    question: "What is the error correction level?",
    answer:
      "<strong>Error correction</strong> allows a QR code to be read even if part of it is damaged, dirty, or covered by a logo. Level L recovers 7% of damage, M recovers 15%, Q recovers 25%, and H recovers 30%. Higher levels produce a denser, more complex code. L or M is suitable for most uses; H is recommended if adding a logo overlay.",
  },
  {
    question: "What is the difference between PNG and SVG download?",
    answer:
      "<strong>PNG</strong> is a raster image best for screen display, digital documents, and web use. <strong>SVG</strong> is a vector format that scales without pixelation — ideal for print materials, signage, business cards, and large-format applications.",
  },
  {
    question: "Can I add a logo to the center of the QR code?",
    answer:
      "To safely add a logo, use <strong>error correction level H</strong> (30% recovery). A logo covering up to 30% of the code area can be overlaid without preventing scanning. Place the logo in the center where the error correction data is most concentrated.",
  },
  {
    question: "Is this tool free?",
    answer: "Yes — completely free with no registration required.",
  },
  {
    question: "Do QR codes expire?",
    answer:
      "The <strong>QR code itself</strong> does not expire — it is simply an encoded pattern. However, if the code points to a URL, the destination can change or become unavailable if the website goes offline or the URL structure changes. Static content (plain text, phone numbers, email addresses) encoded directly in the QR code will always decode correctly.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is a QR Code?",
    content: `<p>A <strong>QR code (Quick Response code)</strong> is a two-dimensional barcode that stores data in a grid of black and white squares. Unlike a traditional 1D barcode that can only hold a small number of numeric digits, a QR code can encode thousands of characters including text, URLs, and contact information.</p><p>QR codes are read by smartphone cameras and dedicated scanners. When scanned, the device decodes the pattern and performs an action — opening a URL, saving a contact, connecting to Wi-Fi, or displaying text. The format became ubiquitous for contactless menus, ticketing, payments, and marketing after smartphones made scanning effortless.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>QR codes are used across virtually every industry:</p><ul><li><strong>Marketing and advertising:</strong> Print QR codes on packaging, posters, business cards, and signs to link people directly to websites, videos, or promotions.</li><li><strong>Restaurants and menus:</strong> Link table QR codes to digital menus for contactless ordering.</li><li><strong>Event ticketing:</strong> Embed booking references in QR codes for fast, automated entry verification.</li><li><strong>Wi-Fi sharing:</strong> Encode Wi-Fi credentials so guests can connect without typing a password.</li><li><strong>Contact sharing:</strong> Encode vCard data so people can add your contact information to their phone by scanning a code on your business card.</li></ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>To create QR codes that scan reliably in all conditions:</p><ul><li>Always maintain <strong>high contrast</strong> between the foreground and background — dark patterns on a light background work best.</li><li>Include a <strong>quiet zone</strong> (blank margin) of at least four modules around the QR code to help scanners locate the pattern boundaries.</li><li>Use <strong>error correction level H</strong> when adding logos or placing codes in environments where partial obstruction is likely.</li><li><strong>Test your code</strong> with multiple devices before printing at scale — scan it on different phones and in different lighting conditions.</li><li>For print applications, use <strong>SVG format</strong> to ensure crisp rendering at any size.</li></ul>`,
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
