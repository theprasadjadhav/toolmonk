"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputCls, textareaCls } from "@/lib/utils/formStyles";

const FREQS = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"] as const;
type Freq = (typeof FREQS)[number];

const PRIORITIES = ["1.0", "0.9", "0.8", "0.7", "0.6", "0.5", "0.4", "0.3", "0.2", "0.1"] as const;

function isValidUrl(s: string): boolean {
  try { new URL(s); return true; } catch { return false; }
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function SitemapGenerator() {
  const [rawUrls,       setRawUrls]      = useState("");
  const [changefreq,    setChangefreq]   = useState<Freq>("weekly");
  const [priority,      setPriority]     = useState("0.8");
  const [includeLastmod, setIncludeLastmod] = useState(true);
  const [copied,        setCopied]       = useState(false);

  const { validUrls, invalidCount } = useMemo(() => {
    const lines = rawUrls.split("\n").map((l) => l.trim()).filter(Boolean);
    const valid   = lines.filter(isValidUrl);
    const invalid = lines.length - valid.length;
    return { validUrls: valid, invalidCount: invalid };
  }, [rawUrls]);

  const xml = useMemo(() => {
    if (!validUrls.length) return "";
    const today = todayISO();
    const urlEntries = validUrls.map((url) => {
      const parts = [`  <url>`, `    <loc>${escapeXml(url)}</loc>`];
      if (includeLastmod) parts.push(`    <lastmod>${today}</lastmod>`);
      parts.push(`    <changefreq>${changefreq}</changefreq>`);
      parts.push(`    <priority>${priority}</priority>`);
      parts.push(`  </url>`);
      return parts.join("\n");
    });
    return [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
      ...urlEntries,
      `</urlset>`,
    ].join("\n");
  }, [validUrls, changefreq, priority, includeLastmod]);

  const handleCopy = useCallback(() => {
    if (!xml) return;
    navigator.clipboard.writeText(xml);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [xml]);

  const handleDownload = useCallback(() => {
    if (!xml) return;
    const blob = new Blob([xml], { type: "application/xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "sitemap.xml";
    a.click();
    URL.revokeObjectURL(a.href);
  }, [xml]);

  return (
    <div className="space-y-5">

      {/* URL input */}
      <div>
        <label className={labelCls}>— urls (one per line)</label>
        <textarea
          value={rawUrls}
          onChange={(e) => { setRawUrls(e.target.value); setCopied(false); }}
          placeholder={"https://example.com/\nhttps://example.com/about\nhttps://example.com/contact"}
          rows={7}
          className={textareaCls}
        />
        {rawUrls.trim() && (
          <div className="flex gap-4 mt-1">
            <p className="font-mono text-[10px] text-green-500/70">
              {validUrls.length} valid URL{validUrls.length !== 1 ? "s" : ""}
            </p>
            {invalidCount > 0 && (
              <p className="font-mono text-[10px] text-red-500/70">
                {invalidCount} invalid (skipped)
              </p>
            )}
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>— change frequency</label>
          <select
            value={changefreq}
            onChange={(e) => setChangefreq(e.target.value as Freq)}
            className={cn(inputCls, "cursor-pointer")}
          >
            {FREQS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>— priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className={cn(inputCls, "cursor-pointer")}
          >
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex flex-col justify-end">
          <label className={labelCls}>— options</label>
          <button
            onClick={() => setIncludeLastmod((v) => !v)}
            className={cn(
              "font-mono text-[10px] px-3 py-3 mb-1 border transition-colors text-left",
              includeLastmod
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border text-foreground-muted hover:text-foreground",
            )}
          >
            Include &lt;lastmod&gt; (today)
          </button>
        </div>
      </div>

      {/* Output */}
      {xml && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className={labelCls}>— sitemap.xml preview</p>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className={cn(
                  "font-mono text-[10px] px-3 py-1 border border-border transition-colors",
                  copied
                    ? "text-primary border-primary/40 bg-primary/10"
                    : "text-foreground-muted/80 hover:text-foreground",
                )}
              >
                {copied ? "copied!" : "copy"}
              </button>
              <button
                onClick={handleDownload}
                className="font-mono text-[10px] px-3 py-1 border border-border text-foreground-muted/80 hover:text-foreground transition-colors"
              >
                ↓ download
              </button>
            </div>
          </div>
          <pre className="font-mono text-[11px] bg-surface-muted border border-border p-4 text-foreground/80 overflow-x-auto whitespace-pre max-h-80 leading-relaxed">
            {xml}
          </pre>
        </div>
      )}

    </div>
  );
}
