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

// ── Passages ──────────────────────────────────────────────────────────────────

type Difficulty = "easy" | "medium" | "hard";

const PASSAGES: Record<Difficulty, string[]> = {
  easy: [
    "The sun came up over the hill and lit the whole town with a warm golden light. Birds sang in the trees and children ran out to play in the yard. It was a good day to be outside.",
    "She picked up the pen and wrote a short note to her friend. The words came easily, one after the other, until the page was full. She folded it and put it in an envelope.",
    "He walked to the shop on the corner to buy some milk and bread. The man at the till smiled and said good morning. He paid and walked back home in the cool air.",
    "The dog ran across the green field and barked at the birds in the sky. Its tail wagged fast as it leapt through the long grass. It was happy to be free and in the sun.",
    "They sat at the big round table and ate a hot meal together. The food was simple but good, and they talked and laughed for a long time. It felt nice to share a meal as a family.",
    "The rain fell softly on the roof all night long. She lay in bed and listened to the sound it made. In the morning the ground was wet and the air smelt clean and fresh.",
  ],
  medium: [
    "Typing speed is measured in words per minute, where each word is defined as five keystrokes. This standardised unit allows fair comparison across different text lengths and languages. Regular practice on varied passages is the most effective way to raise your baseline speed.",
    "The ability to type without looking at the keyboard — often called touch typing — is one of the highest-return skills a knowledge worker can develop. It frees mental bandwidth for thinking rather than hunting keys, and compounds in value over a career spanning decades.",
    "Version control systems track every change made to a file over time, allowing teams to collaborate without overwriting each other's work. Each commit is a snapshot of the project at a moment in time, complete with a message explaining what changed and why.",
    "A well-designed user interface reduces the cognitive load placed on the person using it. Clear labels, consistent behaviour, and immediate feedback all contribute to an experience that feels intuitive. The best interfaces are invisible — they get out of the way.",
    "The speed of light in a vacuum is exactly 299,792,458 metres per second. Nothing with mass can reach this speed, though particles of light — photons — travel at it constantly. This value is so fundamental that it now defines the metre itself.",
    "Compound interest grows wealth exponentially rather than linearly. A sum invested at a constant annual return doubles roughly every 72 divided by the interest rate years — a rule of thumb known as the Rule of 72. Starting early matters far more than the amount invested.",
  ],
  hard: [
    "Asymptotic complexity — expressed in Big-O notation — describes how an algorithm's runtime or memory usage scales as the input size n approaches infinity. O(n log n) sorts like merge-sort outperform O(n²) algorithms on large datasets, even if their constant factors are higher.",
    "Electroencephalography (EEG) records electrical activity across the scalp to infer neural dynamics. Delta waves (0.5–4 Hz) dominate deep sleep; theta (4–8 Hz) signals drowsiness; alpha (8–13 Hz) reflects relaxed wakefulness; gamma (>30 Hz) is associated with high-level cognition.",
    "The Doppler effect causes an observed frequency shift when source and observer move relative to each other: f' = f × (v ± vₒ) / (v ∓ vₛ), where v is the wave speed, vₒ is observer velocity, and vₛ is source velocity. Red-shift in astronomy uses this principle at cosmological scales.",
    "Cryptographic hash functions — SHA-256, SHA-3, BLAKE3 — must satisfy collision resistance, pre-image resistance, and second pre-image resistance. A single-bit change in the input produces a completely different 256-bit digest, a property called the avalanche effect.",
    "TCP's congestion control employs slow-start, congestion avoidance, fast retransmit, and fast recovery phases. The congestion window (cwnd) doubles every RTT during slow-start until it exceeds the slow-start threshold (ssthresh), after which it grows linearly by one MSS per RTT.",
    "Bayesian inference updates a prior probability distribution P(H) with observed evidence E to produce a posterior via Bayes' theorem: P(H|E) = P(E|H) × P(H) / P(E). The denominator P(E) serves as a normalising constant ensuring probabilities sum to 1.",
  ],
};

// ── Types & helpers ───────────────────────────────────────────────────────────

type Phase = "idle" | "active" | "done";
type Duration = 15 | 30 | 60 | 120;

