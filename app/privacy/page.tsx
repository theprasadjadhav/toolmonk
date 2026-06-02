import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — ToolMonk",
  description:
    "ToolMonk privacy policy. Most tools run entirely in your browser. The few that require server processing delete your data immediately after responding.",
  alternates: { canonical: "https://toolmonk.net/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="border-b border-border py-4 px-4">
        <div className="mx-auto w-full max-w-7xl">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-foreground-muted">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  home
                </Link>
              </li>
              <li className="flex items-center gap-1.5">
                <span aria-hidden="true" className="text-border select-none">/</span>
                <span className="text-foreground font-medium" aria-current="page">
                  privacy
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground-muted mb-6">
          — Legal
        </p>
        <h1 className="text-2xl font-mono text-foreground mb-3">Privacy Policy</h1>
        <p className="font-mono text-[11px] tracking-wider text-foreground-muted mb-12">
          Last updated April 2026
        </p>

        <h2 className="text-lg font-mono text-foreground mt-10 mb-4">How tools work</h2>

        {/* Browser-based */}
        <div className="mb-5">
          <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-foreground-muted mb-2">
            Most tools — fully in your browser
          </p>
          <p className="text-foreground-muted leading-relaxed">
            The vast majority of ToolMonk tools work entirely within your browser. Any text,
            numbers, images, or files you provide are processed on your own device.{" "}
            <strong className="text-foreground">Nothing is sent to our servers.</strong> Closing
            the tab discards everything instantly.
          </p>
        </div>

        {/* Server-processed */}
        <div className="border border-border p-5 space-y-3">
          <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-foreground-muted">
            A few tools contact our server
          </p>
          <p className="text-foreground-muted leading-relaxed text-sm">
            Four tools cannot perform their operation entirely in the browser and need to send your
            data to our server:
          </p>
          <ul className="space-y-1.5 text-sm text-foreground-muted">
            {[
              "File Converter — converts documents between formats",
              "Domain Age Checker — looks up domain registration info (domain name only, no file upload)",
              "PDF Lock — adds password protection to a PDF",
              "PDF Unlock — removes password protection from a PDF",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="font-mono text-primary shrink-0 mt-0.5">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-border pt-3 mt-1">
            <p className="text-sm text-foreground-muted leading-relaxed">
              For these tools, your file or input is sent securely to our server, the operation is
              performed, and the result is returned to your browser.{" "}
              <strong className="text-foreground">
                Your data is deleted from our server immediately after the response is sent.
              </strong>{" "}
              We do not store, read, or share the contents of any uploaded file or input.
            </p>
          </div>
        </div>

        <h2 className="text-lg font-mono text-foreground mt-10 mb-4">Information we collect</h2>
        <p className="text-foreground-muted leading-relaxed">
          We do not collect personally identifiable information. We use Google Analytics to collect
          anonymous usage data (page views, referrer, device type). We serve Google AdSense ads
          which may use cookies to personalise ad content.
        </p>

        <h2 className="text-lg font-mono text-foreground mt-10 mb-4">Cookies</h2>
        <p className="text-foreground-muted leading-relaxed">
          Google Analytics and Google AdSense use cookies to measure site usage and serve relevant
          ads. ToolMonk itself does not set any cookies. You can opt out via your browser settings
          or through{" "}
          <a
            href="https://adssettings.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-primary transition-colors font-mono text-sm"
          >
            Google&apos;s ad settings
          </a>
          .
        </p>

        <h2 className="text-lg font-mono text-foreground mt-10 mb-4">Third-party services</h2>
        <p className="text-foreground-muted leading-relaxed mb-4">
          ToolMonk uses the following third-party services which have their own privacy policies:
        </p>
        <ul className="space-y-2">
          {[
            {
              name: "Google Analytics",
              href: "https://policies.google.com/privacy",
            },
            {
              name: "Google AdSense",
              href: "https://policies.google.com/technologies/ads",
            },
          ].map(({ name, href }) => (
            <li key={name}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-foreground-muted hover:text-primary transition-colors"
              >
                {name} &rarr;
              </a>
            </li>
          ))}
        </ul>

        <h2 className="text-lg font-mono text-foreground mt-10 mb-4">Changes</h2>
        <p className="text-foreground-muted leading-relaxed">
          We may update this policy from time to time. Changes will be posted on this page with an
          updated date.
        </p>

        <h2 className="text-lg font-mono text-foreground mt-10 mb-4">Contact</h2>
        <p className="text-foreground-muted leading-relaxed">
          Questions about this policy? Email us at{" "}
          <a
            href="mailto:privacy@toolmonk.net"
            className="text-foreground hover:text-primary transition-colors font-mono text-sm"
          >
            privacy@toolmonk.net
          </a>
          .
        </p>
      </div>
    </div>
  );
}
