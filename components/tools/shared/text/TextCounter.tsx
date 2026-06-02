"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { useCopyState } from "@/lib/hooks/useCopyState";
import { CopyButton } from "@/components/ui/CopyButton";

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtTime(words: number): string {
  const mins = Math.ceil(words / 200);
  if (mins < 1) return "< 1 min";
  if (mins === 1) return "1 min";
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

function fmtNum(n: number): string {
  return n.toLocaleString("en-US");
}

// ── Types ──────────────────────────────────────────────────────────────────────

export type TextCounterHighlight =
  | "words"
  | "chars"
  | "charsNoSpaces"
  | "lines"
  | "emptyLines"
  | "uniqueLines"
  | "sentences"
  | "paragraphs"
  | "uniqueWords"
  | "readingTime"
  | "avgWordLength";

export interface TextCounterProps {
  highlight: TextCounterHighlight;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function TextCounter({ highlight }: TextCounterProps) {
  const [text, setText] = useState("");
  const { copied, copy } = useCopyState();

  const stats = useMemo(() => {
    const raw = text;
    const lines = raw.split("\n");
    const totalLines = lines.length;
    const emptyLines = lines.filter((l) => l.trim() === "").length;
    const uniqueLines = new Set(lines.map((l) => l.trim())).size;

    const wordsArr = raw.trim() === "" ? [] : raw.trim().split(/\s+/).filter(Boolean);
    const wordCount = wordsArr.length;
    const chars = raw.length;
    const charsNoSpaces = raw.replace(/\s/g, "").length;

    const sentences = raw.trim() === "" ? 0 : (raw.match(/[^.!?]*[.!?]+/g) ?? []).length || (raw.trim().length > 0 ? 1 : 0);
    const paragraphs = raw.trim() === "" ? 0 : raw.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;

    const uniqueWords = new Set(wordsArr.map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ""))).size;
    const avgWordLength =
      wordCount > 0
        ? wordsArr.reduce((acc, w) => acc + w.replace(/[^a-zA-Z0-9]/g, "").length, 0) / wordCount
        : 0;

    return {
      words:        { display: fmtNum(wordCount),    raw: wordCount },
      chars:        { display: fmtNum(chars),         raw: chars },
      charsNoSpaces:{ display: fmtNum(charsNoSpaces), raw: charsNoSpaces },
      lines:        { display: fmtNum(totalLines),    raw: totalLines },
      emptyLines:   { display: fmtNum(emptyLines),    raw: emptyLines },
      uniqueLines:  { display: fmtNum(uniqueLines),   raw: uniqueLines },
      sentences:    { display: fmtNum(sentences),     raw: sentences },
      paragraphs:   { display: fmtNum(paragraphs),    raw: paragraphs },
      uniqueWords:  { display: fmtNum(uniqueWords),   raw: uniqueWords },
      readingTime:  { display: fmtTime(wordCount),    raw: wordCount },
      avgWordLength:{ display: avgWordLength > 0 ? avgWordLength.toFixed(1) : "—", raw: avgWordLength },
    };
  }, [text]);

  const hasText = text.trim().length > 0;

  const ALL_ROWS: { key: TextCounterHighlight; label: string }[] = [
    { key: "words",         label: "Words" },
    { key: "chars",         label: "Characters" },
    { key: "charsNoSpaces", label: "Chars (no spaces)" },
    { key: "lines",         label: "Lines" },
    { key: "emptyLines",    label: "Empty lines" },
    { key: "uniqueLines",   label: "Unique lines" },
    { key: "sentences",     label: "Sentences" },
    { key: "paragraphs",    label: "Paragraphs" },
    { key: "uniqueWords",   label: "Unique words" },
    { key: "readingTime",   label: "Reading time" },
    { key: "avgWordLength", label: "Avg word length" },
  ];

  const ROWS = [
    ...ALL_ROWS.filter((r) => r.key === highlight),
    ...ALL_ROWS.filter((r) => r.key !== highlight),
  ];

  return (
    <div className="space-y-5">

      {/* Input */}
      <div className="space-y-1.5">
        <label className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">
          — paste or type your text
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your text here…"
          rows={6}
          className="w-full font-mono text-sm bg-surface-muted border border-border px-3 py-2.5 text-foreground outline-none focus:border-foreground-muted resize-y"
        />
        {text.length > 0 && (
          <p className="font-mono text-[10px] text-foreground-muted/40">
            {fmtNum(text.length)} character{text.length !== 1 ? "s" : ""} entered
          </p>
        )}
      </div>

      {/* Results table */}
      <div className="space-y-1">
        <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— results</p>
        <div className="border border-border divide-y divide-border">
          {ROWS.map(({ key, label }) => {
            const stat = stats[key];
            const val = stat.display;
            const isHighlighted = key === highlight;
            return (
              <div key={key} className="flex items-center bg-surface">
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-wider px-4 py-2.5 w-36 sm:w-44 shrink-0 border-r border-border",
                    isHighlighted ? "text-primary" : "text-foreground-muted/80",
                  )}
                >
                  {label}
                </span>
                <span
                  className={cn(
                    "font-mono px-4 py-2.5 flex-1",
                    isHighlighted ? "text-sm text-primary" : "text-sm text-foreground/80",
                    !hasText && "text-foreground-muted/25",
                  )}
                >
                  {hasText ? val : "—"}
                </span>
                <CopyButton
                  copied={copied === key}
                  onClick={() => hasText && copy(key, val)}
                  className={cn("mx-2", !hasText && "opacity-20 pointer-events-none")}
                />
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
