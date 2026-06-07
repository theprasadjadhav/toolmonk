"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { useCopyState } from "@/lib/hooks/useCopyState";
import { CopyButton } from "@/components/ui/CopyButton";

// ── Word pools ────────────────────────────────────────────────────────────────
// Three tiers. Passages are always a *mixture* of tiers — the ratio shifts with
// difficulty so every level has glue words (the, and, a, in…) but the proportion
// of complex vocabulary increases progressively.

type Difficulty = "easy" | "medium" | "hard";

// Tier 1 — common glue & short words (always present in every difficulty)
const EASY_WORDS = [
  "the", "and", "a", "in", "of", "to", "it", "is", "be", "on",
  "for", "not", "with", "at", "as", "by", "or", "an", "we", "so",
  "if", "but", "do", "all", "up", "out", "he", "she", "they", "my",
  "one", "from", "this", "that", "have", "will", "can", "get", "go",
  "see", "say", "use", "set", "put", "run", "end", "try", "came", "did",
  "new", "old", "big", "long", "good", "well", "even", "just", "way",
  "day", "make", "take", "know", "keep", "find", "look", "move", "open",
  "give", "show", "work", "play", "read", "back", "down", "over", "also",
  "now", "then", "when", "here", "side", "last", "next", "same", "real",
  "part", "line", "time", "life", "home", "name", "turn", "face", "hand",
];

// Tier 2 — common prose words found in normal writing
const MEDIUM_WORDS = [
  "practice", "keyboard", "improve", "challenge", "morning", "between", "connect",
  "develop", "forward", "instead", "journey", "language", "natural", "opinion",
  "patient", "quality", "reason", "silence", "thought", "together", "useful",
  "version", "window", "without", "achieve", "already", "another", "because",
  "better", "change", "create", "culture", "decide", "during", "enough", "entire",
  "family", "finish", "follow", "forget", "future", "happen", "history", "however",
  "impact", "include", "indeed", "inside", "listen", "little", "manage", "market",
  "matter", "member", "method", "moment", "notice", "object", "office", "option",
  "outside", "person", "picture", "rather", "remain", "report", "result", "review",
  "second", "series", "simple", "single", "social", "source", "special", "system",
  "target", "teacher", "toward", "travel", "update", "value", "volume", "whether",
  "wonder", "action", "active", "answer", "around", "aspect", "author", "career",
  "center", "choice", "common", "course", "design", "detail", "effect", "effort",
  "energy", "global", "growth", "health", "latest", "mental", "modern", "nation",
  "normal", "output", "period", "policy", "public", "reduce", "region", "school",
  "signal", "skills", "speech", "strong", "supply", "timing", "truth", "unique",
  "vision", "visual", "writer", "launch", "search", "theory", "bridge", "gather",
  "either", "define", "mirror", "raised", "proved", "senior", "budget", "camera",
];

// Tier 3 — technical / complex vocabulary
const HARD_WORDS = [
  "asynchronous", "authentication", "computational", "cryptographic",
  "decentralized", "deterministic", "encapsulation", "functionality",
  "idempotent", "implementation", "infrastructure", "initialization",
  "microservices", "normalization", "optimization", "orchestration",
  "polymorphism", "preprocessing", "probabilistic", "pseudorandom",
  "refactoring", "serialization", "synchronization", "throughput",
  "transactional", "virtualization", "abstraction", "aggregation",
  "algorithmic", "allocation", "annotation", "architecture", "arithmetic",
  "assertion", "atomicity", "availability", "benchmark", "bottleneck",
  "calibration", "capability", "checkpoint", "coefficient", "complexity",
  "compression", "conditional", "configuration", "constraint", "convergence",
  "correctness", "credentials", "cryptography", "debugging", "declaration",
  "decryption", "deployment", "deprecation", "descriptor", "dispatcher",
  "distributed", "dynamically", "encryption", "enumerable", "environment",
  "evaluation", "exception", "executable", "extraction", "filesystem",
  "framework", "frequency", "generator", "granularity", "heuristic",
  "hierarchy", "immutable", "imperative", "injection", "interpreter",
  "iteration", "lifecycle", "limitation", "logarithm", "maintenance",
  "mechanism", "middleware", "migration", "modularity", "monitoring",
  "namespace", "networking", "overflow", "overloading", "pagination",
  "parallelism", "parameter", "partition", "persistence", "pipeline",
  "predicate", "primitive", "profiling", "prototype", "recursion",
  "redundancy", "reflection", "regression", "repository", "resilience",
  "scalability", "scheduler", "semantics", "singleton", "streaming",
  "validation", "versioning", "blockchain", "polymorphic",
];