function randomPassage(difficulty: Difficulty, exclude?: number): { text: string; index: number } {
  const pool = PASSAGES[difficulty];
  let idx = Math.floor(Math.random() * pool.length);
  if (exclude !== undefined && pool.length > 1) {
    while (idx === exclude) idx = Math.floor(Math.random() * pool.length);
  }
  return { text: pool[idx], index: idx };
}

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

// ── Component ─────────────────────────────────────────────────────────────────

export function TypingSpeedTest() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [duration, setDuration] = useState<Duration>(60);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [passageData, setPassageData] = useState<{ text: string; index: number }>(() =>
    randomPassage("medium")
  );
  const [inputValue, setInputValue] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [stats, setStats] = useState({ wpm: 0, rawWpm: 0, accuracy: 100, correctChars: 0, totalTyped: 0 });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const { copied, copy } = useCopyState();

  const passage = passageData.text;

  // ── Timer ──
  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const endTest = useCallback((input: string, finalElapsed: number) => {
    stopTimer();
    const finalStats = calcStats(input, passage, finalElapsed);
    setStats(finalStats);
    setPhase("done");
  }, [stopTimer, passage]);

  const startTimer = useCallback((dur: Duration) => {
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
          const finalElapsed = dur;
          endTest(cur, finalElapsed);
          return cur;
        });
      }
    }, 250);
  }, [stopTimer, endTest]);

  // Cleanup on unmount
  useEffect(() => () => stopTimer(), [stopTimer]);

  // ── Handlers ──
  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    // Prevent typing past end of passage
    if (val.length > passage.length) return;

    if (phase === "idle" && val.length > 0) {
      setPhase("active");
      startTimer(duration);
    }

    setInputValue(val);

    // Check completion
    if (val.length === passage.length) {
      const elapsedSecs = Math.floor((Date.now() - startTimeRef.current) / 1000);
      endTest(val, Math.max(1, elapsedSecs));
    }
  }, [phase, passage, duration, startTimer, endTest]);

  const handleReset = useCallback(() => {
    stopTimer();
    setPhase("idle");
    setInputValue("");
    setElapsed(0);
    setTimeLeft(duration);
    setStats({ wpm: 0, rawWpm: 0, accuracy: 100, correctChars: 0, totalTyped: 0 });
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [stopTimer, duration]);

  const handleNew = useCallback(() => {
    stopTimer();
    const next = randomPassage(difficulty, passageData.index);
    setPassageData(next);
    setPhase("idle");
    setInputValue("");
    setElapsed(0);
    setTimeLeft(duration);
    setStats({ wpm: 0, rawWpm: 0, accuracy: 100, correctChars: 0, totalTyped: 0 });
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [stopTimer, difficulty, passageData.index, duration]);

  const handleDifficultyChange = useCallback((d: Difficulty) => {
    if (phase !== "idle") return;
    setDifficulty(d);
    const next = randomPassage(d);
    setPassageData(next);
    setInputValue("");
    setTimeLeft(duration);
  }, [phase, duration]);

  const handleDurationChange = useCallback((d: Duration) => {
    if (phase !== "idle") return;
    setDuration(d);
    setTimeLeft(d);
  }, [phase]);

  const focusTextarea = useCallback(() => {
    textareaRef.current?.focus();
  }, []);

  // Live stats during active phase
  const liveStats = phase === "active"
    ? calcStats(inputValue, passage, elapsed)
    : stats;

  const progress = passage.length > 0
    ? Math.round((inputValue.length / passage.length) * 100)
    : 0;

  const copyText = `${stats.wpm} WPM · ${stats.accuracy}% accuracy`;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* ── Mode selectors (hidden while active) ── */}
      {phase !== "active" && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div>
            <div className={cn(labelCls, "mb-1.5")}>Duration</div>
            <div className="flex gap-1">
              {([15, 30, 60, 120] as Duration[]).map((d) => (
                <button
                  key={d}
                  onClick={() => handleDurationChange(d)}
                  className={cn(toggleBtnBase, duration === d ? toggleActiveCls : toggleInactiveCls)}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className={cn(labelCls, "mb-1.5")}>Difficulty</div>
            <div className="flex gap-1">
              {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => handleDifficultyChange(d)}
                  className={cn(toggleBtnBase, difficulty === d ? toggleActiveCls : toggleInactiveCls)}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Stats bar (hidden while idle) ── */}
      {phase !== "idle" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "WPM", value: liveStats.wpm },
            { label: "Accuracy", value: `${liveStats.accuracy}%` },
            { label: "Time", value: phase === "active" ? fmtTime(timeLeft) : fmtTime(elapsed) },
            { label: "Progress", value: `${progress}%` },
          ].map(({ label, value }) => (
            <div key={label} className="border border-border bg-surface-muted px-3 py-2">
              <div className={labelCls}>{label}</div>
              <div className="font-mono text-lg font-bold tabular-nums text-foreground leading-tight">
                {value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Passage / Results area ── */}
      {phase === "done" ? (
        /* Results panel */
        <div className="border border-border bg-surface-muted p-5 space-y-5">
          <div className="text-center">
            <div className={labelCls}>Final Score</div>
            <div className="font-mono text-5xl sm:text-6xl font-bold tabular-nums text-foreground mt-1">
              {stats.wpm}
            </div>
            <div className="font-mono text-[11px] text-foreground-muted/60 mt-1">words per minute</div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Accuracy", value: `${stats.accuracy}%` },
              { label: "Raw WPM", value: stats.rawWpm },
              { label: "Correct chars", value: `${stats.correctChars}/${stats.totalTyped}` },
              { label: "Time taken", value: fmtTime(elapsed) },
            ].map(({ label, value }) => (
              <div key={label} className="border border-border bg-surface px-3 py-2.5 text-center">
                <div className={labelCls}>{label}</div>
                <div className="font-mono text-xl font-semibold tabular-nums text-foreground mt-0.5">
                  {value}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2">
              <button onClick={handleReset} className={secondaryBtnCls}>
                Try Again
              </button>
              <button onClick={handleNew} className={secondaryBtnCls}>
                New Test
              </button>
            </div>
            <CopyButton
              copied={copied === "result"}
              onClick={() => copy("result", copyText)}
              labelCopy="Copy result"
              labelCopied="Copied!"
            />
          </div>
        </div>
      ) : (
        /* Passage area with overlaid textarea */
        <div
          className="relative border border-border bg-surface-muted p-4 sm:p-5 cursor-text"
          onClick={focusTextarea}
        >
          {/* Passage character display */}
          <div
            className="font-mono text-sm sm:text-base leading-relaxed select-none"
            aria-hidden="true"
          >
            {passage.split("").map((char, i) => {
              const typed = i < inputValue.length;
              const isCorrect = typed && inputValue[i] === char;
              const isWrong = typed && inputValue[i] !== char;
              const isCursor = i === inputValue.length;
              return (
                <span
                  key={i}
                  className={cn(
                    "relative",
                    isCorrect && "text-foreground",
                    isWrong && "text-red-400 bg-red-500/15",
                    !typed && !isCursor && "text-foreground-muted/30",
                    isCursor && "text-foreground-muted/30"
                  )}
                >
                  {isCursor && (
                    <span className="absolute -left-px top-0 h-full w-[2px] bg-primary animate-pulse" />
                  )}
                  {char}
                </span>
              );
            })}
            {/* Cursor at end when fully typed */}
            {inputValue.length === passage.length && (
              <span className="inline-block w-[2px] h-[1em] bg-primary animate-pulse align-middle ml-px" />
            )}
          </div>

          {/* Overlay textarea — invisible but receives all input */}
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInput}
            onKeyDown={(e) => {
              // Prevent Enter from submitting / adding newlines
              if (e.key === "Enter") e.preventDefault();
            }}
            disabled={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder={phase === "idle" ? "Start typing to begin…" : ""}
            className={cn(
              "absolute inset-0 w-full h-full resize-none",
              "bg-transparent text-transparent caret-transparent",
              "font-mono text-sm sm:text-base leading-relaxed",
              "p-4 sm:p-5 outline-none border-none",
              "placeholder:text-foreground-muted/25 placeholder:not-italic"
            )}
            aria-label="Typing input area"
          />
        </div>
      )}

      {/* ── Hint (idle only) ── */}
      {phase === "idle" && (
        <div className="font-mono text-[10px] text-foreground-muted/40 text-center">
          Click the text area above and start typing — the timer starts automatically
        </div>
      )}

    </div>
  );
}
