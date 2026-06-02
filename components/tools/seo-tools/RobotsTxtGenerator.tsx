"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputCls, textareaCls } from "@/lib/utils/formStyles";

// ── Types ──────────────────────────────────────────────────────────────────────

interface RuleBlock {
  id: number;
  userAgent: string;
  customAgent: string;
  disallow: string;
  allow: string;
  crawlDelay: string;
}

const AGENTS = ["*", "Googlebot", "Bingbot", "Slurp", "DuckDuckBot", "Baiduspider", "Custom"];

// ── Style tokens ───────────────────────────────────────────────────────────────

let nextId = 1;

// ── Component ──────────────────────────────────────────────────────────────────

export function RobotsTxtGenerator() {
  const [rules, setRules] = useState<RuleBlock[]>([
    { id: nextId++, userAgent: "*", customAgent: "", disallow: "/admin/\n/private/", allow: "", crawlDelay: "" },
  ]);
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [copied, setCopied]         = useState(false);

  const addRule = () =>
    setRules((prev) => [
      ...prev,
      { id: nextId++, userAgent: "*", customAgent: "", disallow: "", allow: "", crawlDelay: "" },
    ]);

  const removeRule = (id: number) =>
    setRules((prev) => prev.filter((r) => r.id !== id));

  const updateRule = useCallback(
    <K extends keyof RuleBlock>(id: number, field: K, value: RuleBlock[K]) =>
      setRules((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))),
    [],
  );

  const output = useMemo(() => {
    const lines: string[] = [];
    for (const rule of rules) {
      const agent = rule.userAgent === "Custom" ? rule.customAgent.trim() || "*" : rule.userAgent;
      lines.push(`User-agent: ${agent}`);
      rule.allow
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .forEach((p) => lines.push(`Allow: ${p}`));
      rule.disallow
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .forEach((p) => lines.push(`Disallow: ${p}`));
      if (rule.crawlDelay.trim()) lines.push(`Crawl-delay: ${rule.crawlDelay.trim()}`);
      lines.push("");
    }
    if (sitemapUrl.trim()) lines.push(`Sitemap: ${sitemapUrl.trim()}`);
    return lines.join("\n").trimEnd();
  }, [rules, sitemapUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "robots.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-6">

      {/* ── Rule blocks ── */}
      <div className="space-y-4">
        <p className={labelCls}>— crawler rules</p>
        {rules.map((rule, idx) => (
          <div key={rule.id} className="border border-border bg-surface p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/50">
                Rule {idx + 1}
              </span>
              {rules.length > 1 && (
                <button
                  onClick={() => removeRule(rule.id)}
                  className="font-mono text-[10px] text-foreground-muted/50 hover:text-red-500/70 transition-colors"
                >
                  ✕ remove
                </button>
              )}
            </div>

            {/* User-agent */}
            <div>
              <label className={labelCls}>— user-agent</label>
              <select
                value={rule.userAgent}
                onChange={(e) => updateRule(rule.id, "userAgent", e.target.value)}
                className={cn(inputCls, "cursor-pointer")}
              >
                {AGENTS.map((a) => <option key={a} value={a}>{a === "*" ? "* (all robots)" : a}</option>)}
              </select>
            </div>
            {rule.userAgent === "Custom" && (
              <div>
                <label className={labelCls}>— custom user-agent</label>
                <input
                  type="text"
                  value={rule.customAgent}
                  onChange={(e) => updateRule(rule.id, "customAgent", e.target.value)}
                  placeholder="MyBot"
                  className={inputCls}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Disallow */}
              <div>
                <label className={labelCls}>— disallow paths (one per line)</label>
                <textarea
                  rows={3}
                  value={rule.disallow}
                  onChange={(e) => updateRule(rule.id, "disallow", e.target.value)}
                  placeholder="/admin/&#10;/private/"
                  className={textareaCls}
                />
              </div>
              {/* Allow */}
              <div>
                <label className={labelCls}>— allow paths (one per line)</label>
                <textarea
                  rows={3}
                  value={rule.allow}
                  onChange={(e) => updateRule(rule.id, "allow", e.target.value)}
                  placeholder="/public/"
                  className={textareaCls}
                />
              </div>
            </div>

            {/* Crawl delay */}
            <div className="w-32">
              <label className={labelCls}>— crawl delay (s)</label>
              <input
                type="number"
                min="0"
                value={rule.crawlDelay}
                onChange={(e) => updateRule(rule.id, "crawlDelay", e.target.value)}
                placeholder="—"
                className={inputCls}
              />
            </div>
          </div>
        ))}

        <button
          onClick={addRule}
          className="font-mono text-[11px] uppercase tracking-wider px-4 py-2.5 border border-dashed border-border text-foreground-muted hover:text-foreground hover:border-foreground-muted transition-colors w-full"
        >
          + add rule block
        </button>
      </div>

      {/* Sitemap URL */}
      <div>
        <label className={labelCls}>— sitemap URL (optional)</label>
        <input
          type="url"
          value={sitemapUrl}
          onChange={(e) => setSitemapUrl(e.target.value)}
          placeholder="https://example.com/sitemap.xml"
          className={inputCls}
        />
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className={labelCls}>— preview</p>
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
        <pre className="font-mono text-[12px] bg-surface-muted border border-border p-4 text-foreground/80 overflow-x-auto whitespace-pre leading-relaxed">
          {output || "# Preview will appear here"}
        </pre>
      </div>

    </div>
  );
}
