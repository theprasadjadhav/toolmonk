"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputCls } from "@/lib/utils/formStyles";

// ── Timezone list ──────────────────────────────────────────────────────────────

const TIMEZONES = [
  { name: "UTC", label: "UTC" },
  { name: "America/New_York", label: "New York (ET)" },
  { name: "America/Chicago", label: "Chicago (CT)" },
  { name: "America/Denver", label: "Denver (MT)" },
  { name: "America/Los_Angeles", label: "Los Angeles (PT)" },
  { name: "America/Anchorage", label: "Anchorage (AKT)" },
  { name: "Pacific/Honolulu", label: "Honolulu (HT)" },
  { name: "America/Toronto", label: "Toronto" },
  { name: "America/Vancouver", label: "Vancouver" },
  { name: "America/Sao_Paulo", label: "São Paulo" },
  { name: "America/Mexico_City", label: "Mexico City" },
  { name: "America/Buenos_Aires", label: "Buenos Aires" },
  { name: "Europe/London", label: "London (GMT/BST)" },
  { name: "Europe/Paris", label: "Paris (CET/CEST)" },
  { name: "Europe/Berlin", label: "Berlin" },
  { name: "Europe/Madrid", label: "Madrid" },
  { name: "Europe/Rome", label: "Rome" },
  { name: "Europe/Amsterdam", label: "Amsterdam" },
  { name: "Europe/Moscow", label: "Moscow" },
  { name: "Europe/Istanbul", label: "Istanbul" },
  { name: "Africa/Cairo", label: "Cairo" },
  { name: "Africa/Lagos", label: "Lagos" },
  { name: "Africa/Johannesburg", label: "Johannesburg" },
  { name: "Asia/Dubai", label: "Dubai" },
  { name: "Asia/Kolkata", label: "India (IST)" },
  { name: "Asia/Dhaka", label: "Dhaka" },
  { name: "Asia/Bangkok", label: "Bangkok" },
  { name: "Asia/Singapore", label: "Singapore" },
  { name: "Asia/Shanghai", label: "Shanghai" },
  { name: "Asia/Tokyo", label: "Tokyo" },
  { name: "Asia/Seoul", label: "Seoul" },
  { name: "Australia/Sydney", label: "Sydney" },
  { name: "Pacific/Auckland", label: "Auckland" },
];

function nowLocalISO(): string {
  const n = new Date();
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}T${pad(n.getHours())}:${pad(n.getMinutes())}`;
}

function fmtInTZ(date: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    timeZoneName: "shortOffset",
    hour12: false,
  }).format(date);
}

export function TimezoneConverter() {
  const [dtStr, setDtStr] = useState(nowLocalISO());
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const date = useMemo(() => (dtStr ? new Date(dtStr) : null), [dtStr]);

  const rows = useMemo(() => {
    if (!date || isNaN(date.getTime())) return [];
    const q = search.toLowerCase();
    return TIMEZONES
      .filter((tz) => !q || tz.label.toLowerCase().includes(q) || tz.name.toLowerCase().includes(q))
      .map((tz) => ({ ...tz, formatted: fmtInTZ(date, tz.name) }));
  }, [date, search]);

  function copy(key: string, val: string) {
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div  className="w-full">
            <label className={labelCls}>— date &amp; time (local input)</label>
            <div className="flex gap-2">
              <input type="datetime-local" value={dtStr}
                onChange={(e) => setDtStr(e.target.value)}
                className={cn(inputCls, "flex-1")} />
            </div>
          </div>
          <button onClick={() => setDtStr(nowLocalISO())}
            className="font-mono text-[10px] px-3 mt-5 py-3 border border-border text-foreground-muted hover:text-primary hover:border-primary/40 transition-colors whitespace-nowrap shrink-0">
            Use now
          </button>

        </div>
        <div>
          <label className={labelCls}>— filter timezones</label>
          <input type="text" value={search} placeholder="Search city or region…"
            onChange={(e) => setSearch(e.target.value)}
            className={inputCls} />
        </div>
      </div>

      {rows.length > 0 && (
        <div className="space-y-1">
          <p className={labelCls}>— converted times</p>
          <div className="border border-border divide-y divide-border">
            {rows.map(({ name, label, formatted }) => (
              <div key={name} className="bg-surface hover:bg-surface-muted transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="px-4 py-2 sm:py-2.5 sm:w-52 sm:shrink-0 sm:border-r border-b sm:border-b-0 border-border space-y-0.5">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/80 block">{label}</span>
                    <span className="font-mono text-[9px] text-foreground-muted/40 block">{name}</span>
                  </div>
                  <div className="flex items-center flex-1 min-w-0">
                    <span className="font-mono text-sm px-4 py-2.5 flex-1 min-w-0 text-foreground/80 break-all">{formatted}</span>
                    <button
                      onClick={() => copy(name, formatted)}
                      className={cn(
                        "font-mono text-[10px] px-3 py-1.5 border mx-2 border-border shrink-0",
                        copied === name ? "text-primary border-primary/40 bg-primary/10" : "text-foreground-muted/80 hover:text-foreground",
                      )}>
                      {copied === name ? "copied!" : "copy"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
