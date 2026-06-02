"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Unit = "kmh" | "mph";

const KMH_TO_MPH = 0.621371;

// ── Minimal analog speedometer — matches app design system ────────────────────

function drawSpeedometer(
  ctx: CanvasRenderingContext2D,
  size: number,
  speedKmh: number,
  unit: Unit
) {
  const cx = size / 2;
  const cy = size / 2;
  const R  = size * 0.46; // tight fit — stays within canvas bounds

  ctx.clearRect(0, 0, size, size);

  // Arc geometry — 240° sweep, gap at bottom (6 o'clock position)
  const START    = (150 * Math.PI) / 180;
  const SPAN     = (240 * Math.PI) / 180;
  const maxSpeed = unit === "kmh" ? 220 : 140;
  const dispSpd  = unit === "kmh" ? speedKmh : speedKmh * KMH_TO_MPH;
  const fraction = Math.min(Math.max(dispSpd / maxSpeed, 0), 1);
  const needleA  = START + fraction * SPAN;

  // Pull live theme tokens so the dial adapts to light/dark mode
  const cs      = getComputedStyle(document.documentElement);
  const face    = cs.getPropertyValue("--surface-elevated").trim() || "#17171b";
  const border   = cs.getPropertyValue("--border").trim()           || "#232328";
  const fg       = cs.getPropertyValue("--foreground").trim()       || "#f1f1f3";
  const fgMuted  = cs.getPropertyValue("--foreground-muted").trim() || "#5a5a66";
  const primary  = cs.getPropertyValue("--primary").trim()          || "#ff5c57";

  // ── Face fill (surface-elevated → #ffffff in light mode, #17171b in dark)
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fillStyle = face;
  ctx.fill();

  // ── Outer ring (1 px, border color)
  ctx.beginPath();
  ctx.arc(cx, cy, R - 0.5, 0, Math.PI * 2);
  ctx.strokeStyle = border;
  ctx.lineWidth   = 1;
  ctx.stroke();

  // ── Outer progress band — sits just inside the ring
  const bandR = R * 0.973;
  const bandW = R * 0.027;

  // Background track
  ctx.beginPath();
  ctx.arc(cx, cy, bandR, START, START + SPAN, false);
  ctx.strokeStyle = border;
  ctx.lineWidth   = bandW;
  ctx.lineCap     = "butt";
  ctx.stroke();

  // Active (speed) portion in primary colour
  if (fraction > 0.003) {
    ctx.beginPath();
    ctx.arc(cx, cy, bandR, START, needleA, false);
    ctx.strokeStyle = primary;
    ctx.lineWidth   = bandW;
    ctx.lineCap     = "butt";
    ctx.stroke();
  }

  // ── Tick marks + labels
  // tickOutR sits just inside the inner edge of the progress band
  const bandInner = bandR - bandW * 0.5;
  const tickOutR  = bandInner - R * 0.009;

  const cfg = unit === "kmh"
    ? { max: 220, majStep: 20, minStep: 10, lblStep: 40 }
    : { max: 140, majStep: 20, minStep: 10, lblStep: 20 };

  for (let v = 0; v <= cfg.max; v += cfg.minStep) {
    const t      = v / cfg.max;
    const a      = START + t * SPAN;
    const isMaj  = v % cfg.majStep === 0;
    const cos    = Math.cos(a);
    const sin    = Math.sin(a);
    const tLen   = isMaj ? R * 0.10 : R * 0.05;
    const iR     = tickOutR - tLen;

    ctx.beginPath();
    ctx.moveTo(cx + iR * cos,        cy + iR * sin);
    ctx.lineTo(cx + tickOutR * cos,  cy + tickOutR * sin);
    ctx.strokeStyle = isMaj ? fgMuted : border;
    ctx.lineWidth   = isMaj
      ? Math.max(1.2, size * 0.004)
      : Math.max(0.6, size * 0.002);
    ctx.lineCap = "butt";
    ctx.stroke();

    // Number labels — only on label-step major ticks
    if (isMaj && v % cfg.lblStep === 0) {
      const lblR = iR - R * 0.10;
      const fs   = Math.max(7, Math.round(R * 0.086));
      ctx.font         = `${fs}px ui-monospace, "Courier New", monospace`;
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle    = t <= fraction + 0.002 ? fg : fgMuted;
      ctx.fillText(String(v), cx + lblR * cos, cy + lblR * sin);
    }
  }

  // ── Needle — thin line, tip reaches the tick outer ring
  const nTip  = tickOutR;
  const nTail = R * 0.12;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(needleA);

  ctx.beginPath();
  ctx.moveTo(-nTail, 0);
  ctx.lineTo(nTip, 0);
  ctx.strokeStyle = primary;
  ctx.lineWidth   = Math.max(1.5, size * 0.0055);
  ctx.lineCap     = "round";
  ctx.stroke();

  ctx.restore();

  // ── Center hub (ring in primary, filled with surface)
  const hubR = R * 0.038;

  ctx.beginPath();
  ctx.arc(cx, cy, hubR, 0, Math.PI * 2);
  ctx.fillStyle = primary;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, hubR * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = face;
  ctx.fill();

  // ── Unit label — sits in the bottom gap of the arc
  const uFs = Math.max(7, Math.round(R * 0.076));
  ctx.font         = `${uFs}px ui-monospace, "Courier New", monospace`;
  ctx.fillStyle    = fgMuted;
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(unit === "kmh" ? "km/h" : "mph", cx, cy + R * 0.44);
}

