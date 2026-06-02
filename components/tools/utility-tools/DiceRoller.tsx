"use client";

import { useState, useCallback, useRef, useEffect, useLayoutEffect } from "react";
import { cn } from "@/lib/utils/cn";

const DIE_TYPES = [4, 6, 8, 10, 12, 20] as const;
type DieType = (typeof DIE_TYPES)[number];

// [base, light, shadow, textColor, glow]
const PALETTES: Record<DieType, [string, string, string, string, string]> = {
  4:  ["#16a34a", "#4ade80", "#15803d", "#bbf7d0", "rgba(22,163,74,0.5)"],
  6:  ["#0891b2", "#22d3ee", "#0e7490", "#a5f3fc", "rgba(8,145,178,0.5)"],
  8:  ["#7c3aed", "#a78bfa", "#6d28d9", "#ede9fe", "rgba(124,58,237,0.5)"],
  10: ["#be185d", "#f472b6", "#9d174d", "#fce7f3", "rgba(190,24,93,0.5)"],
  12: ["#dc2626", "#f87171", "#b91c1c", "#fee2e2", "rgba(220,38,38,0.5)"],
  20: ["#ea580c", "#fb923c", "#c2410c", "#ffedd5", "rgba(234,88,12,0.5)"],
};

// Pip positions on D6 front face (8,32)-(72,96)
const PIPS: Record<number, [number, number][]> = {
  1: [[40, 64]],
  2: [[22, 47], [58, 81]],
  3: [[22, 47], [40, 64], [58, 81]],
  4: [[22, 47], [58, 47], [22, 81], [58, 81]],
  5: [[22, 47], [58, 47], [40, 64], [22, 81], [58, 81]],
  6: [[22, 40], [22, 64], [22, 88], [58, 40], [58, 64], [58, 88]],
};

const REVEAL = "dice-land 0.32s cubic-bezier(0.34,1.56,0.64,1) both";

// ─── Die face SVGs ────────────────────────────────────────────────────────────

function FaceD4({ value, rolling }: { value: number; rolling: boolean }) {
  const [base, light, shadow, text, glow] = PALETTES[4];
  return (
    <svg viewBox="0 0 110 110" className="w-full h-full"
      style={{ filter: `drop-shadow(0 6px 20px ${glow})` }}>
      <polygon points="10,95 55,8 55,65"   fill={light} />
      <polygon points="55,8 100,95 55,65"  fill={shadow} />
      <polygon points="10,95 100,95 55,65" fill={base} />
      <polygon points="10,95 55,8 100,95"  fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="1.5" />
      <line x1="55" y1="8"  x2="55" y2="65" stroke="rgba(0,0,0,0.15)" strokeWidth="0.9" />
      <line x1="10" y1="95" x2="55" y2="65" stroke="rgba(0,0,0,0.15)" strokeWidth="0.9" />
      <line x1="100" y1="95" x2="55" y2="65" stroke="rgba(0,0,0,0.15)" strokeWidth="0.9" />
      <polyline points="10,95 55,8" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.8" />
      {!rolling && (
        <text x="54" y="68" textAnchor="middle" dominantBaseline="middle"
          fontSize="28" fontWeight="800" fill={text}
          style={{ animation: REVEAL }}>{value}</text>
      )}
    </svg>
  );
}

function FaceD6({ value, rolling }: { value: number; rolling: boolean }) {
  const [base, light, shadow, text, glow] = PALETTES[6];
  const pips = !rolling ? (PIPS[value] ?? []) : [];
  return (
    <svg viewBox="0 0 112 108" className="w-full h-full"
      style={{ filter: `drop-shadow(0 6px 20px ${glow})` }}>
      <polygon points="72,32 92,16 92,80 72,96" fill={shadow} />
      <polygon points="72,32 92,16 92,80 72,96" fill="rgba(0,0,0,0.18)" />
      <polygon points="8,32 72,32 92,16 28,16" fill={light} />
      <polygon points="8,32 72,32 72,96 8,96"  fill={base} />
      <polygon points="8,32 72,32 92,16 28,16" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="0.8" />
      <polygon points="72,32 92,16 92,80 72,96" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="0.8" />
      <polygon points="8,32 72,32 72,96 8,96"   fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="0.8" />
      <polyline points="28,16 8,32 8,96" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
      {pips.map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r="5.5" fill={text} opacity="0.92"
          style={{ animation: `dice-land 0.3s cubic-bezier(0.34,1.56,0.64,1) ${i * 25}ms both` }} />
      ))}
    </svg>
  );
}