// Proportion of [easy, medium, hard] words per difficulty level
const PROPORTIONS: Record<Difficulty, [number, number, number]> = {
  easy:   [0.72, 0.28, 0.00],   // casual reading — all common words
  medium: [0.22, 0.58, 0.20],   // professional prose — occasional hard word
  hard:   [0.10, 0.22, 0.68],   // technical writing — dense, but glue words still present
};

// Numbers that feel natural inline — round counts, percentages, decimals, years
const NUM_INSERTS = [
  "10", "25", "50", "100", "200", "500", "1000",
  "42", "99", "256", "404", "512",
  "3.14", "1.5", "2.5", "0.5",
  "50%", "25%", "75%", "90%",
  "2024", "2023",
];

// Words that naturally precede a comma in prose
const COMMA_TRIGGERS = new Set([
  "and", "but", "or", "so", "yet", "nor",
  "because", "however", "although", "while", "though",
  "since", "unless", "until", "whereas", "when", "if", "then",
  "after", "before", "as", "since",
]);

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generatePassage(difficulty: Difficulty, withPunct: boolean, withNums: boolean): string {
  const [ep, mp, hp] = PROPORTIONS[difficulty];
  // Word counts: easy passages are longer (short words), hard are shorter (long words)
  const total = difficulty === "easy" ? 62 : difficulty === "medium" ? 55 : 45;

  const ec = Math.round(total * ep);
  const mc = Math.round(total * mp);
  const hc = total - ec - mc;

  // Sample each tier independently then shuffle the combined list
  const words: string[] = shuffle([
    ...shuffle(EASY_WORDS).slice(0, ec),
    ...shuffle(MEDIUM_WORDS).slice(0, mc),
    ...shuffle(HARD_WORDS).slice(0, hc),
  ]);

  // Insert numbers at natural spacing (every 10–16 words)
  if (withNums) {
    let i = 8 + Math.floor(Math.random() * 6);
    while (i < words.length) {
      words.splice(i, 0, NUM_INSERTS[Math.floor(Math.random() * NUM_INSERTS.length)]);
      i += 10 + Math.floor(Math.random() * 6) + 1; // +1 accounts for the inserted word
    }
  }

  if (!withPunct) return words.join(" ");

  // ── Sentence-structure punctuation ────────────────────────────────────────
  // Group words into sentences → capitalize first word → add comma before a
  // conjunction → close with ./?/! so it reads like a real paragraph.
  const ENDERS = [".", ".", ".", ".", ".", "?", "?", "!"];
  const result: string[] = [];
  let i = 0;

  while (i < words.length) {
    const sentLen = 7 + Math.floor(Math.random() * 6); // 7–12 words per sentence
    const chunk = words.slice(i, Math.min(i + sentLen, words.length));
    i += sentLen;

    if (chunk.length === 0) break;

    // Capitalize first word of sentence
    chunk[0] = chunk[0][0].toUpperCase() + chunk[0].slice(1);

    // Add comma: search for a conjunction trigger in positions 2 to end-2
    let commaAdded = false;
    for (let j = 2; j < chunk.length - 1; j++) {
      if (COMMA_TRIGGERS.has(chunk[j])) {
        chunk[j - 1] += ",";
        commaAdded = true;
        break;
      }
    }
    // If no conjunction found and sentence is long, add comma at a natural mid-point
    if (!commaAdded && chunk.length >= 9) {
      const mid = 4 + Math.floor(Math.random() * 3); // position 4–6
      if (mid < chunk.length - 1) chunk[mid] += ",";
    }

    // Close sentence
    chunk[chunk.length - 1] += ENDERS[Math.floor(Math.random() * ENDERS.length)];

    result.push(...chunk);
  }

  return result.join(" ");
}

// ── Types & helpers ───────────────────────────────────────────────────────────

type Phase = "idle" | "active" | "done";
type Duration = 15 | 30 | 60 | 120;

