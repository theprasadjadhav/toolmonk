"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
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

// ── Word pools ────────────────────────────────────────────────────────────────

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
    "small", "name", "off", "always", "move", "try", "kind", "play", "fast", "song", "call",
    "door", "real", "cut", "fire", "line", "city", "tree", "room", "face", "book", "easy",
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
    "strong", "studio", "supply", "though", "timing", "title", "truth", "unique", "until",
    "vision", "visual", "writer", "budget", "camera", "define", "either", "gather", "handle",
    "island", "launch", "mirror", "places", "proved", "raised", "search", "theory", "bridge",
  ],
  hard: [
    "asynchronous", "authentication", "blockchain", "computational", "cryptographic",
    "decentralized", "deterministic", "encapsulation", "exponential", "functionality",
    "idempotent", "implementation", "infrastructure", "initialization", "microservices",
    "normalization", "optimization", "orchestration", "polymorphism", "preprocessing",
    "probabilistic", "pseudorandom", "refactoring", "serialization", "synchronization",
    "throughput", "transactional", "virtualization", "abstraction", "accumulator",
    "aggregation", "algorithmic", "allocation", "ambiguity", "annotation", "architecture",
    "arithmetic", "assertion", "atomicity", "availability", "benchmark", "bottleneck",
    "calibration", "capability", "categorize", "checkpoint", "coefficient", "complexity",
    "compression", "conditional", "configuration", "consistent", "constraint", "convergence",
    "correctness", "credentials", "cryptography", "debugging", "declaration", "decryption",
    "deployment", "deprecation", "derivative", "descriptor", "dictionary", "dispatcher",
    "distributed", "dynamically", "encryption", "enumerable", "environment", "evaluation",
    "exception", "executable", "expression", "extraction", "filesystem", "framework",
    "frequency", "generator", "granularity", "heuristic", "hierarchy", "immutable",
    "imperative", "injection", "interface", "interpreter", "iteration", "lifecycle",
    "limitation", "logarithm", "maintenance", "malicious", "mechanism", "middleware",
    "migration", "modularity", "monitoring", "namespace", "networking", "overflow",
    "overloading", "pagination", "parallelism", "parameter", "partition", "persistence",
    "pipeline", "predicate", "primitive", "profiling", "prototype", "recursion", "redundancy",
    "reflection", "regression", "repository", "resilience", "resolution", "scalability",
    "scheduler", "semantics", "singleton", "streaming", "validation", "versioning",
  ],
};

const PUNCT_MARKS = [",", ".", "!", "?", ";", ":"];
const NUM_INSERTS = ["42", "256", "1024", "3.14", "99", "2048", "404", "127", "512", "64"];