function FaceD8({ value, rolling }: { value: number; rolling: boolean }) {
  const [base, light, shadow, text, glow] = PALETTES[8];
  return (
    <svg viewBox="0 0 110 110" className="w-full h-full"
      style={{ filter: `drop-shadow(0 6px 20px ${glow})` }}>
      <polygon points="55,5 10,55 55,55"    fill={light} />
      <polygon points="55,5 100,55 55,55"   fill={base} />
      <polygon points="10,55 55,105 55,55"  fill={shadow} />
      <polygon points="100,55 55,105 55,55" fill={shadow} opacity="0.85" />
      <polygon points="55,5 100,55 55,105 10,55" fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="1.5" />
      <line x1="10"  y1="55" x2="100" y2="55"  stroke="rgba(0,0,0,0.15)" strokeWidth="0.9" />
      <line x1="55"  y1="5"  x2="55"  y2="105" stroke="rgba(0,0,0,0.15)" strokeWidth="0.9" />
      <polyline points="10,55 55,5" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.8" />
      {!rolling && (
        <text x="55" y="58" textAnchor="middle" dominantBaseline="middle"
          fontSize="26" fontWeight="700" fill={text}
          style={{ animation: REVEAL }}>{value}</text>
      )}
    </svg>
  );
}

function FaceD10({ value, rolling }: { value: number; rolling: boolean }) {
  const [base, light, shadow, text, glow] = PALETTES[10];
  return (
    <svg viewBox="0 0 110 110" className="w-full h-full"
      style={{ filter: `drop-shadow(0 6px 20px ${glow})` }}>
      <polygon points="55,5 15,62 55,62"    fill={light} />
      <polygon points="55,5 95,62 55,62"    fill={base} />
      <polygon points="15,62 55,105 55,62"  fill={shadow} />
      <polygon points="95,62 55,105 55,62"  fill={shadow} opacity="0.85" />
      <polygon points="55,5 95,62 55,105 15,62" fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="1.5" />
      <line x1="15" y1="62" x2="95" y2="62"  stroke="rgba(0,0,0,0.15)" strokeWidth="0.9" />
      <line x1="55" y1="5"  x2="55" y2="105" stroke="rgba(0,0,0,0.15)" strokeWidth="0.9" />
      <polyline points="15,62 55,5" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.8" />
      {!rolling && (
        <text x="55" y="64" textAnchor="middle" dominantBaseline="middle"
          fontSize={value >= 10 ? "22" : "26"} fontWeight="700" fill={text}
          style={{ animation: REVEAL }}>{value}</text>
      )}
    </svg>
  );
}

function FaceD12({ value, rolling }: { value: number; rolling: boolean }) {
  const [base, light, shadow, text, glow] = PALETTES[12];
  const cx = 55, cy = 57;
  const p5 = Array.from({ length: 5 }, (_, i) => {
    const a = (i * 72 - 90) * Math.PI / 180;
    return [Math.round(cx + 44 * Math.cos(a)), Math.round(cy + 44 * Math.sin(a))] as [number, number];
  });
  const pStr = p5.map(p => p.join(",")).join(" ");
  const shades = [light, base, shadow, shadow, base];
  return (
    <svg viewBox="0 0 110 110" className="w-full h-full"
      style={{ filter: `drop-shadow(0 6px 20px ${glow})` }}>
      {p5.map((p, i) => {
        const n = p5[(i + 1) % 5] as [number, number];
        return <polygon key={i} points={`${p[0]},${p[1]} ${n[0]},${n[1]} ${cx},${cy}`} fill={shades[i]} />;
      })}
      <polygon points={pStr} fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="1.5" />
      {p5.map((p, i) => (
        <line key={i} x1={p[0]} y1={p[1]} x2={cx} y2={cy}
          stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" />
      ))}
      <line x1={p5[4][0]} y1={p5[4][1]} x2={p5[0][0]} y2={p5[0][1]}
        stroke="rgba(255,255,255,0.1)" strokeWidth="1.8" />
      {!rolling && (
        <text x="55" y="60" textAnchor="middle" dominantBaseline="middle"
          fontSize={value >= 10 ? "22" : "26"} fontWeight="700" fill={text}
          style={{ animation: REVEAL }}>{value}</text>
      )}
    </svg>
  );
}

