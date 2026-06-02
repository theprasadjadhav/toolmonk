import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { PasswordGenerator } from "@/components/tools/shared/security/PasswordGenerator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("password-generator");
const tool = TOOLS.find((t) => t.slug === "password-generator" && t.category === "dev-tools")!;

const howToSteps = [
  "Set the desired <strong>password length</strong> (4–256 characters) — longer passwords are significantly harder to crack.",
  "Choose <strong>how many passwords</strong> to generate at once (up to 100) to create a batch for multiple accounts.",
  "Toggle <strong>character sets</strong>: enable or disable lowercase letters, uppercase letters, digits, and symbols to meet the requirements of any site or system.",
  "Click <strong>Generate</strong> — click again at any time to produce a fresh batch of passwords.",
  "Copy <strong>individual passwords</strong> using the copy icon next to each, or copy all at once with the batch copy button.",
];

const faqs = [
  {
    question: "How are passwords generated?",
    answer:
      "Passwords are generated <strong>entirely in your browser</strong> using a cryptographically secure random source, which produces true randomness suitable for security applications. Nothing is sent to any server.",
  },
  {
    question: "What makes a strong password?",
    answer:
      "A strong password is <strong>at least 12 characters long</strong> and uses a mix of uppercase letters, lowercase letters, digits, and symbols. The <strong>strength meter</strong> shows a live rating as you adjust the settings so you can see the impact immediately.",
  },
  {
    question: "Can I use symbols in my password?",
    answer:
      'Yes — enable the <strong>symbols</strong> character set to include special characters in generated passwords. If a specific site or system restricts certain symbols, you can generate a new password until you get one that meets the requirements.',
  },
  {
    question: "Is this tool free?",
    answer:
      "Yes — completely free with <strong>no registration required</strong>.",
  },
  {
    question: "How is password strength measured?",
    answer:
      "Strength is based on the size of the <strong>character pool</strong> (which character sets are enabled) combined with the <strong>password length</strong>. Together these determine the total number of possible passwords — more possibilities means a stronger, harder-to-guess password.",
  },
  {
    question: "Should I use a password generator instead of making up my own passwords?",
    answer:
      "Yes. Human-invented passwords tend to follow predictable patterns — common words, names, dates, and simple substitutions. A <strong>randomly generated password</strong> has no predictable structure, making it far more resistant to guessing and brute-force attacks.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is Password Entropy?",
    content: `<p><strong>Password entropy</strong> measures how unpredictable a password is. It is calculated based on the size of the character pool and the password length. A password drawn from a pool of 94 printable characters at 16 characters long has over 100 bits of entropy — practically impossible to brute-force.</p>
<p>Entropy increases dramatically with length. Adding just two more characters can double or triple the time needed to crack a password. This is why <strong>length is the most impactful factor</strong> in password strength.</p>`,
  },
  {
    title: "Password Security Best Practices",
    content: `<p>Follow these principles to stay secure:</p>
<ul>
<li>Use a <strong>unique password for every account</strong> — reusing passwords means one breach exposes all accounts</li>
<li>Use a <strong>password manager</strong> to store complex passwords safely — you only need to remember one master password</li>
<li><strong>Never share passwords</strong> via email, chat, or unencrypted channels</li>
<li>Enable <strong>two-factor authentication (2FA)</strong> where available — a strong password plus 2FA is much harder to compromise</li>
<li><strong>Change passwords immediately</strong> if you suspect a breach or if a service reports a data leak</li>
</ul>`,
  },
  {
    title: "How Password Cracking Works",
    content: `<p>Understanding how attackers crack passwords helps you choose better ones:</p>
<ul>
<li><strong>Brute force:</strong> Tries every possible combination — length and character variety directly determine how long this takes</li>
<li><strong>Dictionary attacks:</strong> Tries common words, names, and known passwords first — random passwords are immune to this</li>
<li><strong>Pattern attacks:</strong> Exploits predictable substitutions (e.g. replacing 'a' with '@') — random generation avoids all patterns</li>
<li><strong>Credential stuffing:</strong> Reuses passwords leaked from other breaches — unique passwords per site neutralize this</li>
</ul>`,
  },
];

export default function PasswordGeneratorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <PasswordGenerator />
    </ToolContainer>
  );
}
