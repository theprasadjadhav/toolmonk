"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputCls, secondaryBtnCls } from "@/lib/utils/formStyles";

// ── Timezone database ─────────────────────────────────────────────────────────
interface TZEntry {
  iana: string;
  city: string;
  country: string;
  region: string;
  abbrs: string[];
  tags: string[];
}

const TZ_DATA: TZEntry[] = [
  { iana: "UTC", city: "UTC", country: "", region: "Universal", abbrs: ["UTC", "GMT"], tags: ["universal", "coordinated", "greenwich", "zulu"] },
  { iana: "Pacific/Honolulu", city: "Honolulu", country: "USA", region: "Americas", abbrs: ["HST"], tags: ["hawaii", "oahu"] },
  { iana: "America/Anchorage", city: "Anchorage", country: "USA", region: "Americas", abbrs: ["AKST", "AKDT"], tags: ["alaska"] },
  { iana: "America/Los_Angeles", city: "Los Angeles", country: "USA", region: "Americas", abbrs: ["PST", "PDT", "PT"], tags: ["california", "san francisco", "seattle", "portland", "san diego", "las vegas", "pacific", "vancouver"] },
  { iana: "America/Phoenix", city: "Phoenix", country: "USA", region: "Americas", abbrs: ["MST"], tags: ["arizona", "tucson"] },
  { iana: "America/Denver", city: "Denver", country: "USA", region: "Americas", abbrs: ["MST", "MDT", "MT"], tags: ["mountain", "salt lake city", "utah", "albuquerque", "colorado"] },
  { iana: "America/Chicago", city: "Chicago", country: "USA", region: "Americas", abbrs: ["CST", "CDT", "CT"], tags: ["central", "houston", "dallas", "texas", "austin", "minneapolis", "new orleans", "kansas city"] },
  { iana: "America/New_York", city: "New York", country: "USA", region: "Americas", abbrs: ["EST", "EDT", "ET"], tags: ["eastern", "nyc", "boston", "miami", "florida", "atlanta", "philadelphia", "washington dc", "toronto", "montreal", "charlotte", "detroit"] },
  { iana: "America/Halifax", city: "Halifax", country: "Canada", region: "Americas", abbrs: ["AST", "ADT"], tags: ["atlantic", "nova scotia"] },
  { iana: "America/St_Johns", city: "St. John's", country: "Canada", region: "Americas", abbrs: ["NST", "NDT"], tags: ["newfoundland"] },
  { iana: "America/Sao_Paulo", city: "São Paulo", country: "Brazil", region: "Americas", abbrs: ["BRT", "BRST"], tags: ["brazil", "rio de janeiro", "brasilia"] },
  { iana: "America/Argentina/Buenos_Aires", city: "Buenos Aires", country: "Argentina", region: "Americas", abbrs: ["ART"], tags: ["argentina"] },
  { iana: "America/Santiago", city: "Santiago", country: "Chile", region: "Americas", abbrs: ["CLT", "CLST"], tags: ["chile"] },
  { iana: "America/Mexico_City", city: "Mexico City", country: "Mexico", region: "Americas", abbrs: ["CST", "CDT"], tags: ["mexico", "guadalajara", "monterrey"] },
  { iana: "America/Bogota", city: "Bogotá", country: "Colombia", region: "Americas", abbrs: ["COT"], tags: ["colombia"] },
  { iana: "America/Lima", city: "Lima", country: "Peru", region: "Americas", abbrs: ["PET"], tags: ["peru"] },
  { iana: "America/Caracas", city: "Caracas", country: "Venezuela", region: "Americas", abbrs: ["VET"], tags: ["venezuela"] },
  { iana: "Europe/London", city: "London", country: "UK", region: "Europe", abbrs: ["GMT", "BST"], tags: ["united kingdom", "england", "britain", "dublin", "ireland", "reykjavik", "lisbon", "portugal"] },
  { iana: "Europe/Paris", city: "Paris", country: "France", region: "Europe", abbrs: ["CET", "CEST"], tags: ["france", "amsterdam", "netherlands", "brussels", "belgium", "madrid", "spain", "barcelona", "rome", "milan", "italy", "berlin", "germany", "munich", "vienna", "austria", "prague", "warsaw", "poland", "stockholm", "sweden", "oslo", "norway", "copenhagen", "denmark", "zurich", "switzerland"] },
  { iana: "Europe/Athens", city: "Athens", country: "Greece", region: "Europe", abbrs: ["EET", "EEST"], tags: ["greece", "helsinki", "finland", "kyiv", "ukraine", "bucharest", "romania", "sofia", "bulgaria"] },
  { iana: "Europe/Moscow", city: "Moscow", country: "Russia", region: "Europe", abbrs: ["MSK"], tags: ["russia", "saint petersburg"] },
  { iana: "Europe/Istanbul", city: "Istanbul", country: "Turkey", region: "Europe", abbrs: ["TRT"], tags: ["turkey", "ankara"] },
  { iana: "Africa/Cairo", city: "Cairo", country: "Egypt", region: "Africa", abbrs: ["EET"], tags: ["egypt", "alexandria"] },
  { iana: "Africa/Lagos", city: "Lagos", country: "Nigeria", region: "Africa", abbrs: ["WAT"], tags: ["nigeria", "west africa", "accra", "ghana", "dakar", "senegal"] },
  { iana: "Africa/Nairobi", city: "Nairobi", country: "Kenya", region: "Africa", abbrs: ["EAT"], tags: ["kenya", "east africa", "addis ababa", "ethiopia", "dar es salaam", "tanzania"] },
  { iana: "Africa/Johannesburg", city: "Johannesburg", country: "South Africa", region: "Africa", abbrs: ["SAST"], tags: ["south africa", "cape town", "pretoria"] },
  { iana: "Asia/Tehran", city: "Tehran", country: "Iran", region: "Middle East", abbrs: ["IRST", "IRDT"], tags: ["iran", "persia"] },
  { iana: "Asia/Dubai", city: "Dubai", country: "UAE", region: "Middle East", abbrs: ["GST"], tags: ["abu dhabi", "united arab emirates", "uae", "muscat", "oman"] },
  { iana: "Asia/Riyadh", city: "Riyadh", country: "Saudi Arabia", region: "Middle East", abbrs: ["AST"], tags: ["saudi arabia", "jeddah", "mecca", "doha", "qatar", "kuwait", "bahrain"] },
  { iana: "Asia/Baghdad", city: "Baghdad", country: "Iraq", region: "Middle East", abbrs: ["AST"], tags: ["iraq"] },
  { iana: "Asia/Karachi", city: "Karachi", country: "Pakistan", region: "Asia", abbrs: ["PKT"], tags: ["pakistan", "islamabad", "lahore"] },
  { iana: "Asia/Kolkata", city: "New Delhi", country: "India", region: "Asia", abbrs: ["IST"], tags: ["india", "indian", "delhi", "mumbai", "kolkata", "bangalore", "bengaluru", "chennai", "hyderabad", "pune", "ahmedabad"] },
  { iana: "Asia/Kathmandu", city: "Kathmandu", country: "Nepal", region: "Asia", abbrs: ["NPT"], tags: ["nepal"] },
  { iana: "Asia/Dhaka", city: "Dhaka", country: "Bangladesh", region: "Asia", abbrs: ["BST", "BDT"], tags: ["bangladesh"] },
  { iana: "Asia/Colombo", city: "Colombo", country: "Sri Lanka", region: "Asia", abbrs: ["SLST", "IST"], tags: ["sri lanka"] },
  { iana: "Asia/Yangon", city: "Yangon", country: "Myanmar", region: "Asia", abbrs: ["MMT"], tags: ["myanmar", "burma", "rangoon"] },
  { iana: "Asia/Bangkok", city: "Bangkok", country: "Thailand", region: "Asia", abbrs: ["ICT", "THA"], tags: ["thailand", "laos", "vientiane", "phnom penh", "cambodia"] },
  { iana: "Asia/Ho_Chi_Minh", city: "Ho Chi Minh City", country: "Vietnam", region: "Asia", abbrs: ["ICT"], tags: ["vietnam", "saigon", "hcmc", "hanoi"] },
  { iana: "Asia/Jakarta", city: "Jakarta", country: "Indonesia", region: "Asia", abbrs: ["WIB"], tags: ["indonesia", "java", "sumatra", "bandung", "surabaya", "yogyakarta", "wib", "jkt", "western indonesia"] },
  { iana: "Asia/Makassar", city: "Makassar", country: "Indonesia", region: "Asia", abbrs: ["WITA"], tags: ["indonesia", "bali", "lombok", "sulawesi", "kalimantan", "wita", "denpasar"] },
  { iana: "Asia/Jayapura", city: "Jayapura", country: "Indonesia", region: "Asia", abbrs: ["WIT"], tags: ["indonesia", "papua", "west papua", "wit"] },
  { iana: "Asia/Singapore", city: "Singapore", country: "Singapore", region: "Asia", abbrs: ["SGT", "SST"], tags: ["singapore", "sg"] },
  { iana: "Asia/Kuala_Lumpur", city: "Kuala Lumpur", country: "Malaysia", region: "Asia", abbrs: ["MYT"], tags: ["malaysia", "kl", "johor", "penang"] },
  { iana: "Asia/Manila", city: "Manila", country: "Philippines", region: "Asia", abbrs: ["PHT", "PST"], tags: ["philippines", "cebu", "davao"] },
  { iana: "Asia/Shanghai", city: "Shanghai", country: "China", region: "Asia", abbrs: ["CST", "CT"], tags: ["china", "beijing", "guangzhou", "shenzhen", "chongqing"] },
  { iana: "Asia/Hong_Kong", city: "Hong Kong", country: "Hong Kong", region: "Asia", abbrs: ["HKT"], tags: ["hong kong", "hk"] },
  { iana: "Asia/Taipei", city: "Taipei", country: "Taiwan", region: "Asia", abbrs: ["CST", "TW"], tags: ["taiwan"] },
  { iana: "Asia/Tokyo", city: "Tokyo", country: "Japan", region: "Asia", abbrs: ["JST"], tags: ["japan", "osaka", "kyoto", "nagoya", "sapporo"] },
  { iana: "Asia/Seoul", city: "Seoul", country: "South Korea", region: "Asia", abbrs: ["KST"], tags: ["korea", "south korea", "busan"] },
  { iana: "Australia/Perth", city: "Perth", country: "Australia", region: "Oceania", abbrs: ["AWST", "WST"], tags: ["western australia"] },
  { iana: "Australia/Darwin", city: "Darwin", country: "Australia", region: "Oceania", abbrs: ["ACST"], tags: ["northern territory"] },
  { iana: "Australia/Adelaide", city: "Adelaide", country: "Australia", region: "Oceania", abbrs: ["ACST", "ACDT"], tags: ["south australia"] },
  { iana: "Australia/Brisbane", city: "Brisbane", country: "Australia", region: "Oceania", abbrs: ["AEST"], tags: ["queensland", "gold coast"] },
  { iana: "Australia/Sydney", city: "Sydney", country: "Australia", region: "Oceania", abbrs: ["AEST", "AEDT"], tags: ["new south wales", "melbourne", "victoria", "canberra", "tasmania"] },
  { iana: "Pacific/Auckland", city: "Auckland", country: "New Zealand", region: "Oceania", abbrs: ["NZST", "NZDT"], tags: ["new zealand", "wellington", "christchurch"] },
  { iana: "Pacific/Fiji", city: "Suva", country: "Fiji", region: "Oceania", abbrs: ["FJT"], tags: ["fiji"] },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseOffsetStr(s: string): number {
  const m = s.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!m) return 0;
  return (m[1] === "+" ? 1 : -1) * (parseInt(m[2]) * 60 + parseInt(m[3] ?? "0"));
}

