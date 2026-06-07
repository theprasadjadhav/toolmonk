"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { useCopyState } from "@/lib/hooks/useCopyState";
import { CopyButton } from "@/components/ui/CopyButton";
import {
  toggleBtnBase,
  toggleActiveCls,
  toggleInactiveCls,
  secondaryBtnCls,
  labelCls,
} from "@/lib/utils/formStyles";

// ── Word pools (large → infinite variety via random sampling) ─────────────────

type Difficulty = "easy" | "medium" | "hard";

const WORD_POOLS: Record<Difficulty, string[]> = {
  easy: [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "it", "for", "not", "on",
    "with", "he", "as", "you", "do", "at", "this", "but", "by", "from", "they", "we", "say",
    "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
    "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can",
    "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", "good",
    "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come",
    "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first",
    "well", "way", "even", "new", "want", "any", "these", "give", "day", "most", "us", "long",
    "big", "down", "did", "made", "may", "part", "find", "here", "tell", "where", "much",
    "before", "right", "too", "old", "very", "same", "both", "life", "keep", "place", "light",
    "head", "under", "never", "last", "next", "open", "seem", "often", "run", "home", "read",
    "hand", "large", "air", "land", "side", "put", "end", "does", "came", "set", "three",
    "small", "name", "off", "always", "move", "try", "kind", "hand", "play", "spell", "fast",
    "song", "call", "form", "lot", "eat", "stop", "face", "stop", "door", "real", "cut",
  ],
  medium: [
    "practice", "keyboard", "improve", "challenge", "morning", "between", "beyond", "connect",
    "develop", "forward", "garden", "instead", "journey", "language", "machine", "natural",
    "opinion", "patient", "quality", "reason", "silence", "thought", "through", "together",
    "useful", "version", "window", "without", "achieve", "almost", "already", "another",
    "because", "better", "change", "create", "culture", "decide", "during", "enough", "entire",
    "family", "figure", "finish", "follow", "forget", "future", "happen", "history", "however",
    "impact", "include", "indeed", "inside", "listen", "little", "manage", "market", "matter",
    "member", "method", "middle", "moment", "notice", "number", "object", "office", "online",
    "option", "order", "outside", "parent", "person", "picture", "player", "rather", "remain",
    "report", "result", "return", "review", "second", "series", "server", "simple", "single",
    "social", "source", "special", "system", "target", "teacher", "toward", "travel", "update",
    "value", "volume", "whether", "within", "wonder", "across", "action", "active", "actual",
    "answer", "around", "arrive", "aspect", "author", "career", "center", "choice", "common",
    "course", "custom", "design", "detail", "effect", "effort", "energy", "event", "global",
    "ground", "growth", "health", "higher", "itself", "latest", "longer", "master", "medium",
    "mental", "modern", "module", "nation", "normal", "output", "period", "policy", "pretty",
    "public", "reduce", "region", "render", "school", "senior", "signal", "skills", "speech",
    "strong", "studio", "supply", "though", "timing", "title", "truth", "trying", "unique",
    "until", "vision", "visual", "writer", "always", "budget", "camera", "define", "either",
    "follow", "gather", "handle", "island", "launch", "mirror", "opened", "places", "proved",
    "raised", "search", "theory", "unlike", "weight", "bridge", "choice", "direct", "fairly",
  ],
  hard: [
    "asynchronous", "authentication", "blockchain", "computational", "cryptographic",
    "decentralized", "deterministic", "encapsulation", "exponential", "functionality",
    "idempotent", "implementation", "infrastructure", "initialization", "microservices",
    "multiprocessor", "normalization", "optimization", "orchestration", "polymorphism",
    "preprocessing", "probabilistic", "pseudorandom", "refactoring", "serialization",
    "synchronization", "throughput", "transactional", "virtualization", "abstraction",
    "accumulator", "aggregation", "algorithmic", "allocation", "ambiguity", "annotation",
    "architecture", "arithmetic", "assertion", "atomicity", "availability", "benchmark",
    "bottleneck", "branching", "calibration", "capability", "categorize", "checkpoint",
    "coefficient", "complexity", "compression", "conditional", "configuration", "consistent",
    "constraint", "convergence", "correctness", "credentials", "cryptography", "debugging",
    "declaration", "decryption", "deployment", "deprecation", "derivative", "descriptor",
    "dictionary", "dispatcher", "distributed", "dynamically", "encryption", "enumerable",
    "environment", "evaluation", "exception", "executable", "expression", "extraction",
    "filesystem", "framework", "frequency", "generator", "granularity", "heuristic",
    "hierarchy", "immutable", "imperative", "injection", "interface", "interpreter",
    "iteration", "lifecycle", "limitation", "logarithm", "maintenance", "malicious",
    "mechanism", "middleware", "migration", "modularity", "monitoring", "namespace",
    "networking", "nullable", "overflow", "overloading", "pagination", "parallelism",
    "parameter", "partition", "performance", "persistence", "pipeline", "predicate",
    "primitive", "profiling", "prototype", "recursion", "redundancy", "reflection",
    "regression", "repository", "resilience", "resolution", "scalability", "scheduler",
    "semantics", "singleton", "streaming", "substring", "validation", "variables",
    "versioning", "vulnerability", "workload", "refactored", "benchmarked", "obfuscation",
  ],
};

