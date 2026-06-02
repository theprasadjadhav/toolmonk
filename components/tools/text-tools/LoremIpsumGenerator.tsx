"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputBaseCls, textareaCls, errCls } from "@/lib/utils/formStyles";

// ── Lorem corpus ───────────────────────────────────────────────────────────────

const WORDS = [
  "lorem","ipsum","dolor","sit","amet","consectetur","adipiscing","elit","sed","do",
  "eiusmod","tempor","incididunt","ut","labore","et","dolore","magna","aliqua","enim",
  "ad","minim","veniam","quis","nostrud","exercitation","ullamco","laboris","nisi",
  "aliquip","ex","ea","commodo","consequat","duis","aute","irure","in","reprehenderit",
  "voluptate","velit","esse","cillum","fugiat","nulla","pariatur","excepteur","sint",
  "occaecat","cupidatat","non","proident","sunt","culpa","qui","officia","deserunt",
  "mollit","anim","id","est","laborum","perspiciatis","unde","omnis","iste","natus",
  "error","accusantium","doloremque","laudantium","totam","rem","aperiam","eaque",
  "inventore","veritatis","architecto","beatae","vitae","dicta","explicabo","nemo",
  "ipsam","quia","voluptas","aspernatur","odit","fugit","consequatur","magni",
  "quaerat","numquam","eius","modi","tempora","incidunt","magnam","quaerat",
  "aliquam","quaerat","velit","dolorum","fuga","harum","quidem","rerum","facilis",
];

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateWords(n: number): string {
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(WORDS[randInt(0, WORDS.length - 1)]);
  if (out.length > 0) out[0] = out[0].charAt(0).toUpperCase() + out[0].slice(1);
  return out.join(" ");
}

function generateSentences(n: number): string {
  const sentences: string[] = [];
  for (let i = 0; i < n; i++) {
    const wc = randInt(8, 18);
    sentences.push(generateWords(wc) + ".");
  }
  return sentences.join(" ");
}

function generateParagraphs(n: number): string {
  const paras: string[] = [];
  for (let i = 0; i < n; i++) {
    const sc = randInt(3, 6);
    paras.push(generateSentences(sc));
  }
  return paras.join("\n\n");
}

// ── Validation ────────────────────────────────────────────────────────────────

const LIMITS: Record<string, { min: number; max: number; label: string }> = {
  words:      { min: 1,  max: 500,  label: "1–500" },
  sentences:  { min: 1,  max: 100,  label: "1–100" },
  paragraphs: { min: 1,  max: 20,   label: "1–20"  },
};

type GenMode = "words" | "sentences" | "paragraphs";

const MODES: { key: GenMode; label: string }[] = [
  { key: "words",      label: "Words" },
  { key: "sentences",  label: "Sentences" },
  { key: "paragraphs", label: "Paragraphs" },
];

export function LoremIpsumGenerator() {
  const [mode, setMode]       = useState<GenMode>("paragraphs");
  const [rawCount, setRawCount] = useState("3");
  const [output, setOutput]   = useState("");
  const [copied, setCopied]   = useState(false);

  const { min, max, label: limitLabel } = LIMITS[mode];
  const count = parseInt(rawCount, 10);
  const countErr =
    rawCount.trim() === ""
      ? "Required"
      : isNaN(count) || count < min || count > max
      ? `Enter a number between ${limitLabel}`
      : "";

  const handleGenerate = useCallback(() => {
    if (countErr) return;
    let result = "";
    switch (mode) {
      case "words":      result = generateWords(count); break;
      case "sentences":  result = generateSentences(count); break;
      case "paragraphs": result = generateParagraphs(count); break;
    }
    setOutput(result);
    setCopied(false);
  }, [mode, count, countErr]);

  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [output]);

  return (
    <div className="space-y-5">

      {/* Mode */}
      <div>
        <label className={labelCls}>— generate by</label>
        <div className="flex gap-2">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => { setMode(m.key); setOutput(""); }}
              className={cn(
                "flex-1 font-mono text-[11px] px-3 py-2.5 border transition-colors",
                mode === m.key
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border text-foreground-muted hover:text-foreground",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div>
        <label className={labelCls}>
          — number of {mode}{" "}
          <span className="normal-case text-foreground-muted/40">({limitLabel})</span>
        </label>
        <input
          type="number"
          value={rawCount}
          min={min}
          max={max}
          onChange={(e) => { setRawCount(e.target.value); setOutput(""); }}
          className={cn(inputBaseCls, countErr && "border-red-500/40")}
        />
        {countErr && <p className={errCls}>{countErr}</p>}
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={!!countErr}
        className={cn(
          "w-full font-mono text-[11px] uppercase tracking-wider px-4 py-3 border transition-colors",
          countErr
            ? "border-border text-foreground-muted/40 cursor-not-allowed"
            : "border-foreground-muted text-foreground hover:border-primary/40 hover:text-primary",
        )}
      >
        Generate
      </button>

      {/* Output */}
      {output && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={labelCls}>— output</label>
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
          </div>
          <textarea
            readOnly
            value={output}
            rows={8}
            className={cn(textareaCls, "text-foreground/80 cursor-default")}
          />
        </div>
      )}

    </div>
  );
}
