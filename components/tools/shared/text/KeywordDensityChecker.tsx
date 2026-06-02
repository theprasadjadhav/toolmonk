"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputCls, textareaCls, errCls } from "@/lib/utils/formStyles";

// ── Common English stop words ──────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with","by","from",
  "up","about","into","through","during","before","after","above","below","between",
  "is","are","was","were","be","been","being","have","has","had","do","does","did",
  "will","would","could","should","may","might","can","shall","must","need",
  "i","you","he","she","it","we","they","me","him","her","us","them","my","your",
  "his","its","our","their","this","that","these","those","what","which","who","whom",
  "not","no","so","if","as","than","too","very","just","also","more","most","other",
  "some","such","only","own","same","both","all","any","each","few","more","nor",
]);

export function KeywordDensityChecker() {
  const [text,           setText]          = useState("");
  const [minLength,      setMinLength]      = useState("3");
  const [ignoreStopWords, setIgnoreStopWords] = useState(true);
  const [topN,           setTopN]          = useState("20");

  const minLen = Math.max(1, parseInt(minLength, 10) || 3);
  const topNNum = Math.min(100, Math.max(1, parseInt(topN, 10) || 20));

  const minLenErr =
    minLength.trim() === "" ? "Required"
    : isNaN(parseInt(minLength, 10)) || parseInt(minLength, 10) < 1 ? "Min 1"
    : parseInt(minLength, 10) > 20 ? "Max 20"
    : "";

  const { keywords, totalWords } = useMemo(() => {
    if (!text.trim()) return { keywords: [], totalWords: 0 };

    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s'-]/g, " ")
      .split(/\s+/)
      .map((w) => w.replace(/^['-]+|['-]+$/g, ""))
      .filter((w) => w.length >= minLen);

    const filtered = ignoreStopWords ? words.filter((w) => !STOP_WORDS.has(w)) : words;
    const total = filtered.length;

    const freq: Record<string, number> = {};
    for (const w of filtered) freq[w] = (freq[w] || 0) + 1;

    const sorted = Object.entries(freq)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, topNNum)
      .map(([word, count]) => ({
        word,
        count,
        pct: total > 0 ? ((count / total) * 100).toFixed(2) : "0.00",
        barWidth: 0,
      }));

    // Normalise bar widths
    const maxCount = sorted[0]?.count ?? 1;
    sorted.forEach((k) => { k.barWidth = Math.round((k.count / maxCount) * 100); });

    return { keywords: sorted, totalWords: total };
  }, [text, minLen, ignoreStopWords, topNNum]);

  return (
    <div className="space-y-5">

      {/* Text input */}
      <div>
        <label className={labelCls}>— paste your content</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your page content or article here…"
          rows={7}
          className={textareaCls}
        />
        {text.trim() && (
          <p className="font-mono text-[10px] text-foreground-muted/40 mt-1">
            {totalWords.toLocaleString()} word{totalWords !== 1 ? "s" : ""} analysed
          </p>
        )}
      </div>

      {/* Options */}
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="w-full">
          <label className={labelCls}>— min word length <span className="normal-case text-foreground-muted/40">(1–20)</span></label>
          <input
            type="number"
            value={minLength}
            min={1} max={20}
            onChange={(e) => setMinLength(e.target.value)}
            className={cn(inputCls, minLenErr && "border-red-500/40")}
          />
          {minLenErr && <p className={errCls}>{minLenErr}</p>}
        </div>
        <div className="w-full">
          <label className={labelCls}>— top results <span className="normal-case text-foreground-muted/40">(1–100)</span></label>
          <input
            type="number"
            value={topN}
            min={1} max={100}
            onChange={(e) => setTopN(e.target.value)}
            className={cn(inputCls)}
          />
        </div>
        <div className=" w-full flex flex-col justify-end">
          <label className={labelCls}>— options</label>
          <button
            onClick={() => setIgnoreStopWords((v) => !v)}
            className={cn(
              "font-mono text-[10px] px-3 py-3 border transition-colors",
              ignoreStopWords
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border text-foreground-muted hover:text-foreground",
            )}
          >
            Ignore common words
          </button>
        </div>
      </div>

      {/* Results */}
      {keywords.length > 0 && (
        <div className="space-y-1">
          <p className={labelCls}>— keyword density</p>
          <div className="border border-border divide-y divide-border overflow-x-auto">
            {/* Header */}
            <div className="flex items-center bg-surface-muted">
              <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/50 px-4 py-2 w-8 shrink-0 border-r border-border">#</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/50 px-4 py-2 flex-1 border-r border-border">Keyword</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/50 px-4 py-2 w-16 text-center shrink-0 border-r border-border">Count</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/50 px-4 py-2 w-20 text-center shrink-0 border-r border-border">Density</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/50 px-4 py-2 flex-1 hidden sm:block">Frequency</span>
            </div>
            {keywords.map((kw, i) => (
              <div key={kw.word} className="flex items-center bg-surface hover:bg-surface-muted transition-colors">
                <span className="font-mono text-[10px] text-foreground-muted/40 px-4 py-2.5 w-8 shrink-0 border-r border-border">{i + 1}</span>
                <span className="font-mono text-sm text-foreground px-4 py-2.5 flex-1 border-r border-border">{kw.word}</span>
                <span className="font-mono text-sm text-foreground/80 px-4 py-2.5 w-16 text-center shrink-0 border-r border-border">{kw.count}</span>
                <span className="font-mono text-sm text-foreground/80 px-4 py-2.5 w-20 text-center shrink-0 border-r border-border">{kw.pct}%</span>
                <div className="hidden sm:flex items-center px-4 py-2.5 flex-1">
                  <div className="w-full h-1.5 bg-surface-muted border border-border overflow-hidden">
                    <div
                      className="h-full bg-primary/60 transition-all duration-300"
                      style={{ width: `${kw.barWidth}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {text.trim() && keywords.length === 0 && (
        <p className="font-mono text-[10px] text-foreground-muted/40">
          No keywords found with the current settings.
        </p>
      )}
    </div>
  );
}
