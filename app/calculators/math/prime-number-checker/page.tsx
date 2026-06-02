import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { PrimeCheckerCalculator } from "@/components/tools/calculators/PrimeCheckerCalculator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("prime-number-checker");
const tool = TOOLS.find((t) => t.slug === "prime-number-checker")!;

const howToSteps = [
  "Type any <strong>positive whole number</strong> into the input field, or click one of the preset buttons to load a well-known example — try a large number to see the full divisor list.",
  "The checker tests divisibility starting from 2 and working up to the <strong>square root of the number</strong>; if no divisor is found in that range, the number is confirmed <strong>prime</strong>.",
  "Review the <strong>PRIME or COMPOSITE badge</strong>, the complete <strong>prime factorization</strong>, and the full list of <strong>divisors</strong> shown below the result.",
];

const faqs = [
  {
    question: "What makes a number prime?",
    answer:
      "A <strong>prime number</strong> is a natural number greater than 1 that has no positive divisors other than <strong>1 and itself</strong>. The first few primes are 2, 3, 5, 7, 11, 13, 17, 19, and 23. Notably, <strong>2 is the only even prime</strong> — every other even number is divisible by 2.",
  },
  {
    question: "Why are 0 and 1 not prime?",
    answer:
      "By mathematical convention, <strong>1 is excluded</strong> from the primes because including it would destroy the uniqueness of prime factorization — you could write any number as 1 × 1 × … × its prime factors in infinitely many ways. Zero is not a positive integer and does not fit the divisibility-based definition of primality.",
  },
  {
    question: "What is prime factorization?",
    answer:
      "<strong>Prime factorization</strong> expresses any integer greater than 1 as a product of prime numbers. For example, 60 = 2² × 3 × 5. This representation is <strong>unique</strong> for every number — there is only one way to write it as a product of primes (ignoring the order of the factors). It is the foundation of many number-theory results.",
  },
  {
    question: "Why only check up to the square root?",
    answer:
      "If a number n has a divisor larger than its <strong>square root</strong>, then the corresponding paired divisor must be smaller than the square root. By the time you have tested all values up to √n without finding a factor, you have implicitly ruled out all larger factors too — so no further checking is needed. This makes the process much faster for large numbers.",
  },
  {
    question: "What is a composite number?",
    answer:
      "A <strong>composite number</strong> is any positive integer greater than 1 that is <em>not</em> prime — meaning it has at least one divisor other than 1 and itself. For example, 12 is composite because it is divisible by 2, 3, 4, and 6. The checker displays the full list of divisors and the prime factorization for every composite result.",
  },
  {
    question: "Are there infinitely many prime numbers?",
    answer:
      "Yes. Euclid proved more than 2,000 years ago that <strong>there is no largest prime</strong>. The proof is elegant: assume there is a finite list of all primes, multiply them all together and add 1 — the result is either prime itself or has a prime factor not on the original list, contradicting the assumption. Primes become less frequent as numbers grow larger, but they never stop appearing.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is a Prime Number?",
    content: `<p>A <strong>prime number</strong> is a whole number greater than 1 that can only be divided evenly by <strong>1 and itself</strong>. The sequence begins: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29 …</p>
<p>Any whole number greater than 1 that is not prime is called a <strong>composite number</strong>, meaning it can be broken down into smaller prime factors. For example, 12 = 2 × 2 × 3.</p>
<p>Prime numbers are the <strong>building blocks of all integers</strong> — every whole number greater than 1 is either prime itself or can be expressed uniquely as a product of primes.</p>`,
  },
  {
    title: "How It Works",
    content: `<p>To test whether a number n is prime, the checker divides n by every integer starting at 2 and stopping at the <strong>square root of n</strong>. This is sufficient because:</p>
<ul>
<li>If n has any factor larger than its square root, the <em>other</em> factor in that pair must be smaller than the square root.</li>
<li>So checking all values up to √n is enough to rule out all possible factors.</li>
</ul>
<p>If no exact divisor is found in that range, <strong>n is prime</strong>. If a divisor is found, the checker records it and continues factoring to build the complete <strong>prime factorization</strong>.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Prime numbers are not just a theoretical curiosity — they have practical applications:</p>
<ul>
<li><strong>Encryption:</strong> The security of widely used encryption methods relies on the fact that multiplying two large primes is easy, but factoring the product back into those primes is computationally very hard.</li>
<li><strong>Hash tables:</strong> Choosing a prime number as the size of a hash table reduces clustering and improves distribution of stored values.</li>
<li><strong>Education and puzzles:</strong> Identifying primes, finding prime factorizations, and working with GCD/LCM are core skills in school mathematics and competitive problem solving.</li>
<li><strong>Random number generation:</strong> Certain methods for generating sequences of pseudo-random numbers use prime moduli to achieve long, well-distributed cycles.</li>
</ul>`,
  },
];

export default function PrimeCheckerPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <PrimeCheckerCalculator />
    </ToolContainer>
  );
}