function generatePassage(difficulty: Difficulty, withPunct: boolean, withNums: boolean): string {
  const pool = [...WORD_POOLS[difficulty]].sort(() => Math.random() - 0.5);
  const count = difficulty === "easy" ? 55 : difficulty === "medium" ? 48 : 38;
  const words: string[] = [];
  for (let i = 0; i < count; i++) words.push(pool[i % pool.length]);

  // Hard always includes some numbers regardless of toggle
  if (difficulty === "hard") {
    for (let i = 9; i < words.length; i += 10) {
      words.splice(i, 0, NUM_INSERTS[Math.floor(Math.random() * NUM_INSERTS.length)]);
    }
  }

  // Optional punctuation: append to random words every 4–8 words
  if (withPunct) {
    let next = 4 + Math.floor(Math.random() * 4);
    for (let i = next; i < words.length; i += 4 + Math.floor(Math.random() * 4)) {
      const mark = PUNCT_MARKS[Math.floor(Math.random() * PUNCT_MARKS.length)];
      words[i] = words[i] + mark;
    }
  }

  // Optional numbers: insert a number every 8–12 words
  if (withNums && difficulty !== "hard") {
    let i = 7 + Math.floor(Math.random() * 5);
    while (i < words.length) {
      words.splice(i, 0, NUM_INSERTS[Math.floor(Math.random() * NUM_INSERTS.length)]);
      i += 8 + Math.floor(Math.random() * 5);
    }
  }

  return words.join(" ");
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

function getGrade(wpm: number, accuracy: number) {
  if (wpm >= 100 && accuracy >= 95) return { label: "S", cls: "text-yellow-400 border-yellow-400/40 bg-yellow-400/10" };
  if (wpm >= 80  && accuracy >= 90) return { label: "A", cls: "text-green-400 border-green-400/40 bg-green-400/10" };
  if (wpm >= 60  && accuracy >= 85) return { label: "B", cls: "text-primary border-primary/40 bg-primary/10" };
  if (wpm >= 40)                    return { label: "C", cls: "text-foreground-muted border-border bg-surface-muted" };
  return                                   { label: "D", cls: "text-foreground-muted/50 border-border/50 bg-surface-muted/50" };
}

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

      {/* ── Controls — idle + done only ── */}
      {phase !== "active" && (
        <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
          <div>
            <div className={cn(labelCls, "mb-1.5")}>Duration</div>
            <div className="flex gap-1">
              {([15, 30, 60, 120] as Duration[]).map((d) => (
                <button key={d} onClick={() => handleDuration(d)}
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
                <button key={d} onClick={() => handleDifficulty(d)}
                  className={cn(toggleBtnBase, difficulty === d ? toggleActiveCls : toggleInactiveCls)}>
                  {d[0].toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className={cn(labelCls, "mb-1.5")}>Options</div>
            <div className="flex gap-1">
              <button onClick={togglePunct}
                className={cn(toggleBtnBase, withPunct ? toggleActiveCls : toggleInactiveCls)}>
                @ punctuation
              </button>
              <button onClick={toggleNums}
                className={cn(toggleBtnBase, withNums ? toggleActiveCls : toggleInactiveCls)}>
                # numbers
              </button>
            </div>
          </div>
          {phase === "idle" && (
            <button onClick={handleNew} className={cn(secondaryBtnCls, "mb-px")}>↺ New</button>
          )}
        </div>
      )}

      {/* ── Divider below controls ── */}
      {phase !== "active" && <div className="border-t border-border/50" />}

      {/* ── Active HUD: large countdown + wpm + restart ── */}
      {phase === "active" && (
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <div className="flex items-baseline gap-5">
              <span className="font-mono text-4xl sm:text-5xl font-bold tabular-nums text-primary leading-none">
                {fmtTime(timeLeft)}
              </span>
              <span className="font-mono text-base tabular-nums text-foreground-muted/60">
                {liveStats.wpm}<span className="text-[11px] ml-0.5">wpm</span>
              </span>
              <span className="font-mono text-base tabular-nums text-foreground-muted/35">
                {liveStats.accuracy}<span className="text-[11px] ml-0.5">%</span>
              </span>
            </div>
            <button onClick={handleReset} className={secondaryBtnCls}>↺ Restart</button>
          </div>
          {/* Thin progress line */}
          <div className="h-[2px] bg-foreground-muted/10 overflow-hidden">
            <div className="h-full bg-primary/60 transition-all duration-150" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {phase === "done" && (
        <div className="border border-border bg-surface-muted p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className={labelCls}>Words per minute</div>
              <div className="font-mono text-5xl sm:text-6xl font-bold tabular-nums text-foreground mt-0.5 leading-none">
                {stats.wpm}
              </div>
            </div>
            <div className={cn("font-mono text-4xl sm:text-5xl font-bold border px-4 py-2 leading-none", grade.cls)}>
              {grade.label}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Accuracy",      value: `${stats.accuracy}%` },
              { label: "Raw WPM",       value: stats.rawWpm },
              { label: "Correct chars", value: `${stats.correctChars}/${stats.totalTyped}` },
              { label: "Time taken",    value: fmtTime(elapsed) },
            ].map(({ label, value }) => (
              <div key={label} className="border border-border bg-surface px-3 py-2.5">
                <div className={labelCls}>{label}</div>
                <div className="font-mono text-lg font-semibold tabular-nums text-foreground mt-0.5">{value}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2">
              <button onClick={handleReset} className={secondaryBtnCls}>Try Again</button>
              <button onClick={handleNew}   className={secondaryBtnCls}>New Test</button>
            </div>
            <CopyButton
              copied={copied === "result"}
              onClick={() => copy("result", `${stats.wpm} WPM · ${stats.accuracy}% accuracy`)}
              labelCopy="Copy result" labelCopied="Copied!"
            />
          </div>
        </div>
      )}

      {/* ── Typing area — open text, no border box (Monkeytype style) ── */}
      {phase !== "done" && (
        <div
          className="relative cursor-text py-6 sm:py-8"
          onClick={() => textareaRef.current?.focus()}
        >
          {/* Passage — word-level rendering prevents reflow */}
          <div
            className="font-mono text-xl sm:text-2xl leading-[2.4] select-none"
            aria-hidden="true"
          >
            {!passage && <span className="text-foreground-muted/15">·</span>}
            {wordData.map(({ word, start, spaceIdx, isLast }) => (
              <span key={start}>
                {/* Each word is inline-block + nowrap so it never breaks mid-word */}
                <span className="inline-block whitespace-nowrap">
                  {word.split("").map((char, ci) => renderChar(char, start + ci, ci))}
                </span>
                {/* Space after word (except last) — rendered separately so it CAN wrap */}
                {!isLast && renderChar(" ", spaceIdx, "space")}
              </span>
            ))}
            {/* Cursor pinned at very end (after last char) */}
            {passage.length > 0 && inputValue.length >= passage.length && (
              <span className="relative inline-block w-0">
                <span className="absolute -left-[1px] top-[0.06em] w-[2px] h-[1em] bg-primary animate-cursor-blink pointer-events-none" aria-hidden="true" />
              </span>
            )}
          </div>

          {/* Idle hint */}
          {phase === "idle" && passage && (
            <p className="font-mono text-[10px] text-foreground-muted/25 tracking-widest uppercase mt-5">
              click here and start typing
            </p>
          )}

          {/* Invisible textarea — opacity-0, captures all keyboard input */}
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
