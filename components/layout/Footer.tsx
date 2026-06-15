import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@/lib/tools/registry";
import { getCategoryIcon } from "@/components/icons";
import { BRAND_NAME, BRAND_DESCRIPTION, LOGO_PATH } from "@/lib/brand";

export function Footer() {
  const year = new Date().getFullYear();
  const col1 = CATEGORIES.slice(0, 4);
  const col2 = CATEGORIES.slice(4, 9);
  const col3 = CATEGORIES.slice(9);

  return (
    <footer className="border-t border-border mt-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3 mb-5"
              aria-label={`${BRAND_NAME} home`}
            >
              <Image src={LOGO_PATH} alt={BRAND_NAME} width={25} height={25} className="shrink-0" priority unoptimized />
              <span className="font-mono text-base text-foreground leading-none">
                {BRAND_NAME}
              </span>
            </Link>
            <p className="font-mono text-sm text-foreground-muted leading-relaxed">
              {BRAND_DESCRIPTION}
            </p>
          </div>

          {/* Category columns */}
          {[col1, col2, col3].map((group, i) => (
            <div key={i}>
              <ul className="space-y-2.5">
                {group.map((cat) => {
                  const Icon = getCategoryIcon(cat.slug);
                  return (
                    <li key={cat.slug}>
                      <Link
                        href={cat.path}
                        className="font-mono flex items-center gap-2 text-sm text-foreground-muted hover:text-primary transition-colors"
                      >
                        <Icon size={13} />                        
                        <p>{cat.title}</p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-mono text-[11px] text-foreground-muted tracking-wider">
            © {year} {BRAND_NAME}. All rights reserved.
          </p>
          <nav
            aria-label="Footer legal links"
            className="flex items-center gap-6"
          >
            {[
              { href: "/blog", label: "blog" },
              { href: "/compare", label: "compare" },
              { href: "/about", label: "about" },
              { href: "/privacy", label: "privacy" },
              { href: "/terms", label: "terms" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-mono text-[11px] tracking-wider text-foreground-muted hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