function getTZOffsetMins(iana: string, dateStr: string): number {
  const ref = new Date(dateStr + "T12:00:00Z");
  const s = new Intl.DateTimeFormat("en-US", { timeZone: iana, timeZoneName: "shortOffset" })
    .formatToParts(ref).find((p) => p.type === "timeZoneName")?.value ?? "GMT+0";
  return parseOffsetStr(s);
}

function buildRefDate(iana: string, dateStr: string, mins: number): Date {
  const offsetMins = getTZOffsetMins(iana, dateStr);
  const [y, mo, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, mo - 1, d, Math.floor(mins / 60), mins % 60) - offsetMins * 60000);
}

function getTZMeta(iana: string, date: Date) {
  const abbr =
    new Intl.DateTimeFormat("en-US", { timeZone: iana, timeZoneName: "short" })
      .formatToParts(date).find((p) => p.type === "timeZoneName")?.value ?? "";
  const utcOffset = (
    new Intl.DateTimeFormat("en-US", { timeZone: iana, timeZoneName: "shortOffset" })
      .formatToParts(date).find((p) => p.type === "timeZoneName")?.value ?? ""
  ).replace("GMT", "UTC");
  return { abbr, utcOffset };
}

function fmtTime(iana: string, date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: iana, hour: "numeric", minute: "2-digit", hour12: true,
  }).format(date);
}

