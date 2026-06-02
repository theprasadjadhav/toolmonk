"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputCls } from "@/lib/utils/formStyles";

function generateSlug(text: string, separator: "-" | "_"): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s-_]/g, "")     // remove non-alphanumeric
    .trim()
    .replace(/[\s-_]+/g, separator);   // collapse whitespace/separators
}

export function SlugGenerator() {
  const [input, setInput]         = useState("");
  const [separator, setSeparator] = useState<"-" | "_">("-");
  const [copied, setCopied]       = useState(false);

  const slug = useMemo(() => generateSlug(input, separator), [input, separator]);

  const handleCopy = useCallback(() => {
    if (!slug) return;
    navigator.clipboard.writeText(slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [slug]);

  return (
    <div className="space-y-5">

      {/* Input */}
      <div>
        <label className={labelCls}>— title or phrase</label>
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setCopied(false); }}
          placeholder="e.g. My Blog Post Title — 2024"
          className={inputCls}
        />
      </div>

      {/* Separator */}
      <div>
        <label className={labelCls}>— word separator</label>
        <div className="flex gap-2">
          {(["-", "_"] as const).map((sep) => (
            <button
              key={sep}
              onClick={() => setSeparator(sep)}
              className={cn(
                "font-mono text-[11px] px-6 py-2.5 border transition-colors",
                separator === sep
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border text-foreground-muted hover:text-foreground",
              )}
            >
              {sep === "-" ? "hyphen ( - )" : "underscore ( _ )"}
            </button>
          ))}
        </div>
      </div>

      {/* Output */}
      <div>
        <label className={labelCls}>— slug</label>
        <div className="flex gap-2">
          <input
            readOnly
            value={slug}
            placeholder="slug-will-appear-here"
            className={cn(inputCls, "flex-1 text-foreground/80 cursor-default")}
          />
          <button
            onClick={handleCopy}
            disabled={!slug}
            className={cn(
              "font-mono text-[11px] px-4 border transition-colors shrink-0 disabled:opacity-30 disabled:cursor-not-allowed",
              copied
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border text-foreground-muted hover:text-foreground",
            )}
          >
            {copied ? "copied!" : "copy"}
          </button>
        </div>
        {slug && (
          <p className="font-mono text-[10px] text-foreground-muted/40 mt-1">
            {slug.length} characters
          </p>
        )}
      </div>

    </div>
  );
}