function FaceD20({ value, rolling }: { value: number; rolling: boolean }) {
  const [base, light, shadow, text, glow] = PALETTES[20];
  return (
    <svg viewBox="0 0 110 110" className="w-full h-full"
      style={{ filter: `drop-shadow(0 6px 20px ${glow})` }}>
      {/* midpoint-subdivided triangle */}
      <polygon points="55,5 33,51 78,51"   fill={light} />
      <polygon points="10,97 33,51 55,97"  fill={base} />
      <polygon points="33,51 78,51 55,97"  fill={shadow} />
      <polygon points="78,51 100,97 55,97" fill={shadow} opacity="0.82" />
      <polygon points="10,97 55,5 100,97"  fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="1.5" />
      <line x1="33" y1="51" x2="78" y2="51" stroke="rgba(0,0,0,0.15)" strokeWidth="0.9" />
      <line x1="33" y1="51" x2="55" y2="97" stroke="rgba(0,0,0,0.15)" strokeWidth="0.9" />
      <line x1="78" y1="51" x2="55" y2="97" stroke="rgba(0,0,0,0.15)" strokeWidth="0.9" />
      <polyline points="10,97 55,5" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.8" />
      {!rolling && (
        <text x="55" y="67" textAnchor="middle" dominantBaseline="middle"
          fontSize={value >= 10 ? "20" : "26"} fontWeight="700" fill={text}
          style={{ animation: REVEAL }}>{value}</text>
      )}
    </svg>
  );
}

function DieFace({ dieType, value, rolling }: { dieType: DieType; value: number; rolling: boolean }) {
  switch (dieType) {
    case 4:  return <FaceD4  value={value} rolling={rolling} />;
    case 6:  return <FaceD6  value={value} rolling={rolling} />;
    case 8:  return <FaceD8  value={value} rolling={rolling} />;
    case 10: return <FaceD10 value={value} rolling={rolling} />;
    case 12: return <FaceD12 value={value} rolling={rolling} />;
    case 20: return <FaceD20 value={value} rolling={rolling} />;
  }
}

// ─── Selector icon buttons ────────────────────────────────────────────────────

