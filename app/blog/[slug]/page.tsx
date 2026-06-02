import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ARTICLES, getArticle } from "@/lib/blog/articles";
import { TOOLS } from "@/lib/tools/registry";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.description,
    authors: [{ name: "ToolMonk", url: "https://toolmonk.net" }],
    alternates: { canonical: `https://toolmonk.net/blog/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `https://toolmonk.net/blog/${article.slug}`,
      type: "article",
      publishedTime: article.publishedAt,
    },
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const otherArticles = ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3);
  const relatedTool = article.toolSlug ? TOOLS.find((t) => t.slug === article.toolSlug) : null;

  return (
    <div className="min-h-screen bg-surface">
      {/* Breadcrumb */}
      <div className="border-b border-border py-4 px-4">
        <div className="mx-auto w-full max-w-7xl">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 font-mono text-xs text-foreground-muted">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/blog" className="hover:text-foreground transition-colors">
                  blog
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-foreground truncate max-w-[200px]">{article.slug}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Main article */}
          <main className="lg:col-span-3">
            {/* Article header */}
            <header className="pb-8 border-b border-border mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-primary border border-primary px-1.5 py-0.5">
                  {article.category}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-mono text-foreground leading-tight mb-4">
                {article.title}
              </h1>
              <div className="flex items-center gap-4 font-mono text-[11px] text-foreground-muted">
                <time dateTime={article.publishedAt}>
                  {formatDate(article.publishedAt)}
                </time>
                <span aria-hidden="true">·</span>
                <span>{article.readingTime} min read</span>
              </div>
            </header>

            {/* Article body */}
            <article
              className={[
                "[&_h2]:text-xl [&_h2]:font-mono [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-4",
                "[&_p]:text-foreground-muted [&_p]:leading-relaxed [&_p]:mb-4",
                "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:text-foreground-muted",
                "[&_li]:mb-1 [&_strong]:text-foreground [&_code]:font-mono [&_code]:text-primary",
                "[&_pre]:bg-surface-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:mb-4",
              ].join(" ")}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Tool CTA */}
            {relatedTool && (
              <div className="mt-10 border border-primary p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] tracking-[0.15em] uppercase text-primary mb-1">
                    — try the tool
                  </p>
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    Put the concepts above into practice with our free online{" "}
                    <span className="text-foreground font-mono">{relatedTool.title}</span>.
                  </p>
                </div>
                <Link
                  href={relatedTool.path}
                  className="shrink-0 font-mono text-sm border border-primary text-primary px-4 py-2 hover:bg-primary hover:text-white transition-colors"
                >
                  Open tool →
                </Link>
              </div>
            )}
          </main>

          {/* Sidebar: more articles */}
          <aside className="lg:col-span-1" aria-label="More articles">
            <div className="sticky top-6">
              <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground-muted mb-4">
                — more articles
              </p>
              <ul className="space-y-4">
                {otherArticles.map((a) => (
                  <li key={a.slug}>
                    <Link
                      href={`/blog/${a.slug}`}
                      className="group block border border-border p-4 hover:border-primary transition-colors"
                    >
                      <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-foreground-muted block mb-1.5">
                        {a.category}
                      </span>
                      <span className="font-mono text-sm text-foreground group-hover:text-primary transition-colors leading-snug block mb-2">
                        {a.title}
                      </span>
                      <span className="font-mono text-[11px] text-foreground-muted">
                        {a.readingTime} min read
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <Link
                  href="/blog"
                  className="font-mono text-xs text-primary hover:underline"
                >
                  ← all articles
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