// Numbers and symbols injected into Hard passages
const HARD_EXTRAS = ["42", "256", "1024", "3.14", "0xff", "99", "2048", "404", "503", "127"];

function generatePassage(difficulty: Difficulty): string {
  const pool = WORD_POOLS[difficulty];
  // Shuffle a copy so we get no consecutive repeats without full randomness loss
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const targetWords = difficulty === "easy" ? 55 : difficulty === "medium" ? 50 : 40;
  const words: string[] = [];

  for (let i = 0; i < targetWords; i++) {
    words.push(shuffled[i % shuffled.length]);
  }

  if (difficulty === "hard") {
    // Inject numbers every ~10 words
    for (let i = 9; i < words.length; i += 10) {
      words.splice(i, 0, HARD_EXTRAS[Math.floor(Math.random() * HARD_EXTRAS.length)]);
    }
  }

  return words.join(" ");
}

// ── Types & helpers ───────────────────────────────────────────────────────────

type Phase = "idle" | "active" | "done";
type Duration = 15 | 30 | 60 | 120;

function fmtTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function calcStats(input: string, passage: string, elapsed: number) {
  const correctChars = input.split("").filter((c, i) => c === passage[i]).length;
  const totalTyped = input.length;
  const mins = elapsed / 60;
  const wpm = mins > 0 ? Math.round((correctChars / 5) / mins) : 0;
  const rawWpm = mins > 0 ? Math.round((totalTyped / 5) / mins) : 0;
  const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;
  return { wpm, rawWpm, accuracy, correctChars, totalTyped };
}

