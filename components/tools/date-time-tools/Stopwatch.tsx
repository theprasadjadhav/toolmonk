"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils/cn";

function fmtMs(ms: number): string {
  const cs  = Math.floor(ms / 10) % 100;
  const sec = Math.floor(ms / 1000) % 60;
  const min = Math.floor(ms / 60_000) % 60;
  const hr  = Math.floor(ms / 3_600_000);
  const p   = (n: number) => String(n).padStart(2, "0");
  if (hr > 0) return `${p(hr)}:${p(min)}:${p(sec)}.${p(cs)}`;
  return `${p(min)}:${p(sec)}.${p(cs)}`;
}

export function Stopwatch() {
  const [displayMs, setDisplayMs] = useState(0);
  const [running,   setRunning]   = useState(false);
  const [laps,      setLaps]      = useState<{ id: number; split: number; total: number }[]>([]);

  const intervalRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef  = useRef(0);
  const accumulatedRef = useRef(0);
  const lapStartRef   = useRef(0);

  const clearTimer = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  const start = useCallback(() => {
    startTimeRef.current = Date.now();
    lapStartRef.current  = accumulatedRef.current;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setDisplayMs(accumulatedRef.current + (Date.now() - startTimeRef.current));
    }, 30);
  }, []);

  const pause = useCallback(() => {
    clearTimer();
    accumulatedRef.current += Date.now() - startTimeRef.current;
    setDisplayMs(accumulatedRef.current);
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    accumulatedRef.current = 0;
    lapStartRef.current    = 0;
    setDisplayMs(0);
    setRunning(false);
    setLaps([]);
  }, []);

  const addLap = useCallback(() => {
    const total = accumulatedRef.current + (running ? Date.now() - startTimeRef.current : 0);
    const split = total - lapStartRef.current;
    lapStartRef.current = total;
    setLaps((prev) => [{ id: prev.length + 1, split, total }, ...prev]);
  }, [running]);

  useEffect(() => () => clearTimer(), []);

  const fastest  = laps.length > 1 ? Math.min(...laps.map((l) => l.split)) : -1;
  const slowest  = laps.length > 1 ? Math.max(...laps.map((l) => l.split)) : -1;

  return (
    <div className="space-y-5">
      {/* Display */}
      <div className="border border-border bg-surface-muted flex items-center justify-center py-10">
        <span className="font-mono text-5xl sm:text-6xl text-primary tracking-widest tabular-nums">
          {fmtMs(displayMs)}
        </span>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {!running ? (
          <button onClick={start}
            className="flex-1 font-mono text-[11px] uppercase tracking-wider px-4 py-3 border border-foreground-muted text-foreground hover:border-primary/40 hover:text-primary transition-colors">
            {displayMs === 0 ? "Start" : "Resume"}
          </button>
        ) : (
          <button onClick={pause}
            className="flex-1 font-mono text-[11px] uppercase tracking-wider px-4 py-3 border border-foreground-muted text-foreground hover:border-primary/40 hover:text-primary transition-colors">
            Pause
          </button>
        )}
        <button onClick={addLap} disabled={!running}
          className={cn(
            "font-mono text-[11px] uppercase tracking-wider px-4 py-3 border transition-colors",
            running ? "border-foreground-muted text-foreground-muted hover:border-primary/40 hover:text-primary" : "border-border text-foreground-muted/30 cursor-not-allowed",
          )}>
          Lap
        </button>
        <button onClick={reset} disabled={running}
          className={cn(
            "font-mono text-[11px] uppercase tracking-wider px-4 py-3 border transition-colors",
            !running && displayMs > 0 ? "border-foreground-muted text-foreground-muted hover:border-primary/40 hover:text-primary" : "border-border text-foreground-muted/30 cursor-not-allowed",
          )}>
          Reset
        </button>
      </div>

      {/* Laps */}
      {laps.length > 0 && (
        <div className="space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— lap times</p>
          <div className="overflow-x-auto">
          <div className="border border-border divide-y divide-border min-w-[280px]">
            {/* Header */}
            <div className="flex bg-surface-muted">
              <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/50 px-3 py-2 w-10 sm:w-16 border-r border-border">Lap</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/50 px-3 py-2 flex-1 border-r border-border">Split</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/50 px-3 py-2 flex-1">Total</span>
            </div>
            {laps.map((lap) => {
              const isFastest = lap.split === fastest;
              const isSlowest = lap.split === slowest;
              return (
                <div key={lap.id} className="flex items-center bg-surface">
                  <span className="font-mono text-[10px] text-foreground-muted/50 px-3 py-2.5 w-10 sm:w-16 shrink-0 border-r border-border">{lap.id}</span>
                  <div className={cn(
                    "font-mono text-sm px-3 py-2.5 flex-1 tabular-nums border-r border-border flex flex-col gap-0.5",
                    isFastest ? "text-green-500/80" : isSlowest ? "text-red-500/70" : "text-foreground/80",
                  )}>
                    {fmtMs(lap.split)}
                    {isFastest && <span className="font-mono text-[9px] text-green-500/60 uppercase tracking-wider">fastest</span>}
                    {isSlowest && <span className="font-mono text-[9px] text-red-500/50 uppercase tracking-wider">slowest</span>}
                  </div>
                  <span className="font-mono text-sm text-foreground/50 px-3 py-2.5 flex-1 tabular-nums">{fmtMs(lap.total)}</span>
                </div>
              );
            })}
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
