import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { PasswordGenerator } from "@/components/tools/generators/PasswordGenerator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("password-generator");

const tool = TOOLS.find((t) => t.slug === "password-generator")!;

const howToSteps = [
  "Set the desired <strong>password length</strong> (4–256 characters). Longer passwords are exponentially harder to crack — 16 characters is a good minimum for most accounts.",
  "Choose how many <strong>passwords to generate</strong> at once (up to 100). Generating a batch lets you pick the one that looks easiest to transcribe if needed.",
  "Toggle the <strong>character sets</strong> you want included: lowercase letters, uppercase letters, digits, and symbols. Including all four types produces the strongest passwords.",
  "Click <strong>Generate</strong> to produce a fresh set of passwords. Click again at any time to generate a new batch.",
  "Use the <strong>copy buttons</strong> to copy individual passwords or the entire list at once for use in a password manager.",
];

const faqs = [
  {
    question: "How are passwords generated?",
    answer:
      "Passwords are generated entirely in your <strong>browser</strong> using cryptographically secure randomness from your device's hardware. Nothing is sent to any server — your passwords never leave your device.",
  },
  {
    question: "What makes a strong password?",
    answer:
      "A strong password is <strong>at least 12 characters long</strong> and uses a mix of uppercase letters, lowercase letters, digits, and symbols. Length is the most important factor — a 20-character password of only lowercase letters is stronger than an 8-character password using all character types.",
  },
  {
    question: "Can I use symbols in my password?",
    answer:
      'Yes — enable the <strong>symbols</strong> character set to include characters like <strong>!@#$%^&amp;*()</strong> in generated passwords. Some systems restrict certain symbols, so check your target service\'s requirements if a password is rejected.',
  },
  {
    question: "How do I store generated passwords safely?",
    answer:
      "Use a <strong>password manager</strong> to store generated passwords. Password managers encrypt your stored passwords and fill them in automatically, so you only need to remember one strong master password.",
  },
  {
    question: "Is this tool free?",
    answer: "Yes — completely free with no registration required.",
  },
  {
    question: "Should I use a different password for every account?",
    answer:
      "Yes — using <strong>unique passwords</strong> for every account means that if one service is compromised, your other accounts remain safe. A password manager makes this practical by remembering all the different passwords for you.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Makes a Password Strong?",
    content: `<p>Password strength is determined by two key factors: <strong>length</strong> and <strong>character variety</strong>. A longer password is exponentially more difficult to guess because the number of possible combinations grows with each additional character. Adding more character types (uppercase, lowercase, digits, symbols) increases the number of possible values for each character position.</p><p>A <strong>16-character random password</strong> using all character types has billions of trillions of possible combinations — far beyond the reach of any brute-force attack. The strength meter in this tool gives a live estimate of password quality as you adjust the settings.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Strong, random passwords are needed for virtually every digital account:</p><ul><li><strong>Online accounts:</strong> Email, banking, shopping, and social media accounts all benefit from long, unique random passwords.</li><li><strong>System credentials:</strong> Server logins, database passwords, and admin accounts require the strongest passwords available.</li><li><strong>API keys and secrets:</strong> When creating temporary passwords for testing or automation, a random password generator ensures no patterns or guessable values are used.</li><li><strong>WiFi network passwords:</strong> A strong WPA2 or WPA3 password prevents unauthorized access to your network.</li></ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>To use generated passwords effectively:</p><ul><li>Use a minimum of <strong>16 characters</strong> for important accounts such as email, banking, and password managers.</li><li>Enable <strong>all character types</strong> for maximum strength unless the target service restricts certain characters.</li><li>Never reuse passwords — generate a <strong>unique password</strong> for every account and store them in a password manager.</li><li>Avoid sharing passwords via unencrypted channels like plain email or text messages — use a secure sharing method when necessary.</li></ul>`,
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
