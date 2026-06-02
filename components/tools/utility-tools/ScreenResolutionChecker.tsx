"use client";

import { useState, useEffect, useCallback } from "react";

interface ScreenInfo {
  screenW: number;
  screenH: number;
  physicalW: number;
  physicalH: number;
  viewportW: number;
  viewportH: number;
  outerW: number;
  outerH: number;
  availW: number;
  availH: number;
  dpr: number;
  colorDepth: number;
  orientation: string;
  refreshRate: number | null;
}

function measureRefreshRate(): Promise<number | null> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === "undefined") {
      resolve(null);
      return;
    }
    const durations: number[] = [];
    let last = 0;
    let count = 0;

    function step(ts: number) {
      if (last) durations.push(ts - last);
      last = ts;
      count++;
      if (count < 40) {
        requestAnimationFrame(step);
      } else {
        const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
        resolve(Math.round(1000 / avg));
      }
    }
    requestAnimationFrame(step);
  });
}

const labelCls =
  "font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60 block mb-0.5";

export function ScreenResolutionChecker() {
  const [info, setInfo] = useState<ScreenInfo | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [measuring, setMeasuring] = useState(false);

  const readInfo = useCallback(async () => {
    setMeasuring(true);
    const dpr = window.devicePixelRatio || 1;
    const refreshRate = await measureRefreshRate();
    setInfo({
      screenW: screen.width,
      screenH: screen.height,
      physicalW: Math.round(screen.width * dpr),
      physicalH: Math.round(screen.height * dpr),
      viewportW: window.innerWidth,
      viewportH: window.innerHeight,
      outerW: window.outerWidth,
      outerH: window.outerHeight,
      availW: screen.availWidth,
      availH: screen.availHeight,
      dpr,
      colorDepth: screen.colorDepth,
      orientation: screen.orientation?.type ?? "unknown",
      refreshRate,
    });
    setMeasuring(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    readInfo();
    const handler = () => readInfo();
    window.addEventListener("resize", handler);
    window.addEventListener("orientationchange", handler);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("orientationchange", handler);
    };
  }, [readInfo]);

  const copyVal = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  if (!info) {
    return (
      <p className="font-mono text-[10px] text-foreground-muted/40">Reading display info…</p>
    );
  }

  const rows = [
    {
      key: "screen",
      label: "Screen Resolution",
      value: `${info.screenW} × ${info.screenH} px`,
      hint: "CSS pixels reported by the OS",
    },
    {
      key: "physical",
      label: "Physical Resolution",
      value: `${info.physicalW} × ${info.physicalH} px`,
      hint: `Screen × device pixel ratio (${info.dpr}×)`,
    },
    {
      key: "viewport",
      label: "Viewport Size",
      value: `${info.viewportW} × ${info.viewportH} px`,
      hint: "Browser viewport (window.innerWidth × innerHeight)",
    },
    {
      key: "outer",
      label: "Browser Window",
      value: `${info.outerW} × ${info.outerH} px`,
      hint: "Outer window including browser chrome",
    },
    {
      key: "avail",
      label: "Available Screen",
      value: `${info.availW} × ${info.availH} px`,
      hint: "Excludes taskbar, dock, and system UI",
    },
    {
      key: "dpr",
      label: "Device Pixel Ratio",
      value: `${info.dpr}×`,
      hint: "Physical pixels per CSS pixel",
    },
    {
      key: "color",
      label: "Color Depth",
      value: `${info.colorDepth}-bit`,
      hint: `${(2 ** info.colorDepth).toLocaleString()} possible colors`,
    },
    {
      key: "orient",
      label: "Orientation",
      value: info.orientation,
      hint: "Current screen orientation type",
    },
    {
      key: "refresh",
      label: "Refresh Rate",
      value: info.refreshRate ? `~${info.refreshRate} Hz` : "Unknown",
      hint: "Estimated via requestAnimationFrame timing",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={readInfo}
          disabled={measuring}
          className="font-mono text-[10px] px-4 py-2 border border-border text-foreground-muted hover:text-primary hover:border-primary/40 disabled:opacity-40 transition-colors uppercase tracking-wider"
        >
          {measuring ? "Measuring…" : "↻ Refresh"}
        </button>
        <span className="font-mono text-[10px] text-foreground-muted/40">
          Auto-updates on resize or orientation change
        </span>
      </div>

      <div className="border border-border divide-y divide-border">
        {rows.map(({ key, label, value, hint }) => (
          <div
            key={key}
            className="flex items-start sm:items-center bg-surface hover:bg-surface-muted transition-colors"
          >
            <div className="w-36 sm:w-48 shrink-0 border-r border-border px-4 py-3">
              <span className={labelCls}>{label}</span>
            </div>
            <div className="flex-1 px-4 py-3 min-w-0">
              <span className="font-mono text-sm text-foreground block">{value}</span>
              <span className="font-mono text-[10px] text-foreground-muted/40">{hint}</span>
            </div>
            <button
              onClick={() => copyVal(key, value)}
              className="font-mono text-[10px] px-3 py-3 text-foreground-muted/40 hover:text-primary shrink-0 transition-colors"
              title="Copy value"
            >
              {copied === key ? "✓" : "⎘"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
