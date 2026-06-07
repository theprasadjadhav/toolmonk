import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { TypingSpeedTest } from "@/components/tools/utility-tools/TypingSpeedTest";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("typing-speed-test");
const tool = TOOLS.find((t) => t.slug === "typing-speed-test" && t.category === "utility-tools")!;

const howToSteps = [
  "Choose your <strong>test duration</strong> (15 s, 30 s, 60 s, or 120 s) and <strong>difficulty level</strong> (Easy, Medium, or Hard).",
  "Click anywhere on the passage text or tap the typing area to focus it — the timer starts the moment you press the first key.",
  "Type the displayed passage as accurately and quickly as you can — correct characters light up, mistakes are highlighted in red.",
  "When the timer ends (or you finish the passage) your <strong>WPM, accuracy, and raw score</strong> are shown instantly. Hit <strong>Try Again</strong> to retest the same passage or <strong>New Test</strong> for a fresh one.",
];

const faqs = [
  {
    question: "What does WPM mean?",
    answer:
      "<strong>WPM (words per minute)</strong> is the standard measure of typing speed. Rather than counting actual words, one 'word' is defined as five keystrokes — spaces included. This makes comparisons fair regardless of whether you type short or long words. Only correctly typed characters count toward your WPM.",
  },
  {
    question: "What is a good typing speed?",
    answer:
      "The average adult types at <strong>40–50 WPM</strong>. Professional typists typically reach <strong>70–90 WPM</strong>, and competitive speed typists regularly exceed <strong>120 WPM</strong>. For most office and knowledge-work roles, 60 WPM with high accuracy is a solid target.",
  },
  {
    question: "Does accuracy matter as much as speed?",
    answer:
      "Yes — accuracy matters more in practice. A typist who types fast but makes many errors spends more time correcting mistakes than a slower, more accurate typist. This test counts only <strong>correctly typed characters</strong> toward your WPM, so slowing down slightly to reduce errors usually improves your effective score.",
  },
  {
    question: "What is Raw WPM?",
    answer:
      "<strong>Raw WPM</strong> counts all keystrokes regardless of accuracy — it shows your theoretical maximum speed. Your <strong>WPM</strong> (corrected) only counts characters you typed correctly. The difference between the two indicates how much your errors are costing you.",
  },
  {
    question: "Can I use this on mobile?",
    answer:
      "Yes — the tool works on touchscreen devices. Tap the passage area to bring up the keyboard and type normally. The on-screen keyboard may reduce your speed compared to a physical keyboard, which is expected.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is WPM and How Is It Calculated?",
    content: `<p><strong>WPM (words per minute)</strong> is the universal standard for measuring typing speed. It is calculated by counting the number of correctly typed characters, dividing by five (the conventional word length), and dividing again by the number of minutes elapsed:</p>
<p><code>WPM = (correct characters ÷ 5) ÷ minutes</code></p>
<p>Using a fixed character count per word — rather than actual word boundaries — makes the metric language-agnostic and consistent across different texts. Only correct keystrokes contribute to your WPM, so accuracy directly affects your score.</p>`,
  },
  {
    title: "How Accuracy Is Measured",
    content: `<p><strong>Accuracy</strong> is the percentage of keystrokes that matched the passage exactly: <code>(correct characters ÷ total typed) × 100</code>. A score of 95% or above is generally considered acceptable for professional typing. Anything below 90% suggests that trading some speed for care would raise your effective WPM.</p>
<p>This tool also shows your <strong>Raw WPM</strong> — the speed you would have if every keystroke were correct. Comparing your WPM to your Raw WPM shows how much your errors are dragging down your effective score.</p>`,
  },
  {
    title: "Tips to Improve Your Typing Speed",
    content: `<ul>
<li><strong>Learn touch typing</strong> — assign each finger a fixed set of keys and never look down at the keyboard. This is the single biggest speed unlock for most people.</li>
<li><strong>Prioritise accuracy first</strong> — practise at a speed where you make almost no mistakes, then gradually increase. Building muscle memory for correct patterns is faster than unlearning bad habits.</li>
<li><strong>Use all ten fingers</strong> — two-finger typists hit a hard ceiling around 40–50 WPM. A full ten-finger technique removes that ceiling entirely.</li>
<li><strong>Practise regularly in short sessions</strong> — 10–15 minutes of focused practice daily produces faster gains than occasional long sessions.</li>
<li><strong>Test at different difficulty levels</strong> — easy passages build confidence and rhythm; hard passages with punctuation, numbers, and uncommon words improve versatility.</li>
</ul>`,
  },
];

export default function TypingSpeedTestPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <TypingSpeedTest />
    </ToolContainer>
  );
}