function DieShapeIcon({ dieType, active }: { dieType: DieType; active: boolean }) {
  const [base] = PALETTES[dieType];
  const stroke = active ? base : "var(--foreground-muted)";
  const fill   = active ? `${base}28` : "transparent";
  const op     = active ? 1 : 0.38;
  switch (dieType) {
    case 4: return (
      <svg viewBox="0 0 24 24" width="26" height="26">
        <polygon points="12,3 21,20 3,20" fill={fill} stroke={stroke} strokeWidth="1.6" opacity={op} />
      </svg>
    );
    case 6: return (
      <svg viewBox="0 0 24 24" width="26" height="26">
        <rect x="3" y="3" width="18" height="18" fill={fill} stroke={stroke} strokeWidth="1.6" opacity={op} />
        <circle cx="8"  cy="8"  r="1.4" fill={stroke} opacity={op * 0.75} />
        <circle cx="16" cy="16" r="1.4" fill={stroke} opacity={op * 0.75} />
      </svg>
    );
    case 8: return (
      <svg viewBox="0 0 24 24" width="26" height="26">
        <polygon points="12,2 22,12 12,22 2,12" fill={fill} stroke={stroke} strokeWidth="1.6" opacity={op} />
      </svg>
    );
    case 10: return (
      <svg viewBox="0 0 24 24" width="26" height="26">
        <polygon points="12,2 22,12 12,22 2,12" fill={fill} stroke={stroke} strokeWidth="1.6" opacity={op} />
        <line x1="12" y1="2" x2="12" y2="22" stroke={stroke} strokeWidth="0.9" opacity={op * 0.55} />
      </svg>
    );
    case 12: return (
      <svg viewBox="0 0 24 24" width="26" height="26">
        <polygon points="12,2 19.5,6 22,14 17,21 7,21 2,14 4.5,6" fill={fill} stroke={stroke} strokeWidth="1.6" opacity={op} />
      </svg>
    );
    case 20: return (
      <svg viewBox="0 0 24 24" width="26" height="26">
        <polygon points="12,2 22,20 2,20" fill={fill} stroke={stroke} strokeWidth="1.6" opacity={op} />
        <line x1="12" y1="2"  x2="12" y2="20" stroke={stroke} strokeWidth="0.8" opacity={op * 0.55} />
        <line x1="2"  y1="14" x2="22" y2="14" stroke={stroke} strokeWidth="0.8" opacity={op * 0.55} />
      </svg>
    );
  }
}

// ─── Animated die — single SVG element with perspective 3D tilt ──────────────
// No CSS cube: the die-spin keyframe keeps rotateX/Y within ±50° (never edge-on)
// so the SVG face is always visible. The SVG artwork provides all 3D shading.

function AnimatedDie({
  rollKey, dieIndex, dieSize, dieType, value, rolling,
}: {
  rollKey: number; dieIndex: number; dieSize: number;
  dieType: DieType; value: number; rolling: boolean;
}) {
  const spinRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = spinRef.current;
    if (!el) return;
    if (!rolling) {
      el.style.animationName = "";
      el.style.transform = "";
      return;
    }
    // Reflow trick: forces animation to restart from frame 0
    el.style.animationName = "none";
    void el.offsetHeight;
    el.style.animationName           = "die-spin";
    el.style.animationDuration       = "0.95s";
    el.style.animationTimingFunction = "cubic-bezier(0.15, 0.85, 0.45, 1.0)";
    el.style.animationDelay          = `${dieIndex * 70}ms`;
    el.style.animationFillMode       = "both";
    el.style.animationIterationCount = "1";
  }, [rollKey, rolling]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ width: dieSize, height: dieSize, flexShrink: 0, perspective: `${dieSize * 2}px` }}>
      <div ref={spinRef} style={{ width: "100%", height: "100%", transformStyle: "preserve-3d" }}>
        <DieFace dieType={dieType} value={value} rolling={rolling} />
      </div>
    </div>
  );
}

// ─── Crypto-unbiased roll ─────────────────────────────────────────────────────

