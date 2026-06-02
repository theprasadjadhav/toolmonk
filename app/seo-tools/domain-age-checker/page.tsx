import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { DomainAgeChecker } from "@/components/tools/seo-tools/DomainAgeChecker";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("domain-age-checker");
const tool = TOOLS.find((t) => t.slug === "domain-age-checker")!;

const howToSteps = [
  "Enter a <strong>domain name</strong> (e.g. example.com) into the input field — no need to include https:// or www. Just the bare domain is enough.",
  "Click <strong>Check domain age</strong> to look up the registration data for that domain.",
  "Review the <strong>registration date</strong>, calculated domain age, <strong>expiration date</strong>, last updated date, and the registrar that manages the domain.",
];

const faqs = [
  {
    question: "Where does this data come from?",
    answer:
      "Domain information is fetched from the <strong>RDAP (Registration Data Access Protocol)</strong> network — the modern, structured replacement for the legacy WHOIS protocol. RDAP data is sourced directly from official domain registries, so results are authoritative and up to date.",
  },
  {
    question: "Why does domain age matter for SEO?",
    answer:
      "Older domains often carry accumulated <strong>backlinks</strong>, brand recognition, and a longer trust history with search engines. While domain age alone is not a direct ranking factor, the authority and links built over many years can contribute meaningfully to a site's overall search visibility.",
  },
  {
    question: "What if the domain is not found?",
    answer:
      "The domain may be <strong>unregistered</strong>, very new (not yet propagated in RDAP), or use a country-code TLD that does not support RDAP. In these cases, the tool will return a 'not found' error.",
  },
  {
    question: "Is the expiration date accurate?",
    answer:
      "Expiration dates are sourced from the official registry via RDAP and are generally accurate. However, some registrars may update this date with a small delay after renewal, so a recently renewed domain may still show the old expiry briefly.",
  },
  {
    question: "Can I check any domain extension?",
    answer:
      "Most popular extensions (<strong>.com, .net, .org, .io, .co</strong>) and many country-code TLDs are supported via RDAP. Some older or less common ccTLDs only publish data through the legacy WHOIS system, which this tool does not query.",
  },
  {
    question: "What is a domain registrar?",
    answer:
      "A <strong>registrar</strong> is a company accredited to sell and manage domain name registrations. Common registrars include GoDaddy, Namecheap, and Google Domains. The registrar shown in the results is the current managing organisation for the domain.",
  },
  {
    question: "Why would I want to check a competitor's domain age?",
    answer:
      "Knowing a competitor's domain age helps you understand how long they have been building their online presence. A domain registered for 10 or more years typically has significant <strong>accumulated authority</strong>, which can inform how challenging a competitive niche may be.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is Domain Age?",
    content: `<p><strong>Domain age</strong> refers to how long a domain name has been registered and active on the internet. It is calculated from the original registration date recorded in the domain registry — not from when the website first went live.</p><p>A domain that was registered in 2005, for example, is considered 20 years old regardless of whether the website changed hands or redesigned multiple times. Domain age is a useful signal when evaluating the history and longevity of any website.</p>`,
  },
  {
    title: "Why Domain Age Matters for SEO",
    content: `<p>Search engines evaluate many signals when ranking pages. While domain age is not a direct ranking factor on its own, older domains often benefit from years of <strong>accumulated backlinks</strong>, brand mentions, and consistent content — all of which contribute to authority.</p><p>When buying a domain or entering a competitive niche, checking competitor domain ages helps you understand the existing trust gap. A brand-new domain competing against 15-year-old sites will need a strong content and link-building strategy to close that gap.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul><li><strong>Buying a domain:</strong> Before purchasing an aged domain, verify its registration history and original registration date.</li><li><strong>Competitor research:</strong> Understand how long established competitors have been building their online presence.</li><li><strong>Due diligence:</strong> When acquiring a website, confirm that the domain age matches what the seller claims.</li><li><strong>Spam detection:</strong> Very recently registered domains are often associated with spam or phishing. Checking age is a quick first-pass filter.</li></ul>`,
  },
];

export default function DomainAgeCheckerPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <DomainAgeChecker />
    </ToolContainer>
  );
}
