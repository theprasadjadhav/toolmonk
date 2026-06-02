"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputCls, textareaCls } from "@/lib/utils/formStyles";

// ── Style tokens ───────────────────────────────────────────────────────────────

// ── Character counter chip ─────────────────────────────────────────────────────

function CharCount({ len, min, max }: { len: number; min: number; max: number }) {
  const color =
    len === 0       ? "text-foreground-muted/30"
    : len < min     ? "text-yellow-500/70"
    : len <= max    ? "text-green-500/70"
    : "text-red-500/70";
  return (
    <span className={cn("font-mono text-[10px]", color)}>
      {len} / {max}
    </span>
  );
}

// ── Copyable code block ────────────────────────────────────────────────────────

function CodeBlock({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className={labelCls}>{label}</span>
        <button
          onClick={copy}
          className={cn(
            "font-mono text-[10px] px-3 py-1 border border-border transition-colors",
            copied
              ? "text-primary border-primary/40 bg-primary/10"
              : "text-foreground-muted/80 hover:text-foreground",
          )}
        >
          {copied ? "copied!" : "copy"}
        </button>
      </div>
      <pre className="font-mono text-[11px] bg-surface-muted border border-border p-3 text-foreground/80 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
        {code}
      </pre>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export function MetaTagGenerator() {
  const [title,          setTitle]         = useState("");
  const [description,    setDescription]   = useState("");
  const [canonicalUrl,   setCanonicalUrl]  = useState("");
  const [siteName,       setSiteName]      = useState("");
  const [ogType,         setOgType]        = useState("website");
  const [ogImage,        setOgImage]       = useState("");
  const [twitterHandle,  setTwitterHandle] = useState("");
  const [copiedAll,      setCopiedAll]     = useState(false);

  const tags = useMemo(() => {
    const t   = title.trim();
    const d   = description.trim();
    const url = canonicalUrl.trim();
    const sn  = siteName.trim();
    const img = ogImage.trim();
    const tw  = twitterHandle.trim().replace(/^@/, "");

    const basic: string[] = [];
    if (t)   basic.push(`<title>${t}</title>`);
    if (d)   basic.push(`<meta name="description" content="${d}">`);
    if (url) basic.push(`<link rel="canonical" href="${url}">`);

    const og: string[] = [];
    if (t)   og.push(`<meta property="og:title" content="${t}">`);
    if (d)   og.push(`<meta property="og:description" content="${d}">`);
    if (url) og.push(`<meta property="og:url" content="${url}">`);
    og.push(`<meta property="og:type" content="${ogType}">`);
    if (sn)  og.push(`<meta property="og:site_name" content="${sn}">`);
    if (img) og.push(`<meta property="og:image" content="${img}">`);

    const twitter: string[] = [];
    twitter.push(`<meta name="twitter:card" content="${img ? "summary_large_image" : "summary"}">`);
    if (t)   twitter.push(`<meta name="twitter:title" content="${t}">`);
    if (d)   twitter.push(`<meta name="twitter:description" content="${d}">`);
    if (img) twitter.push(`<meta name="twitter:image" content="${img}">`);
    if (tw)  twitter.push(`<meta name="twitter:site" content="@${tw}">`);

    return { basic, og, twitter };
  }, [title, description, canonicalUrl, siteName, ogType, ogImage, twitterHandle]);

  const allCode = [...tags.basic, "", ...tags.og, "", ...tags.twitter].join("\n");
  const hasAny  = title.trim() || description.trim();

  const copyAll = () => {
    navigator.clipboard.writeText(allCode);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  };

  return (
    <div className="space-y-6">

      {/* ── Inputs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Title */}
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className={cn(labelCls, "mb-0")}>
              — page title <span className="text-foreground-muted/40 normal-case">(50–60 chars recommended)</span>
            </label>
            <CharCount len={title.length} min={50} max={60} />
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Awesome Page Title"
            className={cn(inputCls, title.length > 60 && "border-red-500/40")}
          />
          {title.length > 60 && (
            <p className="font-mono text-[10px] text-red-500/70 mt-1">
              Title exceeds 60 characters — search engines may truncate it
            </p>
          )}
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className={cn(labelCls, "mb-0")}>
              — meta description <span className="text-foreground-muted/40 normal-case">(150–160 chars recommended)</span>
            </label>
            <CharCount len={description.length} min={150} max={160} />
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A concise summary of this page for search engines and social sharing…"
            rows={3}
            className={cn(textareaCls, description.length > 160 && "border-red-500/40")}
          />
          {description.length > 160 && (
            <p className="font-mono text-[10px] text-red-500/70 mt-1">
              Description exceeds 160 characters — search engines may truncate it
            </p>
          )}
        </div>

        {/* Canonical URL */}
        <div>
          <label className={labelCls}>— canonical URL</label>
          <input
            type="url"
            value={canonicalUrl}
            onChange={(e) => setCanonicalUrl(e.target.value)}
            placeholder="https://example.com/page"
            className={inputCls}
          />
        </div>

        {/* Site name */}
        <div>
          <label className={labelCls}>— site name</label>
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="My Website"
            className={inputCls}
          />
        </div>

        {/* OG type */}
        <div>
          <label className={labelCls}>— page type</label>
          <select
            value={ogType}
            onChange={(e) => setOgType(e.target.value)}
            className={cn(inputCls, "cursor-pointer")}
          >
            {["website", "article", "product", "profile", "book"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* OG image */}
        <div>
          <label className={labelCls}>— OG image URL</label>
          <input
            type="url"
            value={ogImage}
            onChange={(e) => setOgImage(e.target.value)}
            placeholder="https://example.com/og-image.jpg"
            className={inputCls}
          />
        </div>

        {/* Twitter handle */}
        <div>
          <label className={labelCls}>— twitter handle (optional)</label>
          <input
            type="text"
            value={twitterHandle}
            onChange={(e) => setTwitterHandle(e.target.value)}
            placeholder="@youraccount"
            className={inputCls}
          />
        </div>
      </div>

      {/* ── Generated code ── */}
      {hasAny && (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-t border-border pt-5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">
              — generated tags
            </p>
            <button
              onClick={copyAll}
              className={cn(
                "font-mono text-[11px] uppercase tracking-wider px-4 py-2 border transition-colors",
                copiedAll
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-foreground-muted text-foreground hover:border-primary/40 hover:text-primary",
              )}
            >
              {copiedAll ? "copied!" : "copy all"}
            </button>
          </div>

          {tags.basic.length > 0 && (
            <CodeBlock code={tags.basic.join("\n")} label="— basic tags" />
          )}
          {tags.og.length > 0 && (
            <CodeBlock code={tags.og.join("\n")} label="— open graph" />
          )}
          {tags.twitter.length > 0 && (
            <CodeBlock code={tags.twitter.join("\n")} label="— twitter card" />
          )}
        </div>
      )}

    </div>
  );
}
