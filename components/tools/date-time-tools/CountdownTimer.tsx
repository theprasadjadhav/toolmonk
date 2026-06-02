"use client";

import { useState, useEffect, useMemo } from "react";

function pad(n: number) { return String(Math.floor(n)).padStart(2, "0"); }

function minDateTimeLocal(): string {
  const d = new Date();
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

const labelCls = "font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60 mb-1 block";
const inputCls = "w-full font-mono text-sm bg-surface-muted border border-border px-3 py-2.5 text-foreground outline-none focus:border-foreground-muted";

export function CountdownTimer() {
  const [targetStr, setTargetStr] = useState("");
  const [started,   setStarted]   = useState(false);
  // eslint-disable-next-line react-hooks/purity
  const [now,       setNow]       = useState(Date.now());

  useEffect(() => {
    if (!started || !targetStr) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [started, targetStr]);

  const countdown = useMemo(() => {
    if (!targetStr || !started) return null;
    const target = new Date(targetStr).getTime();
    const diff = target - now;
    if (diff <= 0) return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0, totalSec: 0 };
    const totalSec = Math.floor(diff / 1000);
    return {
      expired: false,
      days:    Math.floor(totalSec / 86400),
      hours:   Math.floor(totalSec / 3600) % 24,
      minutes: Math.floor(totalSec / 60) % 60,
      seconds: totalSec % 60,
      totalSec,
    };
  }, [targetStr, now, started]);

  const targetDate = targetStr ? new Date(targetStr).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
  }) : "";

  function handleReset() { setTargetStr(""); setStarted(false); }

  return (
    <div className="space-y-5">
      <div className="flex gap-3 flex-col sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className={labelCls}>— target date &amp; time</label>
          <input type="datetime-local" 
            disabled={started}
            value={targetStr}
            min={minDateTimeLocal()}
            onChange={(e) => { setTargetStr(e.target.value); setStarted(false); }}
            className={inputCls} />
        </div>
        {!started ? (
          <button
            disabled={!targetStr}
            onClick={() => { setNow(Date.now()); setStarted(true); }}
            className="font-mono text-[11px] uppercase tracking-wider px-6 py-3 border border-foreground-muted text-foreground hover:bg-surface-muted disabled:cursor-not-allowed disabled:border-border disabled:text-foreground-muted/30 transition-colors hover:text-primary hover:border-primary/40">
            Start Countdown
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="font-mono text-[11px] uppercase tracking-wider px-6 py-3 border border-foreground-muted text-foreground hover:bg-surface-muted disabled:cursor-not-allowed disabled:border-border disabled:text-foreground-muted/30 transition-colors hover:text-primary hover:border-primary/40">
            Reset
          </button>
        )}
      </div>

      {!targetStr && (
        <p className="font-mono text-[10px] text-foreground-muted/40">Select a future date and time to start the countdown.</p>
      )}

      {countdown && (
        <div className="space-y-4">

          {countdown.expired ? (
            <div className="border border-border bg-surface-muted px-6 py-8 text-center">
              <p className="font-mono text-2xl text-primary tracking-widest">Expired</p>
              <p className="font-mono text-[10px] text-foreground-muted/50 mt-2">{targetDate}</p>
            </div>
          ) : (
            <div className="border border-border bg-surface-muted">
              <div className="grid grid-cols-4 divide-x divide-border">
                {[
                  { label: "Days",    value: countdown.days },
                  { label: "Hours",   value: countdown.hours },
                  { label: "Minutes", value: countdown.minutes },
                  { label: "Seconds", value: countdown.seconds },
                ].map(({ label: lbl, value }) => (
                  <div key={lbl} className="flex flex-col items-center py-6 px-2">
                    <span className="font-mono text-3xl sm:text-4xl text-primary tabular-nums leading-none">
                      {pad(value)}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/50 mt-2">
                      {lbl}
                    </span>
                  </div>
                ))}
              </div>
              
            </div>
          )}

          {!countdown.expired && (
            <p className="font-mono text-[10px] text-foreground-muted/40">
              Target: {targetDate}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