function fmtDate(iana: string, date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: iana, weekday: "short", month: "short", day: "numeric",
  }).format(date);
}

function getISODate(iana: string, date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: iana, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(date);
}

function filterTZ(q: string): TZEntry[] {
  const lq = q.toLowerCase().trim();
  if (!lq) return TZ_DATA;
  const exact: TZEntry[] = [];
  const partial: TZEntry[] = [];
  for (const tz of TZ_DATA) {
    const isExact = tz.abbrs.some((a) => a.toLowerCase() === lq);
    const hit =
      isExact ||
      tz.city.toLowerCase().includes(lq) ||
      tz.country.toLowerCase().includes(lq) ||
      tz.region.toLowerCase().includes(lq) ||
      tz.iana.toLowerCase().includes(lq) ||
      tz.abbrs.some((a) => a.toLowerCase().includes(lq)) ||
      tz.tags.some((t) => t.includes(lq));
    if (!hit) continue;
    (isExact ? exact : partial).push(tz);
  }
  return [...exact, ...partial];
}

function getLocalTZ(): TZEntry {
  const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return TZ_DATA.find((t) => t.iana === local) ?? TZ_DATA.find((t) => t.iana === "UTC")!;
}

function getNowStrings() {
  const n = new Date();
  const pad = (x: number) => String(x).padStart(2, "0");
  return {
    dateStr: `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`,
    timeStr: `${pad(n.getHours())}:${pad(n.getMinutes())}`,
  };
}

