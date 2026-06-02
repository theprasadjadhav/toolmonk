"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils/cn";


type CoinSide = "heads" | "tails";

// ─── Coin face SVG ────────────────────────────────────────────────────────────
function CoinFace({ side }: { side: CoinSide }) {
  const isHeads = side === "heads";
  const rim = isHeads ? "#B8851A" : "#5a5a62";
  const face = isHeads ? "#D49A24" : "#78787f";
  const hi = isHeads ? "#E8B040" : "#909098";
  const label = isHeads ? "#FFF0C0" : "#E8E8F0";
  const dark = isHeads ? "#96680e" : "#404048";

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" aria-label={side}>
      {/* Subtle outer shadow ring */}
      <circle cx="100" cy="100" r="99" fill={rim} opacity="0.12" />
      {/* Rim */}
      <circle cx="100" cy="100" r="96" fill={rim} />
      {/* Milled edge ticks — rounded to 4dp to avoid SSR/browser float mismatch */}
      {Array.from({ length: 72 }).map((_, i) => {
        const a = (i / 72) * 2 * Math.PI;
        const r = (n: number) => Math.round(n * 1e4) / 1e4;
        return (
          <line key={i}
            x1={r(100 + 87 * Math.cos(a))} y1={r(100 + 87 * Math.sin(a))}
            x2={r(100 + 96 * Math.cos(a))} y2={r(100 + 96 * Math.sin(a))}
            stroke={dark} strokeWidth="1.1" opacity="0.5"
          />
        );
      })}
      {/* Face */}
      <circle cx="100" cy="100" r="84" fill={face} />
      {/* Inner decorative ring */}
      <circle cx="100" cy="100" r="74" fill="none" stroke={dark} strokeWidth="1.4" opacity="0.28" />
      <circle cx="100" cy="100" r="68" fill="none" stroke={hi} strokeWidth="0.6" opacity="0.2" />

      {isHeads ? (
        <>
          {/* Crown motif */}
          <polygon points="100,52 108,64 120,61 114,74 86,74 80,61 92,64"
            fill={dark} opacity="0.45" />
          {/* Big H — shadow then fill */}
          <text x="101" y="118" textAnchor="middle" dominantBaseline="middle"
            fontFamily="Georgia,'Times New Roman',serif"
            fontSize="54" fontWeight="700" fill={dark} opacity="0.2">H</text>
          <text x="100" y="116" textAnchor="middle" dominantBaseline="middle"
            fontFamily="Georgia,'Times New Roman',serif"
            fontSize="52" fontWeight="700" fill={label}>H</text>
          {/* HEADS label */}
          <text x="100" y="144" textAnchor="middle"
            fontFamily="monospace" fontSize="9" letterSpacing="3.5"
            fill={label} opacity="0.55">HEADS</text>
        </>
      ) : (
        <>
          {/* Circular ornament */}
          <circle cx="100" cy="63" r="14" fill="none" stroke={dark} strokeWidth="1.6" opacity="0.38" />
          <circle cx="100" cy="63" r="5" fill={dark} opacity="0.28" />
          {/* Big T — shadow then fill */}
          <text x="101" y="118" textAnchor="middle" dominantBaseline="middle"
            fontFamily="Georgia,'Times New Roman',serif"
            fontSize="54" fontWeight="700" fill={dark} opacity="0.2">T</text>
          <text x="100" y="116" textAnchor="middle" dominantBaseline="middle"
            fontFamily="Georgia,'Times New Roman',serif"
            fontSize="52" fontWeight="700" fill={label}>T</text>
          {/* TAILS label */}
          <text x="100" y="144" textAnchor="middle"
            fontFamily="monospace" fontSize="9" letterSpacing="3.5"
            fill={label} opacity="0.55">TAILS</text>
        </>
      )}
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function CoinFlip() {
  const coinRef = useRef<HTMLDivElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<CoinSide | null>(null);
  const [show, setShow] = useState(false);
  const [counts, setCounts] = useState({ heads: 0, tails: 0 });
  const [history, setHistory] = useState<CoinSide[]>([]);

  const flip = useCallback(() => {
    if (spinning) return;

    const bytes = new Uint8Array(1);
    crypto.getRandomValues(bytes);
    const isHeads = bytes[0] % 2 === 0;

    const coin = coinRef.current;
    if (!coin) return;

    setShow(false);
    coin.style.transition = "none";
    coin.style.transform = "rotateY(0deg)";
    void coin.offsetWidth;

    coin.style.transition = "transform 1.05s cubic-bezier(0.18, 0.0, 0.08, 1)";
    coin.style.transform = `rotateY(${isHeads ? 1080 : 1260}deg)`;
    setSpinning(true);
    setResult(null);

    setTimeout(() => {
      const side: CoinSide = isHeads ? "heads" : "tails";
      setSpinning(false);
      setResult(side);
      setShow(true);
      setCounts(p => ({ ...p, [side]: p[side] + 1 }));
      setHistory(p => [side, ...p].slice(0, 16));
      if (coin) {
        coin.style.transition = "none";
        coin.style.transform = `rotateY(${isHeads ? 0 : 180}deg)`;
      }
    }, 1050);
  }, [spinning]);

  // Spacebar shortcut
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        flip();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [flip]);

  const total = counts.heads + counts.tails;

  return (
    <div className="flex flex-col items-center gap-5">

      {/* ── Coin ──────────────────────────────────────────────────────────── */}
      <div style={{ perspective: "900px", width: 224, height: 224 }}>
        <div ref={coinRef} className="relative w-full h-full"
          style={{ transformStyle: "preserve-3d" }}>
          <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
            <CoinFace side="heads" />
          </div>
          <div className="absolute inset-0"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <CoinFace side="tails" />
          </div>
        </div>
      </div>

      {/* ── Result text ───────────────────────────────────────────────────── */}
      <div className="h-9 flex items-center justify-center">
        {result && show ? (
          <p className="font-mono text-2xl uppercase tracking-[0.22em]"
            style={{
              color: result === "heads" ? "#D49A24" : "#78787f",
              animation: "coin-land 0.33s cubic-bezier(0.34, 1.56, 0.64, 1) both",
            }}>
            {result}
          </p>
        ) : spinning ? (
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-foreground-muted/35">
            Flipping…
          </p>
        ) : (
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground-muted/22">
            {total > 0 ? "Flip again" : "Press to flip"}
          </p>
        )}
      </div>

      {/* ── History strip ─────────────────────────────────────────────────── */}
      {history.length > 0 && (
        <div className="flex gap-1.5 flex-wrap justify-center max-w-[300px]">
          {history.map((s, i) => (
            <span key={i}
              className="font-mono text-[9px] w-6 h-[18px] flex items-center justify-center border uppercase"
              style={{
                borderColor: s === "heads"
                  ? `rgba(212,154,36,${0.85 - i * 0.025})`
                  : `rgba(120,120,127,${0.85 - i * 0.025})`,
                color: s === "heads"
                  ? `rgba(212,154,36,${0.85 - i * 0.025})`
                  : `rgba(136,136,142,${0.85 - i * 0.025})`,
              }}>
              {s[0].toUpperCase()}
            </span>
          ))}
        </div>
      )}

      {/* ── Flip button ───────────────────────────────────────────────────── */}
      <button
        onClick={flip}
        disabled={spinning}
        className={cn(
          "font-mono text-[10px] px-24 py-3 border uppercase tracking-widest transition-colors",
          spinning
            ? "border-border/20 text-foreground-muted/20 cursor-not-allowed"
            : "border-primary/40 text-primary hover:border-primary"
        )}>
        {spinning ? "Flipping…" : (result ? "Flip Again" : "Flip Coin")}
      </button>

      {/* ── Reset ─────────────────────────────────────────────────────────── */ }
  {
    total > 0 && !spinning && (
      <button
        onClick={() => {
          setResult(null);
          setShow(false);
          setCounts({ heads: 0, tails: 0 });
          setHistory([]);
          const c = coinRef.current;
          if (c) { c.style.transition = "none"; c.style.transform = "rotateY(0deg)"; }
        }}
        className="font-mono text-[9px] text-foreground hover:text-primary cursor-pointer underline underline-offset-3 tracking-wider transition-colors">
        Reset stats
      </button>
    )
  }



  {/* ── Stats ─────────────────────────────────────────────────────────── */ }
  {
    total > 0 && (
      <div className="w-full border border-border grid grid-cols-3 divide-x divide-border">
        {[
          { label: "Heads", val: counts.heads },
          { label: "Tails", val: counts.tails },
          { label: "Total", val: total },
        ].map(({ label, val }) => (
          <div key={label} className="py-3 text-center">
            <span className="font-mono text-[9px] uppercase tracking-wider text-foreground-muted/45 block mb-1">
              {label}
            </span>
            <span className="font-mono text-xl tabular-nums text-foreground block">{val}</span>
            {label !== "Total" && (
              <span className="font-mono text-[9px] text-foreground-muted/28 mt-0.5 block">
                {((val / total) * 100).toFixed(0)}%
              </span>
            )}
          </div>
        ))}
      </div>
    )
  }

  {/* ── Keyboard shortcut hint ────────────────────────────────────────── */ }
  <p className="font-mono text-[9px] text-foreground-muted/80 tracking-wider">
    or press{" "}
    <kbd className="border border-foreground-muted/60 px-1.5 py-px text-foreground-muted/80">
      Space
    </kbd>
  </p>

    </div >
  );
}
