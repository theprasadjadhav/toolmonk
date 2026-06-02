import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { PdfLock } from "@/components/tools/lazy-client";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("pdf-lock");

const tool = TOOLS.find((t) => t.slug === "pdf-lock")!;

const howToSteps = [
  "Drop a PDF onto the upload area or click to browse. <strong>Any PDF</strong> can be password-protected, regardless of its current content.",
  "Enter a <strong>user password</strong> — this is the password anyone will need to type before the document will open.",
  "Optionally set an <strong>owner password</strong> to separately control editing permissions without sharing the open password.",
  "Choose which actions readers are permitted to perform: <strong>print, copy text, or modify</strong> the document. Leave them unchecked to restrict those actions.",
  "Click <strong>Lock PDF &amp; Download</strong> — your file is encrypted and the secured PDF downloads automatically to your device.",
];

const faqs = [
  {
    question: "What encryption standard is used?",
    answer:
      "<strong>AES-256 encryption</strong> — the strongest encryption level defined in the PDF 2.0 specification. It is widely recognised as unbreakable with current technology when a strong password is chosen.",
  },
  {
    question: "What is the difference between the user password and the owner password?",
    answer:
      "The <strong>user password</strong> is required to open and view the PDF. The <strong>owner password</strong> separately controls permissions such as printing, copying, and editing. If you leave the owner password blank, the user password applies to both roles.",
  },
  {
    question: "Is my file stored on your servers?",
    answer:
      "No. Your PDF is uploaded only to perform the encryption and is <strong>deleted from the server immediately</strong> after the locked file is sent back to you. Nothing is retained.",
  },
  {
    question: "Can I remove the password later?",
    answer:
      "Yes — use the <strong>PDF Unlock</strong> tool on this site. You will need the correct user or owner password to remove the protection.",
  },
  {
    question: "Will the locked PDF open in any PDF reader?",
    answer:
      "Yes. <strong>AES-256 password protection</strong> is supported by all major PDF viewers including desktop applications, mobile apps, and browser-based PDF viewers.",
  },
  {
    question: "What happens if someone tries to open the PDF without the password?",
    answer:
      "Any PDF viewer will show a <strong>password prompt</strong>. The document contents remain completely inaccessible until the correct password is entered. Without the password, the file cannot be read, printed, or copied.",
  },
  {
    question: "Can I lock a PDF that is already password-protected?",
    answer:
      "You will first need to unlock the PDF to remove the existing password, then re-lock it with a new password. Use the <strong>PDF Unlock</strong> tool to remove the old protection before re-locking.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is PDF Password Protection?",
    content: `<p><strong>PDF password protection</strong> uses encryption to prevent unauthorized access to a document's contents. When a password is applied, the file's data is scrambled using an encryption key derived from the password. Without the correct password, the encrypted data is unreadable.</p><p>There are two layers of PDF protection: an <strong>open password</strong> (also called a user password) that controls who can view the file, and a <strong>permissions password</strong> (owner password) that controls what actions are allowed — such as printing, copying text, or making edits — even for someone who can open the file.</p>`,
  },
  {
    title: "Common Use Cases for PDF Locking",
    content: `<p>Password-protecting a PDF is useful in many professional and personal situations:</p><ul><li><strong>Confidential documents:</strong> Legal contracts, financial reports, medical records, and HR documents benefit from password protection to limit access.</li><li><strong>Read-only distribution:</strong> Lock a PDF so recipients can read it but cannot edit, copy, or redistribute the content.</li><li><strong>Secure sharing via email:</strong> Attach a locked PDF and share the password through a separate channel (phone, text message) for added security.</li><li><strong>Protecting intellectual property:</strong> Prevent unauthorized copying or printing of proprietary materials such as course content, templates, or designs.</li></ul>`,
  },
  {
    title: "Tips for Choosing a Strong Password",
    content: `<p>The security of a locked PDF depends entirely on the strength of the password chosen. Follow these guidelines:</p><ul><li>Use at least <strong>12 characters</strong> combining uppercase letters, lowercase letters, numbers, and symbols.</li><li>Avoid common words, names, dates, or predictable patterns.</li><li>Use a <strong>unique password</strong> not used for any other account or document.</li><li>Store the password in a secure password manager — if the password is lost, the file contents are permanently inaccessible.</li><li>Share the password through a <strong>different channel</strong> than the one used to send the PDF itself.</li></ul>`,
  },
];

export default function PdfLockPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <PdfLock />
    </ToolContainer>
  );
}