function cryptoRoll(sides: number): number {
  const max = Math.floor(0xffffffff / sides) * sides;
  const buf = new Uint32Array(1);
  let v: number;
  do { crypto.getRandomValues(buf); v = buf[0]; } while (v >= max);
  return (v % sides) + 1;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DiceRoller() {
  const [dieType, setDieType] = useState<DieType>(6);
  const [count,   setCount]   = useState(1);
  const [values,  setValues]  = useState<number[]>([]);
  const [rolling, setRolling] = useState(false);
  const [rollKey, setRollKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const roll = useCallback(() => {
    if (rolling) return;
    const final = Array.from({ length: count }, () => cryptoRoll(dieType));
    setValues(final);
    setRolling(true);
    setRollKey(k => k + 1);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setRolling(false), 950 + (count - 1) * 70);
  }, [rolling, count, dieType]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  // Spacebar shortcut
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) { e.preventDefault(); roll(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [roll]);

  const sum       = values.reduce((a, b) => a + b, 0);
  const hasResult = !rolling && values.length > 0;
  const dieSize   = [160, 130, 108, 92, 80, 70][count - 1] ?? 70;

  function changeType(d: DieType) { setDieType(d); setValues([]); }
  function changeCount(n: number) { setCount(n);   setValues([]); }

  return (
    <div className="flex flex-col">

      {/* ── Dice display area ─────────────────────────────────────────────── */}
      <div className="min-h-[260px] flex flex-col items-center justify-center gap-4 py-6">
        {values.length === 0 && !rolling ? (
          <p className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted/22">
            Select a die and roll
          </p>
        ) : (
          <>
            <div className="flex flex-wrap justify-center items-center gap-4">
              {Array.from({ length: count }).map((_, i) => (
                values[i] !== undefined && (
                  <AnimatedDie
                    key={i}
                    rollKey={rollKey}
                    dieIndex={i}
                    dieSize={dieSize}
                    dieType={dieType}
                    value={values[i]!}
                    rolling={rolling}
                  />
                )
              ))}
            </div>

            {/* Sum (multi-die only, after roll) */}
            {hasResult && count > 1 && (
              <div className="text-center"
                style={{ animation: "dice-land 0.35s cubic-bezier(0.34,1.56,0.64,1) both" }}>
                <span className="font-mono text-[9px] uppercase tracking-widest text-foreground-muted block mb-0.5">
                  Sum
                </span>
                <span className="font-mono text-4xl tabular-nums text-foreground block">{sum}</span>
                <span className="font-mono text-[9px] text-foreground-muted mt-0.5 block">
                  {values.join(" · ")}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Controls ──────────────────────────────────────────────────────── */}
      <div className="border-t border-border pt-5 flex flex-col gap-4">

        {/* Die type selector */}
        <div className="flex items-center justify-center gap-1">
          {DIE_TYPES.map(d => {
            const [base] = PALETTES[d];
            const active = dieType === d;
            return (
              <button key={d} onClick={() => changeType(d)} disabled={rolling}
                className="flex flex-col items-center gap-0.5 px-2 py-1.5 transition-opacity"
                style={{
                  borderBottom: `2px solid ${active ? base : "transparent"}`,
                  opacity: rolling ? 0.4 : 1,
                  cursor: rolling ? "not-allowed" : "pointer",
                }}>
                <DieShapeIcon dieType={d} active={active} />
                <span className="font-mono text-[8px] uppercase tracking-widest"
                  style={{ color: active ? base : "var(--foreground-muted)", opacity: active ? 1 : 0.38 }}>
                  D{d}
                </span>
              </button>
            );
          })}
        </div>

        {/* Count stepper */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeCount(Math.max(1, count - 1))}
              disabled={count <= 1 || rolling}
              className="w-8 h-8 border border-border font-mono text-base text-foreground-muted hover:text-foreground hover:border-foreground-muted/50 disabled:opacity-20 transition-colors flex items-center justify-center">
              −
            </button>
            <span className="font-mono text-sm w-5 text-center tabular-nums text-foreground">{count}</span>
            <button
              onClick={() => changeCount(Math.min(6, count + 1))}
              disabled={count >= 6 || rolling}
              className="w-8 h-8 border border-border font-mono text-base text-foreground-muted hover:text-foreground hover:border-foreground-muted/50 disabled:opacity-20 transition-colors flex items-center justify-center">
              +
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap">
           <button
            onClick={roll}
            disabled={rolling}
            className={cn(
              "font-mono text-[10px] px-24 py-3 border uppercase tracking-widest transition-colors",
              rolling
                ? "border-border/20 text-foreground-muted/20 cursor-not-allowed"
                : "border-primary/40 text-primary hover:border-primary"
            )}>
            {rolling ? "Rolling…" : `Roll`}
          </button>
        </div>

        {/* Keyboard hint */}
        <p className="font-mono text-[9px] text-center text-foreground-muted/80 tracking-wider">
          or press{" "}
          <kbd className="border border-foreground-muted/60 px-1.5 py-px text-foreground-muted/80">Space</kbd>
        </p>
      </div>
    </div>
  );
}