// ── TZPicker ──────────────────────────────────────────────────────────────────

interface TZPickerProps {
  selected: TZEntry;
  onSelect: (tz: TZEntry) => void;
  label: string;
  refDate: Date;
}

function TZPicker({ selected, onSelect, label, refDate }: TZPickerProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => filterTZ(query).slice(0, 18), [query]);
  const meta = useMemo(() => getTZMeta(selected.iana, refDate), [selected.iana, refDate]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapRef} className="relative flex-1 min-w-0">
      <div className={labelCls}>{label}</div>
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 30); }}
        className={cn(
          "w-full text-left px-3 py-2.5 border bg-surface-muted transition-colors",
          open ? "border-foreground-muted" : "border-border hover:border-foreground-muted/50",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-sm text-foreground font-medium truncate">{selected.city}</span>
          <div className="flex items-center gap-1 shrink-0">
            <span className="font-mono text-[10px] bg-primary/10 text-primary px-1.5 py-0.5">{meta.abbr}</span>
            <span className="font-mono text-[10px] text-foreground-muted">{meta.utcOffset}</span>
          </div>
        </div>
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-0.5 border border-foreground-muted/30 bg-surface shadow-xl">
          <div className="p-2 border-b border-border">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="City, country, or abbreviation (Jakarta, WIB, EST, JST…)"
              className="w-full bg-surface border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:border-foreground-muted text-foreground placeholder:text-foreground-muted/50"
            />
          </div>
          <div className="overflow-y-auto max-h-56">
            {results.length === 0 ? (
              <div className="px-3 py-4 text-sm font-mono text-foreground-muted text-center">No results</div>
            ) : (
              results.map((tz) => {
                const m = getTZMeta(tz.iana, refDate);
                return (
                  <button
                    key={tz.iana}
                    onClick={() => { onSelect(tz); setOpen(false); setQuery(""); }}
                    className={cn(
                      "w-full text-left px-3 py-2 flex items-center justify-between gap-2 hover:bg-surface-muted",
                      selected.iana === tz.iana && "bg-primary/5",
                    )}
                  >
                    <div className="min-w-0">
                      <span className="font-mono text-sm text-foreground">{tz.city}</span>
                      {tz.country && <span className="font-mono text-xs text-foreground-muted ml-1.5">{tz.country}</span>}
                      <span className="font-mono text-[10px] text-foreground-muted/40 ml-1.5">· {tz.region}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="font-mono text-[10px] bg-primary/10 text-primary px-1 py-0.5">{m.abbr}</span>
                      <span className="font-mono text-[10px] text-foreground-muted">{m.utcOffset}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Hour Grid ─────────────────────────────────────────────────────────────────

const CELL_W = 52;
const LABEL_W = 144;

interface HourGridProps {
  fromTZ: TZEntry;
  toTZ: TZEntry;
  dateStr: string;
  selectedHour: number;
  onSelectHour: (h: number) => void;
  now: Date;
}

function HourGrid({ fromTZ, toTZ, dateStr, selectedHour, onSelectHour, now }: HourGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Compute UTC instant for each of the 24 hours in FROM timezone
  const utcTimes = useMemo<Date[]>(() => {
    const offsetMins = getTZOffsetMins(fromTZ.iana, dateStr);
    const [y, mo, d] = dateStr.split("-").map(Number);
    return Array.from({ length: 24 }, (_, h) =>
      new Date(Date.UTC(y, mo - 1, d, h, 0) - offsetMins * 60000),
    );
  }, [fromTZ.iana, dateStr]);

  // Auto-scroll to center selected hour
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const target = selectedHour * CELL_W - el.clientWidth / 2 + CELL_W / 2;
    el.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [selectedHour]);

  const fromMeta = useMemo(() => getTZMeta(fromTZ.iana, now), [fromTZ.iana, now]);
  const toMeta = useMemo(() => getTZMeta(toTZ.iana, now), [toTZ.iana, now]);

  return (
    <div className="border border-border flex overflow-hidden">
      {/* Fixed left label column */}
      <div className="shrink-0 bg-surface border-r border-border z-10" style={{ width: LABEL_W }}>
        {/* FROM label */}
        <div className="flex flex-col justify-center px-3 py-2 border-b border-border h-[78px]">
          <div className="font-mono text-xs font-semibold text-foreground truncate">{fromTZ.city}</div>
          {fromTZ.country && <div className="font-mono text-[9px] text-foreground-muted truncate">{fromTZ.country}</div>}
          <div className="flex items-center gap-1 mt-1">
            <span className="font-mono text-[9px] bg-primary/10 text-primary px-1 py-0.5">{fromMeta.abbr}</span>
            <span className="font-mono text-[9px] text-foreground-muted">{fromMeta.utcOffset}</span>
          </div>
        </div>
        {/* TO label */}
        <div className="flex flex-col justify-center px-3 py-2 h-[78px]">
          <div className="font-mono text-xs font-semibold text-foreground truncate">{toTZ.city}</div>
          {toTZ.country && <div className="font-mono text-[9px] text-foreground-muted truncate">{toTZ.country}</div>}
          <div className="flex items-center gap-1 mt-1">
            <span className="font-mono text-[9px] bg-primary/10 text-primary px-1 py-0.5">{toMeta.abbr}</span>
            <span className="font-mono text-[9px] text-foreground-muted">{toMeta.utcOffset}</span>
          </div>
        </div>
      </div>

      {/* Scrollable hour columns */}
      <div ref={scrollRef} className="overflow-x-auto flex-1 overflow-y-hidden">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(24, ${CELL_W}px)`,
            width: `${24 * CELL_W}px`,
          }}
        >
          {/* FROM cells */}
          {utcTimes.map((d, h) => {
            const parts = new Intl.DateTimeFormat("en-US", {
              timeZone: fromTZ.iana, hour: "numeric", hour12: true,
            }).formatToParts(d);
            const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "12");
            const period = (parts.find((p) => p.type === "dayPeriod")?.value ?? "AM").toLowerCase().slice(0, 2);
            const iso = getISODate(fromTZ.iana, d);
            const prevIso = h > 0 ? getISODate(fromTZ.iana, utcTimes[h - 1]) : dateStr;
            const isNewDay = h === 0 || iso !== prevIso;
            const isSelected = h === selectedHour;
            const dateLabel = isNewDay
              ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", weekday: "short" }).format(new Date(iso + "T12:00:00Z"))
              : null;
            return (
              <div
                key={`from-${h}`}
                onClick={() => onSelectHour(h)}
                className={cn(
                  "flex flex-col items-center cursor-pointer select-none transition-colors border-b border-border",
                  h > 0 && "border-l border-border",
                  isSelected ? "bg-primary/10" : "hover:bg-surface-muted",
                )}
                style={{ height: 78 }}
              >
                <div className={cn(
                  "w-full text-center font-mono text-[7px] uppercase tracking-wide leading-none pt-1.5 pb-0.5 px-0.5 truncate",
                  isNewDay ? "text-foreground-muted/60" : "text-transparent pointer-events-none",
                )}>
                  {dateLabel ?? "·"}
                </div>
                <div className={cn("font-mono text-base font-semibold tabular-nums leading-tight", isSelected ? "text-primary" : "text-foreground")}>
                  {hour}
                </div>
                <div className={cn("font-mono text-[9px] pb-1.5 leading-none", isSelected ? "text-primary/80" : "text-foreground-muted")}>
                  {period}
                </div>
              </div>
            );
          })}
          {/* TO cells */}
          {utcTimes.map((d, h) => {
            const parts = new Intl.DateTimeFormat("en-US", {
              timeZone: toTZ.iana, hour: "numeric", hour12: true,
            }).formatToParts(d);
            const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "12");
            const period = (parts.find((p) => p.type === "dayPeriod")?.value ?? "AM").toLowerCase().slice(0, 2);
            const iso = getISODate(toTZ.iana, d);
            const prevIso = h > 0 ? getISODate(toTZ.iana, utcTimes[h - 1]) : getISODate(toTZ.iana, utcTimes[0]);
            const isNewDay = h === 0 || iso !== prevIso;
            const isSelected = h === selectedHour;
            const dateLabel = isNewDay
              ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", weekday: "short" }).format(new Date(iso + "T12:00:00Z"))
              : null;
            return (
              <div
                key={`to-${h}`}
                onClick={() => onSelectHour(h)}
                className={cn(
                  "flex flex-col items-center cursor-pointer select-none transition-colors",
                  h > 0 && "border-l border-border",
                  isSelected ? "bg-primary/10" : "hover:bg-surface-muted",
                )}
                style={{ height: 78 }}
              >
                <div className={cn(
                  "w-full text-center font-mono text-[7px] uppercase tracking-wide leading-none pt-1.5 pb-0.5 px-0.5 truncate",
                  isNewDay ? "text-foreground-muted/60" : "text-transparent pointer-events-none",
                )}>
                  {dateLabel ?? "·"}
                </div>
                <div className={cn("font-mono text-base font-semibold tabular-nums leading-tight", isSelected ? "text-primary" : "text-foreground")}>
                  {hour}
                </div>
                <div className={cn("font-mono text-[9px] pb-1.5 leading-none", isSelected ? "text-primary/80" : "text-foreground-muted")}>
                  {period}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function TimezoneConverter() {
  const [fromTZ, setFromTZ] = useState<TZEntry>(getLocalTZ);
  const [toTZ, setToTZ] = useState<TZEntry>(() => TZ_DATA.find((t) => t.iana === "UTC")!);
  const { dateStr: initDate, timeStr: initTime } = getNowStrings();
  const [dateStr, setDateStr] = useState(initDate);
  const [timeStr, setTimeStr] = useState(initTime);
  const [now, setNow] = useState(() => new Date());

  // Live clock (updates every 10s)
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(id);
  }, []);

  const selectedHour = parseInt(timeStr.split(":")[0] ?? "0");

  // Build reference date from time input in FROM timezone
  const refDate = useMemo(() => {
    const [h, m] = timeStr.split(":").map(Number);
    return buildRefDate(fromTZ.iana, dateStr, h * 60 + (m || 0));
  }, [fromTZ.iana, dateStr, timeStr]);

  // Converted result in TO timezone
  const converted = useMemo(() => {
    const toISO = getISODate(toTZ.iana, refDate);
    const dayDiff = Math.round((new Date(toISO).getTime() - new Date(dateStr).getTime()) / 86400000);
    return {
      time: fmtTime(toTZ.iana, refDate),
      date: fmtDate(toTZ.iana, refDate),
      dayDiff,
    };
  }, [toTZ.iana, refDate, dateStr]);

  const fromMeta = useMemo(() => getTZMeta(fromTZ.iana, now), [fromTZ.iana, now]);
  const toMeta = useMemo(() => getTZMeta(toTZ.iana, now), [toTZ.iana, now]);

  function swap() {
    const prev = fromTZ;
    setFromTZ(toTZ);
    setToTZ(prev);
  }

  function useNow() {
    const { dateStr: d, timeStr: t } = getNowStrings();
    setDateStr(d);
    setTimeStr(t);
  }

  return (
    <div className="space-y-5">
      {/* ── 1. Timezone pickers ── */}
      <div className="flex flex-col sm:flex-row items-end gap-2">
        <TZPicker selected={fromTZ} onSelect={setFromTZ} label="From timezone" refDate={now} />
        <button onClick={swap} title="Swap" className={cn(secondaryBtnCls, "px-3 py-2.5 text-sm shrink-0")}>
          ⇌
        </button>
        <TZPicker selected={toTZ} onSelect={setToTZ} label="To timezone" refDate={now} />
      </div>

      {/* ── 2. Current time for each zone ── */}
      <div className="grid grid-cols-2 gap-3">
        {([{ tz: fromTZ, meta: fromMeta, role: "from" }, { tz: toTZ, meta: toMeta, role: "to" }] as const).map(({ tz, meta, role }) => (
          <div key={role} className="border border-border p-3">
            <div className="font-mono text-[9px] uppercase tracking-widest text-foreground-muted mb-1">
              Current time
            </div>
            <div className="font-mono text-lg sm:text-xl text-foreground font-semibold tabular-nums leading-tight">
              {fmtTime(tz.iana, now)}
            </div>
            <div className="font-mono text-[10px] text-foreground-muted mt-0.5">{fmtDate(tz.iana, now)}</div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="font-mono text-[9px] bg-primary/10 text-primary px-1.5 py-0.5">{meta.abbr}</span>
              <span className="font-mono text-[9px] text-foreground-muted">{meta.utcOffset}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── 3. Time picker + conversion ── */}
      <div className="border border-border grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
        {/* Input side */}
        <div className="p-3 space-y-2">
          <div className={labelCls}>Set time in {fromTZ.city}</div>
          <input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} className={inputCls} />
          <div className="flex gap-2">
            <input
              type="time"
              value={timeStr}
              onChange={(e) => setTimeStr(e.target.value)}
              className={cn(inputCls, "flex-1")}
            />
            <button onClick={useNow} className={cn(secondaryBtnCls, "py-2.5 shrink-0")}>
              Now
            </button>
          </div>
        </div>
        {/* Output side */}
        <div className="p-3 flex flex-col justify-center">
          <div className={labelCls}>In {toTZ.city}</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono text-2xl text-foreground font-semibold tabular-nums">
              {converted.time}
            </span>
            {converted.dayDiff !== 0 && (
              <span
                className={cn(
                  "font-mono text-[10px] px-1.5 py-0.5",
                  converted.dayDiff > 0 ? "bg-primary/10 text-primary" : "bg-foreground-muted/10 text-foreground-muted",
                )}
              >
                {converted.dayDiff > 0 ? "+" : ""}{converted.dayDiff} day{Math.abs(converted.dayDiff) !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="font-mono text-xs text-foreground-muted mt-0.5">{converted.date}</div>
        </div>
      </div>

      {/* ── 4. 24-hour grid ── */}
      <HourGrid
        fromTZ={fromTZ}
        toTZ={toTZ}
        dateStr={dateStr}
        selectedHour={selectedHour}
        onSelectHour={(h) => setTimeStr(`${String(h).padStart(2, "0")}:00`)}
        now={now}
      />
    </div>
  );
}
