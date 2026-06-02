import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { PdfUnlock } from "@/components/tools/lazy-client";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("pdf-unlock");

const tool = TOOLS.find((t) => t.slug === "pdf-unlock")!;

const howToSteps = [
  "Drop a PDF onto the upload area or click to browse. The tool accepts <strong>any password-protected PDF</strong>, whether it requires a password to open or only has permission restrictions.",
  "If the PDF has a <strong>user password</strong> (required to open it), enter the password in the field provided. If the PDF only has an <strong>owner password</strong> (permission restrictions with no open password), leave the field blank.",
  "Click <strong>Unlock &amp; Download PDF</strong> — the encryption is removed and the unlocked file downloads automatically. Text, fonts, images, and formatting are fully preserved.",
];

const faqs = [
  {
    question: "How does unlocking work?",
    answer:
      "Your PDF is sent to the server where it is <strong>decrypted using the password you provide</strong>. The resulting file has all encryption and permission restrictions removed. Text, fonts, images, and formatting are fully preserved — unlike tools that re-render pages as images.",
  },
  {
    question: "What if I enter the wrong password?",
    answer:
      "You will see a clear <strong>error message</strong> and no file will be downloaded. Double-check the password and try again. Note that passwords are case-sensitive.",
  },
  {
    question: "My PDF opens without a password but I can't edit or copy text. Can this tool help?",
    answer:
      "Yes. Some PDFs have an <strong>owner password</strong> that restricts editing, printing, or copying without requiring a password to open the file. Leave the password field blank and click Unlock &amp; Download — the owner restrictions will be removed.",
  },
  {
    question: "Can this tool unlock a PDF without knowing the password?",
    answer:
      "No. A <strong>user password</strong> (required to open the file) cannot be bypassed without the correct password. This tool does not attempt to guess or crack passwords.",
  },
  {
    question: "Is my file stored on the server?",
    answer:
      "No. Your PDF is processed in a <strong>temporary directory</strong> and deleted immediately after the unlocked file is sent back. Nothing is retained.",
  },
  {
    question: "What encryption types can this tool remove?",
    answer:
      "The tool can remove <strong>standard PDF password protection</strong> including RC4 and AES encryption (40-bit, 128-bit, and 256-bit) as long as the correct password is provided.",
  },
  {
    question: "Is it legal to unlock a PDF?",
    answer:
      "Unlocking a PDF you own or have legitimate access to is generally permitted. You should only unlock PDFs for which you know the password and have the right to access. Do not use this tool to bypass restrictions on documents you are not authorized to access.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Understanding PDF Password Protection",
    content: `<p>PDF documents can have two types of password protection. An <strong>open password</strong> (user password) prevents anyone from viewing the file without entering the correct password. A <strong>permissions password</strong> (owner password) allows the file to be opened freely but restricts actions like printing, copying text, or making edits.</p><p>When you unlock a PDF, both types of restrictions are removed. The resulting file can be opened, read, edited, printed, and copied without any limitations.</p>`,
  },
  {
    title: "Common Use Cases for Unlocking PDFs",
    content: `<p>There are many legitimate reasons to remove password protection from a PDF:</p><ul><li><strong>Removing forgotten passwords:</strong> If you locked a document yourself and have since forgotten the password, unlocking it (using the correct password you recover) restores full access.</li><li><strong>Removing print or copy restrictions:</strong> Some PDFs are protected against printing or text selection even though no open password is required. Removing these restrictions lets you use the content freely.</li><li><strong>Preparing files for further processing:</strong> Merging, splitting, compressing, and adding page numbers all require an unlocked PDF.</li><li><strong>Archiving documents:</strong> Removing passwords before long-term archiving prevents access issues if passwords are forgotten in the future.</li></ul>`,
  },
];

export default function PdfUnlockPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <PdfUnlock />
    </ToolContainer>
  );
}
