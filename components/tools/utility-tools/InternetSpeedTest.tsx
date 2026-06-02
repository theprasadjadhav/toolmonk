"use client";

import { useState, useRef, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Phase = "idle" | "locating" | "download" | "upload" | "done" | "error";
type Unit = "mbps" | "mbytes";

// ─── Gauge geometry ───────────────────────────────────────────────────────────
const CX = 160, CY = 160, R = 125;
const START_DEG = 126, SWEEP_DEG = 288;
const CIRC = 2 * Math.PI * R;
const ARC_LEN = CIRC * (SWEEP_DEG / 360);

function arcTip(f: number) {
  const rad = ((START_DEG + Math.min(Math.max(f, 0), 1) * SWEEP_DEG) * Math.PI) / 180;
  return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
}

function mbpsToFrac(mbps: number): number {
  return mbps <= 0 ? 0 : Math.min(Math.sqrt(mbps / 1000), 1);
}

function fmtNum(mbps: number, unit: Unit): string {
  if (unit === "mbytes") {
    const v = mbps / 8;
    return v >= 1000 ? (v / 1000).toFixed(2) : v.toFixed(v >= 10 ? 1 : 2);
  }
  return mbps >= 1000 ? (mbps / 1000).toFixed(2) : mbps.toFixed(mbps >= 10 ? 1 : 2);
}

function unitStr(mbps: number, unit: Unit): string {
  if (unit === "mbytes") return mbps / 8 >= 1000 ? "GB/s" : "MB/s";
  return mbps >= 1000 ? "Gb/s" : "Mb/s";
}

// ─── Speed rating ─────────────────────────────────────────────────────────────
interface SpeedRating {
  grade: string;
  colorClass: string;
  summary: string;
  examples: string[];
}

function getSpeedRating(mbps: number): SpeedRating {
  if (mbps < 1) return { grade: "Very Slow", colorClass: "text-red-400", summary: "Barely usable — most sites will load slowly.", examples: ["Basic web pages", "Text-only email"] };
  if (mbps < 5) return { grade: "Slow", colorClass: "text-orange-400", summary: "Light browsing only. Streaming will buffer.", examples: ["SD video (480p)", "Simple social media", "Voice calls"] };
  if (mbps < 25) return { grade: "Moderate", colorClass: "text-yellow-400", summary: "Handles everyday tasks and video calls.", examples: ["HD video (720p)", "Zoom / Google Meet", "Music streaming"] };
  if (mbps < 100) return { grade: "Good", colorClass: "text-green-400", summary: "Comfortable for most households and remote work.", examples: ["Full HD (1080p) streaming", "Online gaming", "3–4 devices at once"] };
  if (mbps < 500) return { grade: "Fast", colorClass: "text-primary", summary: "Handles heavy use effortlessly — great for families.", examples: ["4K streaming on multiple TVs", "Large file downloads", "Remote work + gaming"] };
  return { grade: "Ultra Fast", colorClass: "text-accent", summary: "Gigabit-class speed — future-proof for anything.", examples: ["8K streaming", "Instant large file transfers", "Professional cloud workflows"] };
}

// ─── NDT7 raw WebSocket engine ────────────────────────────────────────────────
const NDT7_PROTOCOL = "net.measurementlab.ndt.v7";
const LOCATE_URL = "https://locate.measurementlab.net/v2/nearest/ndt/ndt7";
const UPLOAD_DURATION_MS = 10_000;
const UPLOAD_CHUNK_SIZE = 1 << 16; // 64 KB
const MAX_BUFFER = 8 * 1024 * 1024; // 8 MB

interface TestResult {
  mbps: number;
  minRttMs?: number;
  error?: string;
}

function ndtDownload(
  url: string,
  live: () => boolean,
  onProgress: (mbps: number) => void,
  setWs: (ws: WebSocket | null) => void,
): Promise<TestResult> {
  return new Promise((resolve) => {
    let totalBytes = 0;
    let startTime = 0;
    let minRttMs: number | undefined;

    const ws = new WebSocket(url, NDT7_PROTOCOL);
    ws.binaryType = "arraybuffer";
    setWs(ws);

    ws.onopen = () => {
      startTime = performance.now();
    };

    ws.onmessage = (ev) => {
      if (!live()) { ws.close(); return; }

      if (ev.data instanceof ArrayBuffer) {
        totalBytes += ev.data.byteLength;
        const elapsed = (performance.now() - startTime) / 1000;
        if (elapsed > 0) onProgress((totalBytes * 8) / (elapsed * 1_000_000));
      } else if (typeof ev.data === "string") {
        try {
          const msg = JSON.parse(ev.data);
          const rtt = msg?.TCPInfo?.MinRTT;
          if (typeof rtt === "number" && rtt > 0) minRttMs = rtt / 1000;
        } catch { /* ignore non-JSON */ }
      }
    };

    ws.onclose = () => {
      setWs(null);
      if (!live()) { resolve({ mbps: 0 }); return; }
      const elapsed = (performance.now() - startTime) / 1000;
      if (startTime === 0 || elapsed < 0.5) {
        resolve({ error: "Speed test failed. Please try again.", mbps: 0 });
        return;
      }
      resolve({ mbps: (totalBytes * 8) / (elapsed * 1_000_000), minRttMs });
    };

    ws.onerror = () => {
      setWs(null);
      resolve({ error: "Speed test failed. Please try again.", mbps: 0 });
    };
  });
}

function ndtUpload(
  url: string,
  live: () => boolean,
  onProgress: (mbps: number) => void,
  setWs: (ws: WebSocket | null) => void,
): Promise<TestResult> {
  return new Promise((resolve) => {
    let totalBytes = 0;
    let startTime = 0;
    let rafHandle = 0;

    // Static random payload — generated once, reused every send
    const chunk = new Uint8Array(UPLOAD_CHUNK_SIZE);
    crypto.getRandomValues(chunk);

    const ws = new WebSocket(url, NDT7_PROTOCOL);
    ws.binaryType = "arraybuffer";
    setWs(ws);

    const sendLoop = () => {
      if (!live() || ws.readyState !== WebSocket.OPEN) {
        ws.close();
        return;
      }
      const elapsed = (performance.now() - startTime) / 1000;
      if (elapsed * 1000 >= UPLOAD_DURATION_MS) {
        ws.close();
        return;
      }
      if (ws.bufferedAmount < MAX_BUFFER) {
        ws.send(chunk);
        totalBytes += chunk.byteLength;
        if (elapsed > 0) onProgress((totalBytes * 8) / (elapsed * 1_000_000));
      }
      rafHandle = requestAnimationFrame(sendLoop);
    };

    ws.onopen = () => {
      startTime = performance.now();
      rafHandle = requestAnimationFrame(sendLoop);
    };

    ws.onclose = () => {
      cancelAnimationFrame(rafHandle);
      setWs(null);
      if (!live()) { resolve({ mbps: 0 }); return; }
      const elapsed = (performance.now() - startTime) / 1000;
      if (startTime === 0 || elapsed < 0.5) {
        resolve({ error: "Speed test failed. Please try again.", mbps: 0 });
        return;
      }
      resolve({ mbps: (totalBytes * 8) / (elapsed * 1_000_000) });
    };

    ws.onerror = () => {
      cancelAnimationFrame(rafHandle);
      setWs(null);
      resolve({ error: "Speed test failed. Please try again.", mbps: 0 });
    };
  });
}

// ─── Dev mock (set false before shipping) ────────────────────────────────────
const DEV_MOCK = process.env.NODE_ENV === "development";

const MOCK = {
  downloadMbps: 87.4,
  uploadMbps: 23.1,
  latencyMs: 12.3,
  tickMs: 120,        // interval between fake measurements
  locatingMs: 700,    // time spent in "locating" phase
};

function mockPhase(
  targetMbps: number,
  durationMs: number,
  tickMs: number,
  live: () => boolean,
  onTick: (mbps: number) => void,
): Promise<void> {
  return new Promise((resolve) => {
    const steps = Math.floor(durationMs / tickMs);
    let i = 0;
    const next = () => {
      if (!live()) { resolve(); return; }
      i++;
      // Ease-in curve: ramp up quickly then level off
      const t = i / steps;
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      onTick(targetMbps * eased);
      if (i < steps) setTimeout(next, tickMs);
      else resolve();
    };
    setTimeout(next, tickMs);
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
export function InternetSpeedTest() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [displayNum, setDisplayNum] = useState(0);
  const [gaugeFrac, setGaugeFrac] = useState(0);
  const [dlResult, setDlResult] = useState<number | null>(null);
  const [ulResult, setUlResult] = useState<number | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [unit, setUnit] = useState<Unit>("mbps");
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const sessionRef = useRef(0);
  const targetNumRef = useRef(0);
  const dispNumRef = useRef(0);
  const targetFracRef = useRef(0);
  const dispFracRef = useRef(0);
  const rafRef = useRef(0);
  const activeWsRef = useRef<WebSocket | null>(null);

  useEffect(() => () => { cancelAnimationFrame(rafRef.current); }, []);

  // ── Animation ────────────────────────────────────────────────────────────
  function startAnim() {
    cancelAnimationFrame(rafRef.current);
    const tick = () => {
      const nd = targetNumRef.current - dispNumRef.current;
      const fd = targetFracRef.current - dispFracRef.current;
      let more = false;
      if (Math.abs(nd) > 0.01) { dispNumRef.current += nd * 0.09; more = true; }
      else { dispNumRef.current = targetNumRef.current; }
      if (Math.abs(fd) > 0.00005) { dispFracRef.current += fd * 0.09; more = true; }
      else { dispFracRef.current = targetFracRef.current; }
      setDisplayNum(dispNumRef.current);
      setGaugeFrac(dispFracRef.current);
      rafRef.current = more ? requestAnimationFrame(tick) : 0;
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  function resetAnim() {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    targetNumRef.current = dispNumRef.current = 0;
    targetFracRef.current = dispFracRef.current = 0;
    setDisplayNum(0);
    setGaugeFrac(0);
  }

  function updateTarget(mbps: number) {
    if (mbps > targetNumRef.current) {
      targetNumRef.current = mbps;
      targetFracRef.current = mbpsToFrac(mbps);
      if (!rafRef.current) startAnim();
    }
  }

  // ── Run / stop ────────────────────────────────────────────────────────────
  const runTest = async () => {
    const mySession = ++sessionRef.current;
    const live = () => sessionRef.current === mySession;
    const setWs = (ws: WebSocket | null) => { activeWsRef.current = ws; };

    resetAnim();
    setPhase("locating");
    setDlResult(null);
    setUlResult(null);
    setLatency(null);
    setErrMsg(null);

    try {
      // ── Dev mock ──────────────────────────────────────────────────────────
      if (DEV_MOCK) {
        await new Promise(r => setTimeout(r, MOCK.locatingMs));
        if (!live()) return;

        resetAnim(); setPhase("download");
        await mockPhase(MOCK.downloadMbps, 2500, MOCK.tickMs, live, updateTarget);
        if (!live()) return;
        setDlResult(MOCK.downloadMbps);
        setLatency(MOCK.latencyMs);

        resetAnim(); setPhase("upload");
        await mockPhase(MOCK.uploadMbps, 2000, MOCK.tickMs, live, updateTarget);
        if (!live()) return;
        setUlResult(MOCK.uploadMbps);

        resetAnim(); setPhase("done");
        return;
      }

      // 1. Locate nearest server
      let locateRes: Response;
      try {
        locateRes = await fetch(LOCATE_URL);
      } catch {
        if (!live()) return;
        setErrMsg("Could not reach test servers. Check your connection and try again.");
        setPhase("error");
        return;
      }

      if (!live()) return;

      if (!locateRes.ok) {
        if (locateRes.status === 429) {
          setErrMsg("Too many tests run recently. Please wait a few minutes and try again.");
        } else {
          setErrMsg("Could not find a nearby test server. Please try again.");
        }
        setPhase("error");
        return;
      }

      const locateData = await locateRes.json();
      if (!live()) return;

      const serverResult = locateData?.results?.[0];
      const downloadUrl = serverResult?.urls?.["wss:///ndt/v7/download"];
      const uploadUrl = serverResult?.urls?.["wss:///ndt/v7/upload"];

      if (!downloadUrl || !uploadUrl) {
        setErrMsg("Could not find a nearby test server. Please try again.");
        setPhase("error");
        return;
      }

      // 2. Download test
      resetAnim();
      setPhase("download");

      const dlRes = await ndtDownload(downloadUrl, live, updateTarget, setWs);
      if (!live()) return;

      if (dlRes.error) {
        setErrMsg(dlRes.error);
        setPhase("error");
        return;
      }

      setDlResult(dlRes.mbps);
      if (dlRes.minRttMs != null) setLatency(dlRes.minRttMs);

      // 3. Upload test
      resetAnim();
      setPhase("upload");

      const ulRes = await ndtUpload(uploadUrl, live, updateTarget, setWs);
      if (!live()) return;

      if (ulRes.error) {
        setErrMsg(ulRes.error);
        setPhase("error");
        return;
      }

      setUlResult(ulRes.mbps);
      resetAnim();
      setPhase("done");
    } catch {
      if (live()) {
        setErrMsg("Speed test failed. Please try again.");
        setPhase("error");
      }
    }
  };

  const stopTest = () => {
    sessionRef.current++;
    if (activeWsRef.current) {
      activeWsRef.current.close();
      activeWsRef.current = null;
    }
    cancelAnimationFrame(rafRef.current);
    resetAnim();
    setPhase("idle");
    setDlResult(null);
    setUlResult(null);
    setLatency(null);
    setErrMsg(null);
  };

  // ── Derived ──────────────────────────────────────────────────────────────
  const isIdle = phase === "idle" || phase === "error";
  const isLocating = phase === "locating";
  const isRunning = phase === "download" || phase === "upload";
  const isDone = phase === "done";

  const gaugeColor = phase === "upload" ? "var(--color-accent)" : "var(--color-primary)";
  const clampedFrac = Math.min(Math.max(gaugeFrac, 0), 1);
  const tip = arcTip(clampedFrac);
  const showArc = isRunning && clampedFrac > 0.005;
  const showTip = showArc && clampedFrac > 0.02;

  const rating = isDone && dlResult != null ? getSpeedRating(dlResult) : null;

  // ── Gauge SVG (reused in both layouts) ───────────────────────────────────
  const GaugeSVG = (
    <svg viewBox="0 0 320 320" className="w-full" aria-hidden="true">
      <defs>
        <filter id="st-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Track */}
      <circle cx={CX} cy={CY} r={R} fill="none" strokeWidth={12} strokeLinecap="round"
        stroke="rgba(128,128,128,0.12)"
        strokeDasharray={`${ARC_LEN} ${CIRC}`}
        transform={`rotate(${START_DEG},${CX},${CY})`}
      />
      {/* Progress arc (running only) */}
      {showArc && (
        <circle cx={CX} cy={CY} r={R} fill="none" strokeWidth={12} strokeLinecap="round"
          style={{ stroke: gaugeColor }}
          strokeDasharray={`${clampedFrac * ARC_LEN} ${CIRC}`}
          transform={`rotate(${START_DEG},${CX},${CY})`}
          filter="url(#st-glow)"
        />
      )}
      {/* Tip dot */}
      {showTip && (
        <circle cx={tip.x} cy={tip.y} r={7}
          style={{ fill: gaugeColor }} filter="url(#st-glow)" />
      )}
    </svg>
  );

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">

      {/* Unit toggle */}
      <div className="flex gap-2 self-end">
        {(["mbps", "mbytes"] as Unit[]).map((u) => (
          <button key={u} onClick={() => setUnit(u)}
            className={`font-mono text-[10px] px-3 py-1 border tracking-wider transition-colors ${
              unit === u
                ? "border-primary/40 text-primary"
                : "border-border/50 text-foreground-muted/90 hover:text-foreground hover:border-border"
            }`}
          >
            {u === "mbps" ? "Mb/s" : "MB/s"}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════
          IDLE / LOCATING / RUNNING — centered column
          DONE                      — two-column layout
      ══════════════════════════════════════════════════ */}
      <div className={isDone
        ? "flex flex-col md:flex-row md:items-start gap-6"
        : "flex flex-col items-center gap-4"
      }>

        {/* ── Left / main gauge column ─────────────────────────────────── */}
        <div className={`flex flex-col items-center gap-4 ${
          isDone ? "w-full md:w-[240px] flex-shrink-0" : "w-full max-w-[300px] mx-auto"
        }`}>

          {/* SVG gauge + center overlay */}
          <div className="relative w-full">
            {GaugeSVG}

            {/* Overlay: idle/running states (pushed up to sit in arc center) */}
            {(isIdle || isRunning) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center select-none">

                {isIdle && (
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-mono tabular-nums leading-none text-foreground-muted/15"
                          style={{ fontSize: "clamp(2.5rem, 9vw, 3.8rem)" }}>
                      —
                    </span>
                    <span className="font-mono text-xs text-foreground-muted/10 tracking-wider">
                      {unit === "mbps" ? "Mb/s" : "MB/s"}
                    </span>
                  </div>
                )}

                {isRunning && (
                  <div className="flex flex-col items-center">
                    <span className="font-mono text-[9px] uppercase tracking-[0.3em] mb-1"
                          style={{ color: gaugeColor, opacity: 0.7 }}>
                      {phase}
                    </span>
                    <span className="font-mono tabular-nums leading-none text-foreground"
                          style={{ fontSize: "clamp(2.8rem, 10vw, 4rem)" }}>
                      {displayNum > 0.05 ? fmtNum(displayNum, unit) : "—"}
                    </span>
                    <span className="font-mono text-sm mt-1" style={{ color: gaugeColor }}>
                      {unitStr(Math.max(displayNum, 1), unit)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Locating indicator — sits below the gauge, properly centred ── */}
          {isLocating && (
            <div className="flex flex-col items-center gap-3 py-1">
              <div className="flex items-center gap-[6px]">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="block w-[7px] h-[7px] rounded-full bg-primary"
                    style={{
                      animation: "ndt-bounce 1.1s ease-in-out infinite",
                      animationDelay: `${i * 180}ms`,
                    }}
                  />
                ))}
              </div>
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-foreground-muted/40">
                Finding server
              </span>
            </div>
          )}

          {/* Stage dots (running) */}
          {isRunning && (
            <div className="flex items-center gap-3">
              {(["download", "upload"] as const).map(s => {
                const done = s === "download" ? dlResult != null : ulResult != null;
                const active = phase === s;
                return (
                  <div key={s} className="rounded-full transition-all duration-500"
                    style={{
                      width: active ? 10 : 6,
                      height: active ? 10 : 6,
                      background: done || active ? "var(--color-primary)" : "var(--color-border)",
                      opacity: done && !active ? 0.5 : 1,
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Committed download chip during upload */}
          {phase === "upload" && dlResult != null && (
            <div className="flex items-center justify-center gap-2 px-4 py-2
                            border border-border/50 bg-surface-muted w-full">
              <span className="font-mono text-[9px] uppercase tracking-wider text-foreground-muted/50">
                Download
              </span>
              <span className="font-mono text-sm text-foreground">
                {fmtNum(dlResult, unit)}&nbsp;
                <span className="text-[9px] text-foreground-muted/50 uppercase">{unitStr(dlResult, unit)}</span>
              </span>
            </div>
          )}

          {/* Start Test (idle) */}
          {isIdle && (
            <div className="w-full flex flex-col gap-2">
              <button onClick={runTest}
                className="w-full font-mono text-[10px] py-3 border border-border
                           text-foreground-muted hover:text-primary hover:border-primary/50
                           uppercase tracking-widest transition-colors">
                ▶&nbsp;&nbsp;Start Test
              </button>
              <p className="font-mono text-[9px] text-foreground-muted/30 text-center leading-relaxed">
                Test results are anonymously logged by M-Lab as open public data.
              </p>
            </div>
          )}

          {/* Stop (locating / running) */}
          {(isLocating || isRunning) && (
            <button onClick={stopTest}
              className="w-full font-mono text-[10px] py-2.5 border border-red-400/25
                         text-red-400/50 uppercase tracking-wider
                         hover:border-red-400/50 hover:text-red-400 transition-colors">
              ■&nbsp;&nbsp;Stop
            </button>
          )}

          {/* Test Again (done, bottom of left column) */}
          {isDone && (
            <button onClick={runTest}
              className="w-full font-mono text-[10px] py-3 border border-border
                         text-foreground-muted hover:text-primary hover:border-primary/50
                         uppercase tracking-widest transition-colors mt-auto">
              ▶&nbsp;&nbsp;Test Again
            </button>
          )}
        </div>

        {/* ── Right / results column (done only) ──────────────────────── */}
        {isDone && rating && dlResult != null && (
          <div className="flex-1 flex flex-col gap-3">

            {/* Three metric cards */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Download", num: fmtNum(dlResult, unit), u: unitStr(dlResult, unit) },
                { label: "Upload", num: ulResult != null ? fmtNum(ulResult, unit) : "—", u: ulResult != null ? unitStr(ulResult, unit) : "" },
                { label: "Latency", num: latency != null ? latency.toFixed(1) : "—", u: latency != null ? "ms" : "" },
              ].map(({ label, num, u }) => (
                <div key={label} className="border border-border bg-surface-muted px-3 py-3">
                  <span className="font-mono text-[9px] uppercase tracking-wider
                                   text-foreground-muted/50 block mb-2">
                    {label}
                  </span>
                  <span className="font-mono text-lg tabular-nums leading-none text-foreground">
                    {num}
                  </span>
                  {u && (
                    <span className="font-mono text-[9px] text-foreground-muted/40 ml-1">
                      {u}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Speed grade */}
            <div className="border border-border bg-surface-muted px-4 py-4 space-y-2">
              <div className="flex items-baseline gap-3">
                <span className={`font-mono text-lg leading-none ${rating.colorClass}`}>
                  {rating.grade}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-foreground-muted/35">
                  based on download
                </span>
              </div>
              <p className="font-mono text-[11px] text-foreground-muted/55 leading-relaxed">
                {rating.summary}
              </p>
            </div>

            {/* What you can do */}
            <div className="border border-border bg-surface-muted px-4 py-4 space-y-3">
              <span className="font-mono text-[9px] uppercase tracking-wider text-foreground-muted/40 block">
                What you can do
              </span>
              <ul className="space-y-2">
                {rating.examples.map((ex) => (
                  <li key={ex} className="flex items-start gap-2">
                    <span className={`text-[9px] mt-px leading-none ${rating.colorClass}`}>▸</span>
                    <span className="font-mono text-[11px] text-foreground-muted/65 leading-relaxed">{ex}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* M-Lab footer */}
            <p className="font-mono text-[9px] text-foreground-muted/25">
              Powered by M-Lab NDT7 · Results are open public data
            </p>
          </div>
        )}
      </div>

      {/* Error */}
      {phase === "error" && errMsg && (
        <div className="border border-red-400/30 bg-red-400/5 px-4 py-3">
          <p className="font-mono text-[11px] text-red-400">{errMsg}</p>
        </div>
      )}

      {/* Idle description */}
      {phase === "idle" && (
        <p className="font-mono text-[10px] text-foreground-muted/35 text-center">
          Measures download speed, upload speed, and latency via M-Lab&apos;s global server network.
        </p>
      )}
    </div>
  );
}
