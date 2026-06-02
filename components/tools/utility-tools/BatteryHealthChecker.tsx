"use client";

import { useState, useEffect } from "react";

interface BatteryState {
  level: number;          // 0–1
  charging: boolean;
  chargingTime: number;   // seconds, Infinity if unknown
  dischargingTime: number; // seconds, Infinity if unknown
}

interface BatteryManagerCompat {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  onchargingchange: (() => void) | null;
  onlevelchange: (() => void) | null;
  onchargingtimechange: (() => void) | null;
  ondischargingtimechange: (() => void) | null;
}

type NavigatorWithBattery = Navigator & {
  getBattery?: () => Promise<BatteryManagerCompat>;
};

function fmtTime(secs: number): string {
  if (!isFinite(secs) || secs <= 0) return "—";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function BatteryIcon({ level, charging }: { level: number; charging: boolean }) {
  const pct = Math.round(level * 100);
  const fillColor =
    pct > 50 ? "#22c55e" : pct > 20 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex items-center gap-5">
      {/* Battery body */}
      <div className="flex items-center gap-0.5">
        <div
          className="relative border-2 rounded-sm overflow-hidden"
          style={{ width: 80, height: 38, borderColor: "rgba(255,255,255,0.25)" }}
        >
          <div
            className="absolute left-0 top-0 h-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: fillColor, opacity: 0.8 }}
          />
          {/* Charging bolt */}
          {charging && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="font-mono text-[18px] text-white/90 leading-none">⚡</span>
            </div>
          )}
        </div>
        {/* Nub */}
        <div
          className="rounded-r-sm"
          style={{ width: 5, height: 16, backgroundColor: "rgba(255,255,255,0.25)" }}
        />
      </div>

      {/* Percentage */}
      <div>
        <span className="font-mono text-5xl tabular-nums text-foreground leading-none">{pct}</span>
        <span className="font-mono text-xl text-foreground-muted/50">%</span>
        {charging && (
          <p className="font-mono text-[10px] text-green-500/80 uppercase tracking-wider mt-1">
            Charging
          </p>
        )}
        {!charging && (
          <p className="font-mono text-[10px] text-foreground-muted/40 uppercase tracking-wider mt-1">
            Discharging
          </p>
        )}
      </div>
    </div>
  );
}

export function BatteryHealthChecker() {
  const [battery, setBattery] = useState<BatteryState | null>(null);
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    const nav = navigator as NavigatorWithBattery;
    if (!nav.getBattery) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSupported(false);
      return;
    }

    let manager: BatteryManagerCompat | null = null;

    nav
      .getBattery()
      .then((bat) => {
        manager = bat;
        setSupported(true);

        const sync = () => {
          setBattery({
            level: bat.level,
            charging: bat.charging,
            chargingTime: bat.chargingTime,
            dischargingTime: bat.dischargingTime,
          });
        };

        sync();
        bat.onchargingchange = sync;
        bat.onlevelchange = sync;
        bat.onchargingtimechange = sync;
        bat.ondischargingtimechange = sync;
      })
      .catch(() => {
        setSupported(false);
      });

    return () => {
      if (manager) {
        manager.onchargingchange = null;
        manager.onlevelchange = null;
        manager.onchargingtimechange = null;
        manager.ondischargingtimechange = null;
      }
    };
  }, []);

  if (supported === null) {
    return (
      <p className="font-mono text-[10px] text-foreground-muted/40">Checking battery status…</p>
    );
  }

  if (!supported) {
    return (
      <div className="border border-border bg-surface-muted px-6 py-10 text-center space-y-3">
        <p className="font-mono text-sm text-foreground">Battery health check not supported</p>
        <p className="font-mono text-[10px] text-foreground-muted/50 max-w-sm mx-auto">
          The Battery health check is not available in this browser. It is supported in Chrome and
          Chromium-based browsers. Firefox removed support in 2019 for privacy reasons; Safari does
          not support it.
        </p>
        <p className="font-mono text-[10px] text-foreground-muted/40">
          Try opening this page in Chrome or Edge to use this tool.
        </p>
      </div>
    );
  }

  if (!battery) {
    return (
      <p className="font-mono text-[10px] text-foreground-muted/40">Reading battery…</p>
    );
  }

  const pct = Math.round(battery.level * 100);

  const rows = [
    {
      key: "level",
      label: "Battery Level",
      value: `${pct}%`,
    },
    {
      key: "status",
      label: "Status",
      value: battery.charging ? "Charging" : "Discharging",
    },
    {
      key: "charge-time",
      label: "Time to Full Charge",
      value: battery.charging ? fmtTime(battery.chargingTime) : "—",
    },
    {
      key: "discharge-time",
      label: "Time Remaining",
      value: !battery.charging ? fmtTime(battery.dischargingTime) : "—",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Visual battery */}
      <div className="border border-border bg-surface-muted px-6 py-6">
        <BatteryIcon level={battery.level} charging={battery.charging} />
      </div>

      {/* Stats table */}
      <div className="border border-border divide-y divide-border">
        {rows.map(({ key, label, value }) => (
          <div
            key={key}
            className="flex items-center bg-surface hover:bg-surface-muted transition-colors"
          >
            <span className="font-mono text-[10px] uppercase tracking-wider px-4 py-3 w-44 sm:w-52 shrink-0 border-r border-border text-foreground-muted/70">
              {label}
            </span>
            <span className="font-mono text-sm px-4 py-3 flex-1 text-foreground/80">{value}</span>
          </div>
        ))}
      </div>

      {/* Low battery warning */}
      {pct <= 20 && !battery.charging && (
        <div className="border border-red-400/30 bg-red-400/5 px-4 py-3">
          <p className="font-mono text-[11px] text-red-400">
            Battery low — consider plugging in your device.
          </p>
        </div>
      )}

      <p className="font-mono text-[10px] text-foreground-muted/40">
        Some operating systems and battery drivers do not provide discharge time and charging time estimates to the browser.
      </p>
    </div>
  );
}
