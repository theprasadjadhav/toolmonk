"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { evaluate } from "mathjs";
import { cn } from "@/lib/utils/cn";

type AngleMode = "DEG" | "RAD";

// ── Display formatting ─────────────────────────────────────────────────────────

function toDisplay(expr: string): string {
  return (
    expr
      .replace(/\*/g, "×")
      .replace(/\//g, "÷")
      .replace(/\bpi\b/g, "π")
      .replace(/sqrt\(/g, "√(")
      // IMPORTANT: replace log( before log10( so log10( → "log(" not "ln("
      .replace(/\blog\(/g, "ln(")
      .replace(/log10\(/g, "log(")
      .replace(/asin\(/g, "sin⁻¹(")
      .replace(/acos\(/g, "cos⁻¹(")
      .replace(/atan\(/g, "tan⁻¹(")
  );
}

function formatNumber(val: number): string {
  if (!isFinite(val) || isNaN(val)) return "Error";

  // Round to 10 significant figures to remove floating-point noise
  const rounded = parseFloat(val.toPrecision(10));
  if (rounded === 0) return "0";

  const abs = Math.abs(rounded);

  // Scientific notation for very large or very small values
  if (abs >= 1e12 || abs < 1e-9) {
    const s = rounded.toExponential(7);
    // Trim trailing zeros in mantissa: "1.2300000e+5" → "1.23e+5"
    return s.replace(/(\.\d*?)0+(e)/, "$1$2").replace(/\.(e)/, "$1");
  }

  return String(rounded);
}

function computeResult(expr: string, mode: AngleMode): string {
  if (!expr.trim()) return "";
  try {
    let val: unknown;
    if (mode === "DEG") {
      const d2r = Math.PI / 180;
      const r2d = 180 / Math.PI;
      val = evaluate(expr, {
        sin:  (x: number) => Math.sin(x * d2r),
        cos:  (x: number) => Math.cos(x * d2r),
        tan:  (x: number) => Math.tan(x * d2r),
        asin: (x: number) => Math.asin(x) * r2d,
        acos: (x: number) => Math.acos(x) * r2d,
        atan: (x: number) => Math.atan(x) * r2d,
      });
    } else {
      val = evaluate(expr);
    }

    if (typeof val === "boolean") return String(val);
    if (typeof val !== "number") return String(val);
    return formatNumber(val);
  } catch {
    return "";
  }
}

// ── Smart DEL — sorted longest-first so "log10(" is matched before "log(" ──────

const MULTI_TOKENS = [
  "log10(", "sqrt(", "asin(", "acos(", "atan(", "sin(", "cos(", "tan(", "log(", "abs(", "pi",
];

// ── Button definitions ─────────────────────────────────────────────────────────

type BtnStyle = "num" | "op" | "func" | "equals" | "mode" | "danger";

interface Btn {
  label?: string;
  insert?: string;
  action?: string;
  style?: BtnStyle;
}

const BTNS: Btn[] = [
  // Row 1 — mode / brackets / clear
  { label: "DEG",   action: "MODE",   style: "mode"   },
  { label: "(",     insert: "("                        },
  { label: ")",     insert: ")"                        },
  { label: "DEL",   action: "DEL",    style: "danger"  },
  { label: "C",     action: "C",      style: "danger"  },

  // Row 2 — trig + power + root
  { label: "sin",   insert: "sin(",   style: "func" },
  { label: "cos",   insert: "cos(",   style: "func" },
  { label: "tan",   insert: "tan(",   style: "func" },
  { label: "xʸ",    insert: "^",      style: "func" },
  { label: "√",     insert: "sqrt(",  style: "func" },

  // Row 3 — inverse trig + log
  { label: "sin⁻¹", insert: "asin(",  style: "func" },
  { label: "cos⁻¹", insert: "acos(",  style: "func" },
  { label: "tan⁻¹", insert: "atan(",  style: "func" },
  { label: "log",   insert: "log10(", style: "func" },
  { label: "ln",    insert: "log(",   style: "func" },

  // Row 4 — 7 8 9 ÷ n!
  { label: "7",  insert: "7",  style: "num"  },
  { label: "8",  insert: "8",  style: "num"  },
  { label: "9",  insert: "9",  style: "num"  },
  { label: "÷",  insert: "/",  style: "op"   },
  { label: "n!", insert: "!",  style: "func" },

  // Row 5 — 4 5 6 × π
  { label: "4", insert: "4",  style: "num"  },
  { label: "5", insert: "5",  style: "num"  },
  { label: "6", insert: "6",  style: "num"  },
  { label: "×", insert: "*",  style: "op"   },
  { label: "π", insert: "pi", style: "func" },

  // Row 6 — 1 2 3 − e
  { label: "1", insert: "1", style: "num"  },
  { label: "2", insert: "2", style: "num"  },
  { label: "3", insert: "3", style: "num"  },
  { label: "−", insert: "-", style: "op"   },
  { label: "e", insert: "e", style: "func" },

  // Row 7 — i 0 . + =
  { label: "i", action: "i", style: "func"   },
  { label: "0",   insert: "0",   style: "num"    },
  { label: ".",   insert: ".",   style: "num"    },
  { label: "+",   insert: "+",   style: "op"     },
  { label: "=",   action: "=",   style: "equals" },
];

const BTN_STYLE: Record<BtnStyle, string> = {
  num:    "bg-surface text-foreground hover:bg-surface-elevated",
  op:     "bg-surface text-primary hover:bg-primary/5",
  func:   "bg-surface-muted text-foreground-muted hover:text-foreground hover:bg-surface-elevated",
  equals: "bg-primary text-white hover:bg-primary-hover",
  mode:   "bg-surface-muted text-accent font-semibold hover:bg-accent/10",
  danger: "bg-surface-muted hover:border hover:border-primary text-foreground-muted hover:text-primary",
};

// Larger text for number rows, smaller for function rows
const BTN_TEXT: Record<BtnStyle, string> = {
  num:    "text-xl",
  op:     "text-xl",
  func:   "text-[13px]",
  equals: "text-xl",
  mode:   "text-[12px] tracking-wide",
  danger: "text-sm",
};

// ── Component ──────────────────────────────────────────────────────────────────

export function ScientificCalculator() {
  const [input, setInput]   = useState("");
  const [mode, setMode]     = useState<AngleMode>("DEG");
  const [ans, setAns]       = useState("0");
  // After pressing =, preserve what was evaluated for display
  const [history, setHistory] = useState<{ expr: string; result: string } | null>(null);
  const [shake, setShake]   = useState(false);
  const exprScrollRef = useRef<HTMLDivElement>(null);

  // What's visible to evaluate: if in result state, user is viewing result; input shows next
  const liveResult = computeResult(input, mode);
  const displayExpr = toDisplay(input);

  // Scroll expression to end as it grows
  useEffect(() => {
    const el = exprScrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [input]);

  // ── Button press logic ───────────────────────────────────────────────────────

  const press = useCallback(
    (btn: Btn) => {
      const a = btn.action;

      if (a) {
        switch (a) {
          case "C":
            setInput("");
            setHistory(null);
            break;

          case "DEL":
            if (history) {
              // DEL in result state clears fully
              setInput("");
              setHistory(null);
            } else {
              setInput((prev) => {
                const tok = MULTI_TOKENS.find((t) => prev.endsWith(t));
                return tok ? prev.slice(0, -tok.length) : prev.slice(0, -1);
              });
            }
            break;

          case "=": {
            if (!input.trim()) return;
            const r = computeResult(input, mode);
            if (r && r !== "Error") {
              setHistory({ expr: input, result: r });
              setAns(r);
              setInput(r);
            } else {
              setShake(true);
              setTimeout(() => setShake(false), 400);
            }
            break;
          }

          case "MODE":
            setMode((m) => (m === "DEG" ? "RAD" : "DEG"));
            break;

          case "ANS":
            if (history) {
              setInput(ans);
              setHistory(null);
            } else {
              setInput((prev) => prev + ans);
            }
            break;
        }
      } else if (btn.insert !== undefined) {
        const isOperator = ["+", "-", "*", "/", "^"].includes(btn.insert);

        if (history) {
          // In result state: operators chain from ans; digits/functions start fresh
          if (isOperator) {
            setInput(ans + btn.insert);
          } else {
            setInput(btn.insert);
          }
          setHistory(null);
        } else {
          setInput((prev) => prev + btn.insert);
        }
      }
    },
    [input, mode, ans, history],
  );

  // ── Keyboard ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest?.("input,textarea")) return;
      if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        press({ action: "=" });
      } else if (e.key === "Backspace") {
        e.preventDefault();
        press({ action: "DEL" });
      } else if (e.key === "Escape" || e.key === "Delete") {
        e.preventDefault();
        press({ action: "C" });
      } else if (/^[0-9.+\-*/()^!]$/.test(e.key)) {
        e.preventDefault();
        press({ insert: e.key });
      } else if (e.key === "p") {
        e.preventDefault();
        press({ insert: "pi" });
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [press]);

  // ── Derived display state ────────────────────────────────────────────────────

  const inResultState = !!history && input === history.result;
  const resultValue   = inResultState ? history!.result : liveResult;
  const resultIsError = resultValue === "Error";

  // Pick font size for result based on length
  const resultLen = resultValue.length;
  const resultFont =
    resultLen > 16 ? "text-2xl"
    : resultLen > 12 ? "text-3xl"
    : resultLen > 8  ? "text-4xl"
    : "text-5xl";

  const visibleBtns = BTNS.map((b) =>
    b.action === "MODE" ? { ...b, label: mode } : b,
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="w-full space-y-px">

      {/* ── Display ─────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "w-full bg-surface-muted border transition-colors duration-150 select-none",
          shake ? "border-red-500/50" : "border-border",
        )}
      >
       
        {/* Expression line — current input, scrollable */}
        <div
          ref={exprScrollRef}
          className={cn(
            "px-5 pt-1 pb-1 pt-3 overflow-x-auto whitespace-nowrap text-right",
            "scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]",
            "[::-webkit-scrollbar]:hidden",
          )}
        >
          <span
            className={cn(
              "font-mono transition-colors",
              inResultState
                ? "text-base text-foreground-muted/50"
                : "text-base text-foreground-muted/70",
            )}
          >
            {displayExpr || (inResultState ? "" : " ")}
          </span>
        </div>

        {/* Result line — large, prominent */}
        <div className="px-5 pb-5 flex items-end justify-end min-h-16">
          {resultIsError ? (
            <div className="text-right">
              <span className="font-mono text-2xl text-red-400">Error</span>
              <p className="font-mono text-[10px] text-red-400/60 mt-0.5">
                invalid expression
              </p>
            </div>
          ) : (
            <span
              className={cn(
                "font-mono font-light leading-none tracking-tight transition-all duration-100",
                resultFont,
                inResultState ? "text-foreground" : resultValue ? "text-foreground/80" : "text-foreground-muted/20",
              )}
            >
              {inResultState
                ? resultValue
                : resultValue || (input ? "" : "0")}
            </span>
          )}
        </div>
      </div>

      {/* ── Keypad ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-px bg-border border border-border border-t-0">
        {visibleBtns.map((btn) => (
          <button
            key={btn.label + (btn.action ?? "") + (btn.insert ?? "")}
            onClick={() => press(btn)}
            className={cn(
              "font-mono py-4 transition-colors select-none active:opacity-50",
              BTN_STYLE[btn.style ?? "num"],
              BTN_TEXT[btn.style ?? "num"],
            )}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