function getGrade(wpm: number, accuracy: number): { label: string; color: string } {
  if (wpm >= 100 && accuracy >= 95) return { label: "S", color: "text-yellow-400 border-yellow-400/40 bg-yellow-400/10" };
  if (wpm >= 80 && accuracy >= 90)  return { label: "A", color: "text-green-400 border-green-400/40 bg-green-400/10" };
  if (wpm >= 60 && accuracy >= 85)  return { label: "B", color: "text-primary border-primary/40 bg-primary/10" };
  if (wpm >= 40)                    return { label: "C", color: "text-foreground-muted border-border bg-surface-muted" };
  return                                   { label: "D", color: "text-foreground-muted/50 border-border/50 bg-surface-muted/50" };
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TypingSpeedTest() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [duration, setDuration] = useState<Duration>(60);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  // Initialize empty — generated client-side in useEffect to avoid SSR/client mismatch
  const [passage, setPassage] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [stats, setStats] = useState({ wpm: 0, rawWpm: 0, accuracy: 100, correctChars: 0, totalTyped: 0 });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const { copied, copy } = useCopyState();

  // ── Timer ──
  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const endTest = useCallback((input: string, finalElapsed: number, pass: string) => {
    stopTimer();
    const finalStats = calcStats(input, pass, finalElapsed);
    setStats(finalStats);
    setElapsed(finalElapsed);
    setPhase("done");
  }, [stopTimer]);

  const startTimer = useCallback((dur: Duration, pass: string) => {
    startTimeRef.current = Date.now();
    setTimeLeft(dur);
    setElapsed(0);
    intervalRef.current = setInterval(() => {
      const elapsedSecs = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const left = Math.max(0, dur - elapsedSecs);
      setElapsed(elapsedSecs);
      setTimeLeft(left);
      if (left === 0) {
        stopTimer();
        setInputValue((cur) => {
          endTest(cur, dur, pass);
          return cur;
        });
      }
    }, 200);
  }, [stopTimer, endTest]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  // Generate initial passage on the client only (avoids SSR/hydration mismatch)
  useEffect(() => {
    setPassage(generatePassage("medium"));
  }, []);

  // ── Handlers ──
  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length > passage.length) return;

    if (phase === "idle" && val.length > 0) {
      setPhase("active");
      startTimer(duration, passage);
    }

    setInputValue(val);

    if (val.length === passage.length) {
      const elapsedSecs = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000));
      endTest(val, elapsedSecs, passage);
    }
  }, [phase, passage, duration, startTimer, endTest]);

  const resetState = useCallback((newPassage: string, dur: Duration) => {
    stopTimer();
    setPhase("idle");
    setInputValue("");
    setElapsed(0);
    setTimeLeft(dur);
    setStats({ wpm: 0, rawWpm: 0, accuracy: 100, correctChars: 0, totalTyped: 0 });
    setPassage(newPassage);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [stopTimer]);

  const handleReset = useCallback(() => resetState(passage, duration), [resetState, passage, duration]);
  const handleNew = useCallback(() => resetState(generatePassage(difficulty), duration), [resetState, difficulty, duration]);

  const handleDifficultyChange = useCallback((d: Difficulty) => {
    if (phase !== "idle") return;
    setDifficulty(d);
    resetState(generatePassage(d), duration);
  }, [phase, duration, resetState]);

  const handleDurationChange = useCallback((d: Duration) => {
    if (phase !== "idle") return;
    setDuration(d);
    setTimeLeft(d);
  }, [phase]);

  // Live stats
  const liveStats = phase === "active" ? calcStats(inputValue, passage, elapsed) : stats;
  const progress = passage.length > 0 ? Math.round((inputValue.length / passage.length) * 100) : 0;
  const grade = getGrade(stats.wpm, stats.accuracy);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">

      {/* ── Controls (hidden during active) ── */}
      {phase !== "active" && (
        <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
          <div>
            <div className={cn(labelCls, "mb-1.5")}>Duration</div>
            <div className="flex gap-1">
              {([15, 30, 60, 120] as Duration[]).map((d) => (
                <button key={d} onClick={() => handleDurationChange(d)}
                  className={cn(toggleBtnBase, duration === d ? toggleActiveCls : toggleInactiveCls)}>
                  {d}s
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className={cn(labelCls, "mb-1.5")}>Difficulty</div>
            <div className="flex gap-1">
              {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                <button key={d} onClick={() => handleDifficultyChange(d)}
                  className={cn(toggleBtnBase, difficulty === d ? toggleActiveCls : toggleInactiveCls)}>
                  {d[0].toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {phase === "idle" && (
            <button onClick={handleNew} className={cn(secondaryBtnCls, "mb-px")}>
              ↺ New
            </button>
          )}
        </div>
      )}

      {/* ── Live stats bar + progress (active phase) ── */}
      {phase === "active" && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "WPM",       value: liveStats.wpm },
              { label: "Accuracy",  value: `${liveStats.accuracy}%` },
              { label: "Time left", value: fmtTime(timeLeft) },
              { label: "Progress",  value: `${progress}%` },
            ].map(({ label, value }) => (
              <div key={label} className="border border-border bg-surface-muted px-3 py-2">
                <div className={labelCls}>{label}</div>
                <div className="font-mono text-xl font-bold tabular-nums text-foreground leading-tight">
                  {value}
                </div>
              </div>
            ))}
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-surface-muted border border-border overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Results panel ── */}
      {phase === "done" && (
        <div className="border border-border bg-surface-muted p-5 sm:p-6 space-y-5">

          {/* Top: WPM + Grade */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className={labelCls}>Words per minute</div>
              <div className="font-mono text-5xl sm:text-6xl font-bold tabular-nums text-foreground mt-0.5 leading-none">
                {stats.wpm}
              </div>
            </div>
            <div className={cn(
              "font-mono text-4xl sm:text-5xl font-bold border px-4 py-2 leading-none",
              grade.color
            )}>
              {grade.label}
            </div>
          </div>

          {/* Stat grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Accuracy",      value: `${stats.accuracy}%` },
              { label: "Raw WPM",       value: stats.rawWpm },
              { label: "Correct chars", value: `${stats.correctChars}/${stats.totalTyped}` },
              { label: "Time taken",    value: fmtTime(elapsed) },
            ].map(({ label, value }) => (
              <div key={label} className="border border-border bg-surface px-3 py-2.5">
                <div className={labelCls}>{label}</div>
                <div className="font-mono text-lg font-semibold tabular-nums text-foreground mt-0.5">
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2">
              <button onClick={handleReset} className={secondaryBtnCls}>Try Again</button>
              <button onClick={handleNew}   className={secondaryBtnCls}>New Test</button>
            </div>
            <CopyButton
              copied={copied === "result"}
              onClick={() => copy("result", `${stats.wpm} WPM · ${stats.accuracy}% accuracy`)}
              labelCopy="Copy result"
              labelCopied="Copied!"
            />
          </div>
        </div>
      )}

      {/* ── Passage typing area (idle + active) ── */}
      {phase !== "done" && (
        <div
          className={cn(
            "relative border bg-surface-muted cursor-text transition-colors",
            phase === "active" ? "border-foreground-muted/20" : "border-border"
          )}
          onClick={() => textareaRef.current?.focus()}
        >
          {/* Idle overlay prompt */}
          {phase === "idle" && (
            <div className="absolute inset-0 flex items-end justify-center pb-3 pointer-events-none z-10">
              <span className="font-mono text-[10px] text-foreground-muted/30 tracking-wider uppercase">
                click and start typing
              </span>
            </div>
          )}

          {/* Passage text with per-char highlighting */}
          <div
            className="font-mono text-base sm:text-lg leading-[2] p-5 sm:p-6 select-none break-words min-h-[120px]"
            aria-hidden="true"
          >
            {!passage && (
              <span className="text-foreground-muted/20">Loading…</span>
            )}
            {passage.split("").map((char, i) => {
              const isTyped   = i < inputValue.length;
              const isCorrect = isTyped && inputValue[i] === char;
              const isWrong   = isTyped && inputValue[i] !== char;
              const isCursor  = i === inputValue.length && phase === "active";
              return (
                <span
                  key={i}
                  className={cn(
                    isCorrect  && "text-foreground",
                    isWrong    && "text-red-400 bg-red-500/20",
                    !isTyped   && !isCursor && "text-foreground-muted/25",
                    isCursor   && "text-foreground-muted/25"
                  )}
                >
                  {isCursor && (
                    <span className="absolute inline-block w-[2px] h-[1.1em] -ml-px bg-primary animate-pulse translate-y-[0.15em]" />
                  )}
                  {char}
                </span>
              );
            })}
          </div>

          {/* Invisible overlay textarea — opacity-0 so NOTHING bleeds through */}
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInput}
            onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="absolute inset-0 w-full h-full resize-none opacity-0 cursor-text p-5 sm:p-6 outline-none"
            aria-label="Typing input"
          />
        </div>
      )}

      {/* ── Restart button during active ── */}
      {phase === "active" && (
        <div className="flex justify-end">
          <button onClick={handleReset} className={secondaryBtnCls}>↺ Restart</button>
        </div>
      )}

    </div>
  );
}
