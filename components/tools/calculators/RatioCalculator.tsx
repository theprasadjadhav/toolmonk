"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

type Mode = "simplify" | "proportion" | "scale";
type Unknown = "A" | "B" | "C" | "D";

const MODES: { value: Mode; label: string }[] = [
  { value: "simplify", label: "Simplify" },
  { value: "proportion", label: "Proportion" },
  { value: "scale", label: "Scale" },
];

function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) { const t = b; b = a % b; a = t; }
  return a || 1;
}

function simplifyRatio(a: number, b: number): [number, number] {
  const g = gcd(a, b);
  return [a / g, b / g];
}

function fmt(n: number): string {
  const r = parseFloat(n.toPrecision(10));
  return String(r);
}

export function RatioCalculator() {
  const [mode, setMode] = useState<Mode>("simplify");

  // Simplify
  const [sA, setSA] = useState("");
  const [sB, setSB] = useState("");

  // Proportion: A : B = C : D  (one unknown)
  const [pA, setPA] = useState("");
  const [pB, setPB] = useState("");
  const [pC, setPC] = useState("");
  const [pD, setPD] = useState("");
  const [unknown, setUnknown] = useState<Unknown>("D");

  // Scale
  const [scA, setScA] = useState("");
  const [scB, setScB] = useState("");
  const [scN, setScN] = useState("");

  const [copied, setCopied] = useState("false");

  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  };

  const simplifyAErr = sA !== "" && (isNaN(parseFloat(sA)) || parseFloat(sA) <= 0) ? "Must be > 0" : null;
  const simplifyBErr = sB !== "" && (isNaN(parseFloat(sB)) || parseFloat(sB) <= 0) ? "Must be > 0" : null;
  const scaleAErr = scA !== "" && (isNaN(parseFloat(scA)) || parseFloat(scA) <= 0) ? "Must be > 0" : null;
  const scaleBErr = scB !== "" && (isNaN(parseFloat(scB)) || parseFloat(scB) <= 0) ? "Must be > 0" : null;

  // ── Simplify result ──────────────────────────────────────────────────────────
  const simplifyResult = (() => {
    const a = parseFloat(sA), b = parseFloat(sB);
    if (simplifyAErr || simplifyBErr || isNaN(a) || isNaN(b) || b === 0 || a <= 0 || b <= 0) return null;
    const [ra, rb] = simplifyRatio(a, b);
    const decimal = fmt(a / b);
    return { ratio: `${ra} : ${rb}`, decimal, equiv: `1 : ${fmt(rb / ra)}` };
  })();

  // ── Proportion result ────────────────────────────────────────────────────────
  const proportionResult = (() => {
    const a = parseFloat(pA), b = parseFloat(pB), c = parseFloat(pC), d = parseFloat(pD);
    const v = { A: a, B: b, C: c, D: d };
    const known = (Object.keys(v) as Unknown[]).filter((k) => k !== unknown);
    if (known.some((k) => isNaN(v[k]))) return null;

    let result: number;
    // Cross-multiply: A/B = C/D  →  A*D = B*C
    if (unknown === "A") result = (v.B * v.C) / v.D;
    else if (unknown === "B") result = (v.A * v.D) / v.C;
    else if (unknown === "C") result = (v.A * v.D) / v.B;
    else result = (v.B * v.C) / v.A;

    if (!isFinite(result) || isNaN(result)) return null;
    const rStr = fmt(result);
    const full = { A: unknown === "A" ? result : a, B: unknown === "B" ? result : b, C: unknown === "C" ? result : c, D: unknown === "D" ? result : d };
    const check = `${fmt(full.A)} : ${fmt(full.B)} = ${fmt(full.C)} : ${fmt(full.D)}`;
    return { value: rStr, label: unknown, check };
  })();

  // ── Scale result ─────────────────────────────────────────────────────────────
  const scaleResult = (() => {
    const a = parseFloat(scA), b = parseFloat(scB), n = parseFloat(scN);
    if (scaleAErr || scaleBErr || isNaN(a) || isNaN(b) || isNaN(n)) return null;
    return { ra: fmt(a * n), rb: fmt(b * n) };
  })();

  return (
    <div className="space-y-5">

      {/* Mode tabs */}
      <div className="flex gap-2">
        {MODES.map((m) => (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            className={cn(
              "flex-1 font-mono text-[11px] px-3 py-2 border transition-colors",
              mode === m.value
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border text-foreground-muted hover:text-foreground",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* ── Simplify ── */}
      {mode === "simplify" && (
        <>
          <div className="space-y-1.5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— ratio A : B (both must be &gt; 0)</p>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input type="number" value={sA} onChange={(e) => setSA(e.target.value)} placeholder="A"
                  className={cn("w-full font-mono text-base bg-surface-muted border border-border px-3 py-2.5 text-foreground outline-none focus:border-foreground-muted", simplifyAErr && "border-red-400/60 focus:border-red-400")} />
                {simplifyAErr && <p className="font-mono text-[10px] text-red-500/70 mt-1">{simplifyAErr}</p>}
              </div>
              <span className="font-mono text-lg text-foreground-muted shrink-0">:</span>
              <div className="flex-1">
                <input type="number" value={sB} onChange={(e) => setSB(e.target.value)} placeholder="B"
                  className={cn("w-full font-mono text-base bg-surface-muted border border-border px-3 py-2.5 text-foreground outline-none focus:border-foreground-muted", simplifyBErr && "border-red-400/60 focus:border-red-400")} />
                {simplifyBErr && <p className="font-mono text-[10px] text-red-500/70 mt-1">{simplifyBErr}</p>}
              </div>
            </div>
          </div>
          <div className="border border-border bg-surface-muted divide-y divide-border">
            {[
              { label: "Simplified", val: simplifyResult ? simplifyResult.ratio : "-" },
              { label: "Decimal form", val: simplifyResult ? simplifyResult.decimal : "-" },
              { label: "Unit ratio", val: simplifyResult ? simplifyResult.equiv : "-" },
            ].map(({ label, val }) => (
              <div key={label} className="flex items-center bg-surface">
                <span className="font-mono text-[10px] text-foreground-muted/50 uppercase tracking-wider px-4 py-2.5 w-36 shrink-0 border-r border-border">{label}</span>
                <span className="font-mono text-base text-foreground px-4 py-2.5 flex-1">{val}</span>
                <button onClick={() => copy(label, val)}
                  disabled={!simplifyResult}
                  className={cn("font-mono text-[10px] px-3 py-1.5 mr-2 border border-border shrink-0",
                    copied === label ? "text-primary border-primary/40 bg-primary/10" : "text-foreground-muted/80 hover:text-foreground disabled:opacity-20")}>
                  {copied === label ? "copied!" : "copy"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Proportion ── */}
      {mode === "proportion" && (
        <>
          <div className="flex justify-between ">
            <p className="font-mono text-[10px] self-center uppercase tracking-wider text-foreground-muted/60">
              — A : B = C : D — tap a field to mark it as the unknown
            </p>
            <button
              onClick={() => copy("proportion", proportionResult?.value ?? "")}
              disabled={!proportionResult}
              className={cn("font-mono text-[10px] px-3 py-1.5 border",
                copied === "proportion" ? "text-primary border-primary/40 bg-primary/10" : "text-foreground-muted/80 hover:text-foreground disabled:opacity-20")}>
              {copied === "proportion" ? "copied" : "copy"}
            </button>
          </div>

          {/* Inline 4-field row: [A] : [B] = [C] : [D] */}
          <div className="flex items-end gap-1.5">
            {(["A", "B", "C", "D"] as Unknown[]).map((key, i) => {
              const val = { A: pA, B: pB, C: pC, D: pD }[key];
              const set = { A: setPA, B: setPB, C: setPC, D: setPD }[key];
              const isUnknown = unknown === key;
              const computed = isUnknown && proportionResult ? proportionResult.value : null;
              const sep = i === 0 ? ":" : i === 1 ? "=" : i === 2 ? ":" : null;
              return (
                <div key={key} className="contents">
                  <div className="flex-1 flex flex-col">
                    <button
                      onClick={() => setUnknown(key)}
                      className={cn(
                        "font-mono text-[9px] uppercase tracking-wider px-2 py-1.5 border-x border-t transition-colors",
                        isUnknown
                          ? "bg-foreground/4 border-primary/30 text-primary"
                          : "border-border text-foreground-muted/40 hover:text-foreground-muted",
                      )}
                    >
                      {isUnknown ? "?" : key}
                    </button>
                    <input
                      type="number"
                      value={isUnknown ? (computed ?? "") : val}
                      onChange={(e) => !isUnknown && set(e.target.value)}
                      readOnly={isUnknown}
                      placeholder={isUnknown ? "?" : key}
                      className={cn(
                        "w-full font-mono text-base px-3 py-2.5 border outline-none text-center",
                        isUnknown
                          ? "bg-foreground/2 border-primary/30 text-primary cursor-default"
                          : "bg-surface-muted border-border text-foreground focus:border-foreground-muted",
                      )}
                    />
                  </div>
                  {sep && (
                    <span className="font-mono text-lg text-foreground-muted pb-2.5 shrink-0">{sep}</span>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Scale ── */}
      {mode === "scale" && (
        <>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— original ratio A : B (both must be &gt; 0)</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input type="number" value={scA} onChange={(e) => setScA(e.target.value)} placeholder="A"
                    className={cn("w-full font-mono text-base bg-surface-muted border border-border px-3 py-2.5 text-foreground outline-none focus:border-foreground-muted", scaleAErr && "border-red-400/60 focus:border-red-400")} />
                  {scaleAErr && <p className="font-mono text-[10px] text-red-500/70 mt-1">{scaleAErr}</p>}
                </div>
                <span className="font-mono text-lg text-foreground-muted shrink-0">:</span>
                <div className="flex-1">
                  <input type="number" value={scB} onChange={(e) => setScB(e.target.value)} placeholder="B"
                    className={cn("w-full font-mono text-base bg-surface-muted border border-border px-3 py-2.5 text-foreground outline-none focus:border-foreground-muted", scaleBErr && "border-red-400/60 focus:border-red-400")} />
                  {scaleBErr && <p className="font-mono text-[10px] text-red-500/70 mt-1">{scaleBErr}</p>}
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— scale factor</p>
              <input type="number" value={scN} onChange={(e) => setScN(e.target.value)} placeholder="e.g. 3"
                className="w-full font-mono text-base bg-surface-muted border border-border px-3 py-2.5 text-foreground outline-none focus:border-foreground-muted" />
            </div>
          </div>

          <div className="border border-border bg-surface-muted px-5 py-4 space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60 mb-2">Scaled ratio</p>
            <div className="flex items-center gap-3">
              <div className="overflow-x-auto flex items-center p-2">
                <span className="font-mono text-4xl text-foreground">{scaleResult ? scaleResult.ra : "-"}</span>
                <span className="font-mono text-2xl text-foreground-muted">:</span>
                <span className="font-mono text-4xl text-foreground">{scaleResult ? scaleResult.rb : "-"}</span>
              </div>
              <button onClick={() => copy("scale", `${scaleResult ? scaleResult.ra : "-"} : ${scaleResult ? scaleResult.rb : "-"}`)}
                disabled={!scaleResult}
                className={cn("font-mono text-[10px] px-3 py-1.5 border ml-auto",
                  copied === "scale" ? "text-primary border-primary/40 bg-primary/10" : "text-foreground-muted/80 hover:text-foreground disabled:opacity-20")}>
                {copied === "scale" ? "copied" : "copy"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