// ── Component ──────────────────────────────────────────────────────────────────

const labelCls =
  "font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60 block mb-1";

export function Speedometer() {
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const containerRef  = useRef<HTMLDivElement>(null);
  const watchIdRef    = useRef<number | null>(null);
  const animFrameRef  = useRef<number | null>(null);
  const canvasSizeRef = useRef({ w: 0, dpr: 0 });

  const displayedSpeedRef = useRef(0);
  const targetSpeedRef    = useRef(0);
  const unitRef           = useRef<Unit>("kmh");

  const [unit,             setUnit]             = useState<Unit>("kmh");
  const [speedKmh,         setSpeedKmh]         = useState(0);
  const [maxSpeedKmh,      setMaxSpeedKmh]      = useState(0);
  const [accuracy,         setAccuracy]         = useState<number | null>(null);
  const [error,            setError]            = useState<string | null>(null);
  const [watching,         setWatching]         = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [mounted,          setMounted]          = useState(false);

  useEffect(() => setMounted(true), []);

  // eslint-disable-next-line react-hooks/refs
  unitRef.current        = unit;
  // eslint-disable-next-line react-hooks/refs
  targetSpeedRef.current = speedKmh;

  const draw = useCallback(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr  = window.devicePixelRatio || 1;
    const size = container.offsetWidth;
    if (size === 0) return;

    const { w, dpr: prevDpr } = canvasSizeRef.current;
    if (w !== size || prevDpr !== dpr) {
      canvas.width        = size * dpr;
      canvas.height       = size * dpr;
      canvas.style.width  = `${size}px`;
      canvas.style.height = `${size}px`;
      canvasSizeRef.current = { w: size, dpr };
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawSpeedometer(ctx, size, displayedSpeedRef.current, unitRef.current);
  }, []);

  // Smooth needle via lerp animation
  useEffect(() => {
    const animate = () => {
      const curr = displayedSpeedRef.current;
      const diff = targetSpeedRef.current - curr;
      if (Math.abs(diff) > 0.06) {
        displayedSpeedRef.current = curr + diff * 0.09;
        draw();
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        displayedSpeedRef.current = targetSpeedRef.current;
        draw();
        animFrameRef.current = null;
      }
    };
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(animate);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [speedKmh, draw]);

  useEffect(() => { draw(); }, [unit, draw]);

  useEffect(() => {
    const obs = new ResizeObserver(() => {
      canvasSizeRef.current = { w: 0, dpr: 0 };
      draw();
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [draw]);

  // Redraw when theme changes (class toggle on <html> or system preference change)
  useEffect(() => {
    const mutObs = new MutationObserver(() => draw());
    mutObs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", draw);

    return () => {
      mutObs.disconnect();
      mq.removeEventListener("change", draw);
    };
  }, [draw]);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setError(null);
    setPermissionDenied(false);
    setMaxSpeedKmh(0);
    setWatching(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const kmh = (pos.coords.speed ?? 0) * 3.6;
        setSpeedKmh(kmh);
        setMaxSpeedKmh((p) => Math.max(p, kmh));
        setAccuracy(pos.coords.accuracy);
        setError(null);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionDenied(true);
          setError("Location access denied. Allow location in your browser settings.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError("Location unavailable. This device may not have a GPS sensor.");
        } else {
          setError("Location request timed out. Move outdoors and try again.");
        }
        setWatching(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setWatching(false);
    setSpeedKmh(0);
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  if (!mounted) return null;

  const geoSupported = "geolocation" in navigator;

  if (!geoSupported) {
    return (
      <div className="border border-border bg-surface-muted px-6 py-10 text-center space-y-2">
        <p className="font-mono text-sm text-foreground">GPS not available</p>
        <p className="font-mono text-[10px] text-foreground-muted/50">
          Your browser does not support the Geolocation. Try Chrome or Firefox on a
          GPS-enabled device.
        </p>
      </div>
    );
  }

  const displaySpeed = unit === "kmh" ? speedKmh : speedKmh * KMH_TO_MPH;
  const displayMax   = unit === "kmh" ? maxSpeedKmh : maxSpeedKmh * KMH_TO_MPH;

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-10 md:items-stretch">

      {/* ── Left: gauge + controls (desktop only below dial) ─────────────── */}
      <div className="flex flex-col items-center gap-4">
        {/* Canvas container — square, constrained width */}
        <div
          ref={containerRef}
          className="w-full max-w-[280px] mx-auto md:mx-0 md:w-[260px] aspect-square"
        >
          <canvas ref={canvasRef} style={{ display: "block" }} />
        </div>

        {/* Unit toggle — desktop only */}
        <div className="hidden md:block w-full">
          <div className="flex gap-2">
            {(["kmh", "mph"] as Unit[]).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`w-full font-mono text-[10px] px-5 py-1 uppercase tracking-wider transition-colors border ${
                  unit === u
                    ? "border-primary/40 text-primary"
                    : "border-border/50 text-foreground-muted/90 hover:text-foreground hover:border-border"
                }`}
              >
                {u === "kmh" ? "km/h" : "mph"}
              </button>
            ))}
          </div>
        </div>

        {/* Start / Stop GPS — desktop only */}
        <button
          onClick={watching ? stopWatching : startWatching}
          className={`hidden md:block w-full md:w-[260px] font-mono text-[10px] py-3 border transition-colors uppercase tracking-widest ${
            watching
              ? "border-red-400/50 text-red-400 bg-red-400/5 hover:bg-red-400/10"
              : "border-border text-foreground-muted hover:text-primary hover:border-primary/50"
          }`}
        >
          {watching ? "■  Stop GPS" : "▶  Start GPS"}
        </button>

        {watching && !error && (
          <div className="hidden md:flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
            <span className="font-mono text-[10px] text-green-500/70 uppercase tracking-wider">
              GPS Active
            </span>
          </div>
        )}
      </div>

      {/* ── Right: digital readout + controls (mobile below number) ────────── */}
      <div className="flex-1 flex flex-col justify-center items-center gap-5">

        {/* Large digital readout — centered, takes all available vertical space */}
        <div className="flex-1 flex flex-col justify-center items-center w-full">
          <div className="flex pl-4 sm:pl-0 items-baseline gap-3">
            <span className="font-mono text-8xl sm:text-9xl tabular-nums text-foreground leading-none">
              {displaySpeed.toFixed(1)}
            </span>
            <span className="font-mono text-lg text-foreground-muted/40 uppercase tracking-wider self-end mb-2">
              {unit === "kmh" ? "km/h" : "mph"}
            </span>
          </div>
        </div>

        {/* Unit toggle — mobile only */}
        <div className="md:hidden w-full max-w-[280px]">
          <div className="flex gap-2">
            {(["kmh", "mph"] as Unit[]).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`w-full font-mono text-[10px] px-5 py-1 uppercase tracking-wider transition-colors border ${
                  unit === u
                    ? "border-primary/40 text-primary"
                    : "border-border/50 text-foreground-muted/90 hover:text-foreground hover:border-border"
                }`}
              >
                {u === "kmh" ? "km/h" : "mph"}
              </button>
            ))}
          </div>
        </div>

        {/* Start / Stop GPS — mobile only */}
        <button
          onClick={watching ? stopWatching : startWatching}
          className={`md:hidden w-full max-w-[280px] font-mono text-[10px] py-3 border transition-colors uppercase tracking-widest ${
            watching
              ? "border-primary/40 text-primary"
                : "border-border/50 text-foreground-muted/40 hover:text-foreground-muted hover:border-border"
          }`}
        >
          {watching ? "■  Stop GPS" : "▶  Start GPS"}
        </button>

        {watching && !error && (
          <div className="md:hidden flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
            <span className="font-mono text-[10px] text-green-500/70 uppercase tracking-wider">
              GPS Active
            </span>
          </div>
        )}

        {/* Stats + hints — pinned below the number */}
        <div className="w-full space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Max Speed",
                value: `${displayMax.toFixed(1)} ${unit === "kmh" ? "km/h" : "mph"}`,
              },
              {
                label: "GPS Accuracy",
                value: accuracy != null ? `±${Math.round(accuracy)} m` : "—",
              },
            ].map(({ label, value }) => (
              <div key={label} className="border border-border bg-surface-muted px-4 py-3">
                <span className={labelCls}>{label}</span>
                <span className="font-mono text-sm text-foreground">{value}</span>
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="border border-red-400/30 bg-red-400/5 px-4 py-3 space-y-1">
              <p className="font-mono text-[11px] text-red-400">{error}</p>
              {permissionDenied && (
                <p className="font-mono text-[10px] text-foreground-muted/50">
                  In Chrome: click the lock icon → Site settings → Location → Allow.
                </p>
              )}
            </div>
          )}

          {!error && !watching && (
            <p className="font-mono text-[10px] text-foreground-muted/35">
              Press Start GPS and allow location permission
            </p>
          )}
          {watching && !error && (
            <p className="font-mono text-[10px] text-foreground-muted/35">
              Needle and readout update in real time. Stationary GPS may show small non-zero values.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