function fmtTime(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function calcStats(input: string, passage: string, elapsed: number) {
  const correctChars = input.split("").filter((c, i) => c === passage[i]).length;
  const totalTyped = input.length;
  const mins = elapsed / 60;
  return {
    wpm: mins > 0 ? Math.round((correctChars / 5) / mins) : 0,
    rawWpm: mins > 0 ? Math.round((totalTyped / 5) / mins) : 0,
    accuracy: totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100,
    correctChars,
    totalTyped,
  };
}

const GRADE_SCALE = [
  { label: "S", desc: "Elite",      req: "≥100 wpm · ≥95% acc", cls: "text-yellow-400 border-yellow-400/40 bg-yellow-400/10" },
  { label: "A", desc: "Advanced",   req: "≥80 wpm · ≥90% acc",  cls: "text-green-400 border-green-400/40 bg-green-400/10" },
  { label: "B", desc: "Proficient", req: "≥60 wpm · ≥85% acc",  cls: "text-primary border-primary/40 bg-primary/10" },
  { label: "C", desc: "Average",    req: "≥40 wpm",              cls: "text-foreground-muted border-border bg-surface-muted" },
  { label: "D", desc: "Beginner",   req: "<40 wpm",              cls: "text-foreground-muted/50 border-border/50 bg-surface-muted/50" },
] as const;

function getGrade(wpm: number, accuracy: number) {
  if (wpm >= 100 && accuracy >= 95) return GRADE_SCALE[0];
  if (wpm >= 80  && accuracy >= 90) return GRADE_SCALE[1];
  if (wpm >= 60  && accuracy >= 85) return GRADE_SCALE[2];
  if (wpm >= 40)                    return GRADE_SCALE[3];
  return                                   GRADE_SCALE[4];
}

// ── Compact control button styles (smaller than toggleBtnBase) ────────────────
const ctrlBtn     = "font-mono text-xs border px-2.5 py-1 tracking-wide transition-colors duration-100 cursor-pointer select-none";
const ctrlActive  = "border-primary/50 bg-primary/10 text-primary";
const ctrlInactive = "border-border/40 text-foreground-muted/45 hover:text-foreground/80 hover:border-border/70";

// ── Component ─────────────────────────────────────────────────────────────────

export function TypingSpeedTest() {
  const [phase, setPhase]           = useState<Phase>("idle");
  const [duration, setDuration]     = useState<Duration>(60);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [withPunct, setWithPunct]   = useState(false);
  const [withNums, setWithNums]     = useState(false);
  const [passage, setPassage]       = useState<string>("");   // empty → generated client-side
  const [inputValue, setInputValue] = useState("");
  const [elapsed, setElapsed]       = useState(0);
  const [timeLeft, setTimeLeft]     = useState(60);
  const [stats, setStats]           = useState({ wpm: 0, rawWpm: 0, accuracy: 100, correctChars: 0, totalTyped: 0 });

  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const { copied, copy } = useCopyState();

  // ── Timer ──
  const stopTimer = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const endTest = useCallback((input: string, finalElapsed: number, pass: string) => {
    stopTimer();
    setStats(calcStats(input, pass, finalElapsed));
    setElapsed(finalElapsed);
    setPhase("done");
  }, [stopTimer]);

  const startTimer = useCallback((dur: Duration, pass: string) => {
    startTimeRef.current = Date.now();
    setTimeLeft(dur);
    setElapsed(0);
    intervalRef.current = setInterval(() => {
      const el   = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const left = Math.max(0, dur - el);
      setElapsed(el);
      setTimeLeft(left);
      if (left === 0) {
        stopTimer();
        setInputValue((cur) => { endTest(cur, dur, pass); return cur; });
      }
    }, 200);
  }, [stopTimer, endTest]);

  // Cleanup + initial passage + auto-focus
  useEffect(() => () => stopTimer(), [stopTimer]);
  useEffect(() => {
    setPassage(generatePassage("medium", false, false));
    // Small delay so the DOM is ready before focus
    const t = setTimeout(() => textareaRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  // ── Word-level data — memoized so cursor changes don't recompute layout ──
  const wordData = useMemo(() => {
    if (!passage) return [];
    const words = passage.split(" ");
    let pos = 0;
    return words.map((word, wi) => {
      const start = pos;
      // +1 for the space after word (except last word)
      pos += word.length + (wi < words.length - 1 ? 1 : 0);
      return { word, start, spaceIdx: start + word.length, isLast: wi === words.length - 1 };
    });
  }, [passage]);

  // ── Render a single character — absolute cursor = zero layout impact ──
  const renderChar = useCallback((char: string, i: number, key: string | number) => {
    const isTyped   = i < inputValue.length;
    const isCorrect = isTyped && inputValue[i] === char;
    const isWrong   = isTyped && inputValue[i] !== char;
    const isCursor  = i === inputValue.length && phase !== "done";
    // Wrong space → middle-dot so the error is visible
    const display = isWrong && char === " " ? "·" : char;
    return (
      <span key={key} className="relative">
        {isCursor && (
          <span
            className="absolute -left-[1px] top-[0.06em] w-[2px] h-[1em] bg-primary animate-cursor-blink pointer-events-none"
            aria-hidden="true"
          />
        )}
        <span className={cn(
          "transition-colors duration-75",
          isCorrect && "text-foreground",
          isWrong   && char !== " " && "text-red-400",
          isWrong   && char === " " && "text-red-400",
          !isTyped  && "text-foreground-muted/25",
        )}>
          {display}
        </span>
      </span>
    );
  }, [inputValue, phase]);

  // ── Handlers ──
  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length > passage.length) return;
    if (phase === "idle" && val.length > 0) { setPhase("active"); startTimer(duration, passage); }
    setInputValue(val);
    if (val.length === passage.length) {
      endTest(val, Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000)), passage);
    }
  }, [phase, passage, duration, startTimer, endTest]);

  const resetState = useCallback((newPassage: string, dur: Duration) => {
    stopTimer();
    setPhase("idle"); setInputValue(""); setElapsed(0); setTimeLeft(dur);
    setStats({ wpm: 0, rawWpm: 0, accuracy: 100, correctChars: 0, totalTyped: 0 });
    setPassage(newPassage);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [stopTimer]);

  const handleReset = useCallback(() => resetState(passage, duration), [resetState, passage, duration]);
  const handleNew   = useCallback(() => resetState(generatePassage(difficulty, withPunct, withNums), duration), [resetState, difficulty, duration, withPunct, withNums]);

  const handleDifficulty = useCallback((d: Difficulty) => {
    if (phase !== "idle") return;
    setDifficulty(d);
    resetState(generatePassage(d, withPunct, withNums), duration);
  }, [phase, duration, withPunct, withNums, resetState]);

  const handleDuration = useCallback((d: Duration) => {
    if (phase !== "idle") return;
    setDuration(d);
    setTimeLeft(d);
  }, [phase]);

  const togglePunct = useCallback(() => {
    if (phase !== "idle") return;
    setWithPunct((prev) => {
      const next = !prev;
      setPassage(generatePassage(difficulty, next, withNums));
      return next;
    });
  }, [phase, difficulty, withNums]);

  const toggleNums = useCallback(() => {
    if (phase !== "idle") return;
    setWithNums((prev) => {
      const next = !prev;
      setPassage(generatePassage(difficulty, withPunct, next));
      return next;
    });
  }, [phase, difficulty, withPunct]);

  const liveStats = phase === "active" ? calcStats(inputValue, passage, elapsed) : stats;
  const progress  = passage.length > 0 ? (inputValue.length / passage.length) * 100 : 0;
  const grade     = getGrade(stats.wpm, stats.accuracy);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* ── Controls: single compact bar, no label headings ── */}
      {phase !== "active" && (
        <div className="flex flex-wrap items-center gap-1">
          {([15, 30, 60, 120] as Duration[]).map((d) => (
            <button key={d} onClick={() => handleDuration(d)}
              className={cn(ctrlBtn, duration === d ? ctrlActive : ctrlInactive)}>
              {d}s
            </button>
          ))}

          <span className="w-px h-3.5 bg-border/40 mx-0.5 shrink-0" aria-hidden="true" />

          {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
            <button key={d} onClick={() => handleDifficulty(d)}
              className={cn(ctrlBtn, difficulty === d ? ctrlActive : ctrlInactive)}>
              {d}
            </button>
          ))}

          <span className="w-px h-3.5 bg-border/40 mx-0.5 shrink-0" aria-hidden="true" />

          <button onClick={togglePunct} className={cn(ctrlBtn, withPunct ? ctrlActive : ctrlInactive)}>@ punct</button>
          <button onClick={toggleNums}  className={cn(ctrlBtn, withNums  ? ctrlActive : ctrlInactive)}># nums</button>

          {phase === "idle" && (
            <>
              <span className="w-px h-3.5 bg-border/40 mx-0.5 shrink-0" aria-hidden="true" />
              <button onClick={handleNew} className={cn(ctrlBtn, ctrlInactive)}>↺ new</button>
            </>
          )}
        </div>
      )}

      {/* ── Divider ── */}
      {phase !== "active" && <div className="border-t border-border/40" />}

      {/* ── Active HUD ── */}
      {phase === "active" && (
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-4xl sm:text-5xl font-bold tabular-nums text-primary leading-none">
                {fmtTime(timeLeft)}
              </span>
              <span className="font-mono text-sm tabular-nums text-foreground-muted/50">
                {liveStats.wpm}<span className="text-[11px] ml-0.5">wpm</span>
              </span>
              <span className="font-mono text-sm tabular-nums text-foreground-muted/30">
                {liveStats.accuracy}<span className="text-[11px] ml-0.5">%</span>
              </span>
            </div>
            <button onClick={handleReset} className={cn(ctrlBtn, ctrlInactive)}>↺ restart</button>
          </div>
          <div className="h-px bg-foreground-muted/10 overflow-hidden">
            <div className="h-full bg-primary/50 transition-all duration-150" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {phase === "done" && (
        <div className="space-y-5 pt-1">

          {/* Hero row: WPM left, grade right */}
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] text-foreground-muted/35 tracking-widest uppercase mb-1.5">
                words per minute
              </div>
              <div className="font-mono text-6xl sm:text-7xl font-bold tabular-nums text-foreground leading-none">
                {stats.wpm}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5 pb-0.5">
              <div className={cn("font-mono text-4xl sm:text-5xl font-bold leading-none border px-3 py-1.5", grade.cls)}>
                {grade.label}
              </div>
              <div className="font-mono text-[10px] tracking-widest uppercase text-foreground-muted/40">
                {grade.desc}
              </div>
            </div>
          </div>

          {/* Stats: unified bordered strip, divide on larger screens */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border border-border/40 divide-y sm:divide-y-0 sm:divide-x divide-border/40">
            {[
              { label: "accuracy",      value: `${stats.accuracy}%` },
              { label: "raw wpm",       value: String(stats.rawWpm) },
              { label: "correct chars", value: `${stats.correctChars}/${stats.totalTyped}` },
              { label: "time taken",    value: fmtTime(elapsed) },
            ].map(({ label, value }) => (
              <div key={label} className="px-4 py-3">
                <div className="font-mono text-[10px] text-foreground-muted/35 tracking-widest uppercase">
                  {label}
                </div>
                <div className="font-mono text-xl font-semibold tabular-nums text-foreground mt-1 leading-none">
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-1.5">
              <button onClick={handleReset} className={cn(ctrlBtn, ctrlInactive, "px-4 py-1.5")}>Try Again</button>
              <button onClick={handleNew}   className={cn(ctrlBtn, ctrlInactive, "px-4 py-1.5")}>New Test</button>
            </div>
            <CopyButton
              copied={copied === "result"}
              onClick={() => copy("result", `${stats.wpm} WPM · ${stats.accuracy}% accuracy`)}
              labelCopy="Copy result" labelCopied="Copied!"
            />
          </div>

          {/* Grade scale */}
          <div className="border-t border-border/25 pt-3">
            <div className="font-mono text-[10px] text-foreground-muted/30 tracking-widest uppercase mb-2.5">
              grade scale
            </div>
            <div className="space-y-1.5">
              {GRADE_SCALE.map((g) => {
                const isCurrent = g.label === grade.label;
                return (
                  <div key={g.label} className={cn(
                    "flex items-center gap-3 font-mono text-xs",
                    isCurrent ? "text-primary" : "text-foreground-muted/25",
                  )}>
                    <span className="font-bold w-4 shrink-0">{g.label}</span>
                    <span className="w-20 shrink-0">{g.desc}</span>
                    <span className={cn(
                      "ml-auto tabular-nums text-[11px]",
                      isCurrent ? "text-primary/60" : "text-foreground-muted/18",
                    )}>
                      {g.req}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ── Typing area ── */}
      {phase !== "done" && (
        <div
          className="relative cursor-text py-6 sm:py-8"
          onClick={() => textareaRef.current?.focus()}
        >
          <div
            className="font-mono text-xl sm:text-2xl leading-[2.4] select-none"
            aria-hidden="true"
          >
            {!passage && <span className="text-foreground-muted/15">·</span>}
            {wordData.map(({ word, start, spaceIdx, isLast }) => (
              <span key={start}>
                <span className="inline-block whitespace-nowrap">
                  {word.split("").map((char, ci) => renderChar(char, start + ci, ci))}
                </span>
                {!isLast && renderChar(" ", spaceIdx, "space")}
              </span>
            ))}
            {passage.length > 0 && inputValue.length >= passage.length && (
              <span className="relative inline-block w-0">
                <span className="absolute -left-[1px] top-[0.06em] w-[2px] h-[1em] bg-primary animate-cursor-blink pointer-events-none" aria-hidden="true" />
              </span>
            )}
          </div>

          {phase === "idle" && passage && (
            <p className="font-mono text-[10px] text-foreground-muted/25 tracking-widest uppercase mt-5">
              start typing to begin
            </p>
          )}

          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInput}
            onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
            className="absolute inset-0 w-full h-full resize-none opacity-0 cursor-text outline-none"
            aria-label="Typing input"
          />
        </div>
      )}

    </div>
  );
}
