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
  // Americas
  { iana: "Pacific/Honolulu", city: "Honolulu", country: "USA", region: "Americas", abbrs: ["HST"], tags: ["hawaii", "oahu", "pacific"] },
  { iana: "America/Anchorage", city: "Anchorage", country: "USA", region: "Americas", abbrs: ["AKST", "AKDT"], tags: ["alaska"] },
  { iana: "America/Los_Angeles", city: "Los Angeles", country: "USA", region: "Americas", abbrs: ["PST", "PDT", "PT"], tags: ["california", "san francisco", "seattle", "portland", "san diego", "las vegas", "pacific", "vancouver"] },
  { iana: "America/Phoenix", city: "Phoenix", country: "USA", region: "Americas", abbrs: ["MST"], tags: ["arizona", "tucson", "no dst"] },
  { iana: "America/Denver", city: "Denver", country: "USA", region: "Americas", abbrs: ["MST", "MDT", "MT"], tags: ["mountain", "salt lake city", "utah", "albuquerque", "colorado", "boulder"] },
  { iana: "America/Chicago", city: "Chicago", country: "USA", region: "Americas", abbrs: ["CST", "CDT", "CT"], tags: ["central", "houston", "dallas", "texas", "austin", "minneapolis", "new orleans", "kansas city"] },
  { iana: "America/New_York", city: "New York", country: "USA", region: "Americas", abbrs: ["EST", "EDT", "ET"], tags: ["eastern", "nyc", "boston", "miami", "florida", "atlanta", "philadelphia", "washington dc", "toronto", "montreal", "charlotte", "detroit"] },
  { iana: "America/Halifax", city: "Halifax", country: "Canada", region: "Americas", abbrs: ["AST", "ADT"], tags: ["atlantic", "nova scotia", "new brunswick"] },
  { iana: "America/St_Johns", city: "St. John's", country: "Canada", region: "Americas", abbrs: ["NST", "NDT"], tags: ["newfoundland"] },
  { iana: "America/Sao_Paulo", city: "São Paulo", country: "Brazil", region: "Americas", abbrs: ["BRT", "BRST"], tags: ["brazil", "rio de janeiro", "brasilia", "belo horizonte"] },
  { iana: "America/Argentina/Buenos_Aires", city: "Buenos Aires", country: "Argentina", region: "Americas", abbrs: ["ART"], tags: ["argentina"] },
  { iana: "America/Santiago", city: "Santiago", country: "Chile", region: "Americas", abbrs: ["CLT", "CLST"], tags: ["chile"] },
  { iana: "America/Mexico_City", city: "Mexico City", country: "Mexico", region: "Americas", abbrs: ["CST", "CDT"], tags: ["mexico", "guadalajara", "monterrey", "cdmx"] },
  { iana: "America/Bogota", city: "Bogotá", country: "Colombia", region: "Americas", abbrs: ["COT"], tags: ["colombia", "bogota"] },
  { iana: "America/Lima", city: "Lima", country: "Peru", region: "Americas", abbrs: ["PET"], tags: ["peru"] },
  { iana: "America/Caracas", city: "Caracas", country: "Venezuela", region: "Americas", abbrs: ["VET"], tags: ["venezuela"] },
  // Europe
  { iana: "Europe/London", city: "London", country: "UK", region: "Europe", abbrs: ["GMT", "BST", "WET"], tags: ["united kingdom", "england", "britain", "great britain", "uk", "dublin", "ireland", "reykjavik", "iceland", "lisbon", "portugal"] },
  { iana: "Europe/Paris", city: "Paris", country: "France", region: "Europe", abbrs: ["CET", "CEST"], tags: ["france", "amsterdam", "netherlands", "brussels", "belgium", "madrid", "spain", "barcelona", "rome", "milan", "italy", "berlin", "germany", "munich", "hamburg", "vienna", "austria", "prague", "czech", "warsaw", "poland", "stockholm", "sweden", "oslo", "norway", "copenhagen", "denmark", "zurich", "switzerland"] },
  { iana: "Europe/Athens", city: "Athens", country: "Greece", region: "Europe", abbrs: ["EET", "EEST"], tags: ["greece", "helsinki", "finland", "kyiv", "kiev", "ukraine", "bucharest", "romania", "sofia", "bulgaria", "riga", "latvia", "vilnius", "lithuania", "tallinn", "estonia"] },
  { iana: "Europe/Moscow", city: "Moscow", country: "Russia", region: "Europe", abbrs: ["MSK"], tags: ["russia", "saint petersburg"] },
  { iana: "Europe/Istanbul", city: "Istanbul", country: "Turkey", region: "Europe", abbrs: ["TRT"], tags: ["turkey", "ankara", "turkiye"] },
  // Africa
  { iana: "Africa/Cairo", city: "Cairo", country: "Egypt", region: "Africa", abbrs: ["EET", "EST"], tags: ["egypt", "alexandria"] },
  { iana: "Africa/Lagos", city: "Lagos", country: "Nigeria", region: "Africa", abbrs: ["WAT"], tags: ["nigeria", "west africa", "accra", "ghana", "abidjan", "ivory coast", "dakar", "senegal"] },
  { iana: "Africa/Nairobi", city: "Nairobi", country: "Kenya", region: "Africa", abbrs: ["EAT"], tags: ["kenya", "east africa", "addis ababa", "ethiopia", "dar es salaam", "tanzania", "kampala", "uganda"] },
  { iana: "Africa/Johannesburg", city: "Johannesburg", country: "South Africa", region: "Africa", abbrs: ["SAST"], tags: ["south africa", "cape town", "pretoria", "durban"] },
  // Middle East
  { iana: "Asia/Tehran", city: "Tehran", country: "Iran", region: "Middle East", abbrs: ["IRST", "IRDT"], tags: ["iran", "persia", "isfahan"] },
  { iana: "Asia/Dubai", city: "Dubai", country: "UAE", region: "Middle East", abbrs: ["GST"], tags: ["abu dhabi", "united arab emirates", "uae", "muscat", "oman"] },
  { iana: "Asia/Riyadh", city: "Riyadh", country: "Saudi Arabia", region: "Middle East", abbrs: ["AST"], tags: ["saudi arabia", "jeddah", "mecca", "medina", "doha", "qatar", "kuwait", "bahrain", "ksa"] },
  { iana: "Asia/Baghdad", city: "Baghdad", country: "Iraq", region: "Middle East", abbrs: ["AST"], tags: ["iraq"] },
  { iana: "Asia/Amman", city: "Amman", country: "Jordan", region: "Middle East", abbrs: ["EET", "EEST"], tags: ["jordan", "beirut", "lebanon"] },
  // Asia – South
  { iana: "Asia/Karachi", city: "Karachi", country: "Pakistan", region: "Asia", abbrs: ["PKT"], tags: ["pakistan", "islamabad", "lahore", "peshawar"] },
  { iana: "Asia/Kolkata", city: "New Delhi", country: "India", region: "Asia", abbrs: ["IST"], tags: ["india", "indian", "delhi", "mumbai", "kolkata", "bangalore", "bengaluru", "chennai", "hyderabad", "pune", "ahmedabad", "jaipur", "surat"] },
  { iana: "Asia/Kathmandu", city: "Kathmandu", country: "Nepal", region: "Asia", abbrs: ["NPT"], tags: ["nepal"] },
  { iana: "Asia/Dhaka", city: "Dhaka", country: "Bangladesh", region: "Asia", abbrs: ["BST", "BDT"], tags: ["bangladesh", "chittagong"] },
  { iana: "Asia/Colombo", city: "Colombo", country: "Sri Lanka", region: "Asia", abbrs: ["SLST", "IST"], tags: ["sri lanka", "ceylon"] },
  // Asia – Southeast
  { iana: "Asia/Yangon", city: "Yangon", country: "Myanmar", region: "Asia", abbrs: ["MMT"], tags: ["myanmar", "burma", "rangoon", "naypyidaw"] },
  { iana: "Asia/Bangkok", city: "Bangkok", country: "Thailand", region: "Asia", abbrs: ["ICT", "THA"], tags: ["thailand", "thai", "laos", "vientiane", "phnom penh", "cambodia"] },
  { iana: "Asia/Ho_Chi_Minh", city: "Ho Chi Minh City", country: "Vietnam", region: "Asia", abbrs: ["ICT"], tags: ["vietnam", "saigon", "hcmc", "hanoi", "ho chi minh"] },
  { iana: "Asia/Jakarta", city: "Jakarta", country: "Indonesia", region: "Asia", abbrs: ["WIB"], tags: ["indonesia", "java", "sumatra", "bandung", "surabaya", "yogyakarta", "wib", "jkt", "western indonesia"] },
  { iana: "Asia/Makassar", city: "Makassar", country: "Indonesia", region: "Asia", abbrs: ["WITA"], tags: ["indonesia", "bali", "lombok", "sulawesi", "kalimantan", "wita", "central indonesia", "denpasar"] },
  { iana: "Asia/Jayapura", city: "Jayapura", country: "Indonesia", region: "Asia", abbrs: ["WIT"], tags: ["indonesia", "papua", "west papua", "wit", "eastern indonesia"] },
  { iana: "Asia/Singapore", city: "Singapore", country: "Singapore", region: "Asia", abbrs: ["SGT", "SST"], tags: ["singapore", "sg"] },
  { iana: "Asia/Kuala_Lumpur", city: "Kuala Lumpur", country: "Malaysia", region: "Asia", abbrs: ["MYT"], tags: ["malaysia", "kl", "johor", "penang"] },
  { iana: "Asia/Manila", city: "Manila", country: "Philippines", region: "Asia", abbrs: ["PHT", "PST"], tags: ["philippines", "cebu", "davao"] },
  // Asia – East
  { iana: "Asia/Shanghai", city: "Shanghai", country: "China", region: "Asia", abbrs: ["CST", "CT"], tags: ["china", "beijing", "guangzhou", "shenzhen", "chongqing", "wuhan", "chengdu"] },
  { iana: "Asia/Hong_Kong", city: "Hong Kong", country: "Hong Kong", region: "Asia", abbrs: ["HKT"], tags: ["hong kong", "hk", "hongkong"] },
  { iana: "Asia/Taipei", city: "Taipei", country: "Taiwan", region: "Asia", abbrs: ["CST", "TW"], tags: ["taiwan", "roc"] },
  { iana: "Asia/Tokyo", city: "Tokyo", country: "Japan", region: "Asia", abbrs: ["JST"], tags: ["japan", "osaka", "kyoto", "nagoya", "sapporo", "fukuoka"] },
  { iana: "Asia/Seoul", city: "Seoul", country: "South Korea", region: "Asia", abbrs: ["KST"], tags: ["korea", "south korea", "busan", "incheon"] },
  // Oceania
  { iana: "Australia/Perth", city: "Perth", country: "Australia", region: "Oceania", abbrs: ["AWST", "WST"], tags: ["western australia"] },
  { iana: "Australia/Darwin", city: "Darwin", country: "Australia", region: "Oceania", abbrs: ["ACST"], tags: ["northern territory"] },
  { iana: "Australia/Adelaide", city: "Adelaide", country: "Australia", region: "Oceania", abbrs: ["ACST", "ACDT"], tags: ["south australia"] },
  { iana: "Australia/Brisbane", city: "Brisbane", country: "Australia", region: "Oceania", abbrs: ["AEST"], tags: ["queensland", "gold coast"] },
  { iana: "Australia/Sydney", city: "Sydney", country: "Australia", region: "Oceania", abbrs: ["AEST", "AEDT"], tags: ["new south wales", "nsw", "melbourne", "victoria", "canberra", "act", "hobart", "tasmania"] },
  { iana: "Pacific/Auckland", city: "Auckland", country: "New Zealand", region: "Oceania", abbrs: ["NZST", "NZDT"], tags: ["new zealand", "nz", "wellington", "christchurch"] },
  { iana: "Pacific/Fiji", city: "Suva", country: "Fiji", region: "Oceania", abbrs: ["FJT"], tags: ["fiji"] },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseOffsetStr(offsetStr: string): number {
  const match = offsetStr.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!match) return 0;
  const sign = match[1] === "+" ? 1 : -1;
  return sign * (parseInt(match[2]) * 60 + parseInt(match[3] ?? "0"));
}

/** Build a UTC Date that represents `sliderMinutes` in `iana` timezone on `dateStr`. */
function buildRefDate(iana: string, dateStr: string, sliderMinutes: number): Date {
  const midday = new Date(dateStr + "T12:00:00Z");
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: iana,
    timeZoneName: "shortOffset",
  }).formatToParts(midday);
  const offsetStr = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+0";
  const offsetMins = parseOffsetStr(offsetStr);
  const [y, mo, d] = dateStr.split("-").map(Number);
  const h = Math.floor(sliderMinutes / 60);
  const m = sliderMinutes % 60;
  return new Date(Date.UTC(y, mo - 1, d, h, m) - offsetMins * 60000);
}

function getTZDisplay(iana: string, date: Date) {
  const fmtParts = new Intl.DateTimeFormat("en-US", {
    timeZone: iana,
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
    hour12: true,
    weekday: "short",
    timeZoneName: "short",
  }).formatToParts(date);

  const get = (type: string) => fmtParts.find((p) => p.type === type)?.value ?? "";

  const abbr = get("timeZoneName");

  const offsetParts = new Intl.DateTimeFormat("en-US", {
    timeZone: iana,
    timeZoneName: "shortOffset",
  }).formatToParts(date);
  const utcOffset = (offsetParts.find((p) => p.type === "timeZoneName")?.value ?? "").replace("GMT", "UTC");

  // 24-hour value for bar position
  const h24Parts = new Intl.DateTimeFormat("en-US", {
    timeZone: iana,
    hour: "2-digit", minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const h24 = parseInt(h24Parts.find((p) => p.type === "hour")?.value ?? "0");
  const m24 = parseInt(h24Parts.find((p) => p.type === "minute")?.value ?? "0");

  // Date string in IANA tz for day-diff
  const dateInTZ = new Intl.DateTimeFormat("en-CA", {
    timeZone: iana,
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(date);

  return {
    time: `${get("hour")}:${get("minute")} ${get("dayPeriod")}`,
    dateLong: `${get("weekday")}, ${get("month")} ${get("day")}, ${get("year")}`,
    dateISO: dateInTZ,
    abbr,
    utcOffset,
    barMinutes: h24 === 24 ? 0 : h24 * 60 + m24,
  };
}

function filterTZ(query: string): TZEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return TZ_DATA;
  // Exact abbr match scores higher — put them first
  const exact: TZEntry[] = [];
  const partial: TZEntry[] = [];
  for (const tz of TZ_DATA) {
    const isExactAbbr = tz.abbrs.some((a) => a.toLowerCase() === q);
    const matches =
      isExactAbbr ||
      tz.city.toLowerCase().includes(q) ||
      tz.country.toLowerCase().includes(q) ||
      tz.region.toLowerCase().includes(q) ||
      tz.iana.toLowerCase().includes(q) ||
      tz.abbrs.some((a) => a.toLowerCase().includes(q)) ||
      tz.tags.some((t) => t.includes(q));
    if (!matches) continue;
    if (isExactAbbr) exact.push(tz);
    else partial.push(tz);
  }
  return [...exact, ...partial];
}

function getToday(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

function getNowMinutes(): number {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
}

function getLocalTZ(): TZEntry {
  const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return TZ_DATA.find((t) => t.iana === local) ?? TZ_DATA.find((t) => t.iana === "UTC")!;
}

function daysBetween(aISO: string, bISO: string): number {
  return Math.round((new Date(aISO).getTime() - new Date(bISO).getTime()) / 86400000);
}

function fmt24(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => filterTZ(query).slice(0, 18), [query]);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  function handleSelect(tz: TZEntry) {
    onSelect(tz);
    setOpen(false);
    setQuery("");
  }

  function handleOpen() {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 30);
  }

  const info = getTZDisplay(selected.iana, refDate);

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      <div className={labelCls}>{label}</div>
      <button
        onClick={handleOpen}
        className={cn(
          "w-full text-left px-3 py-2.5 border bg-surface-muted transition-colors",
          open ? "border-foreground-muted" : "border-border hover:border-foreground-muted/50",
        )}
      >
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="min-w-0">
            <span className="font-mono text-sm text-foreground font-medium">{selected.city}</span>
            {selected.country && (
              <span className="font-mono text-xs text-foreground-muted ml-1.5">{selected.country}</span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="font-mono text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 leading-tight">{info.abbr}</span>
            <span className="font-mono text-[10px] text-foreground-muted">{info.utcOffset}</span>
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
              placeholder="Search city, country, or abbreviation (e.g. Jakarta, WIB, EST, JST)…"
              className="w-full bg-surface border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:border-foreground-muted text-foreground placeholder:text-foreground-muted/50"
            />
          </div>
          <div className="overflow-y-auto max-h-60">
            {results.length === 0 ? (
              <div className="px-3 py-4 text-sm font-mono text-foreground-muted text-center">No results</div>
            ) : (
              results.map((tz) => {
                const tzInfo = getTZDisplay(tz.iana, refDate);
                return (
                  <button
                    key={tz.iana}
                    onClick={() => handleSelect(tz)}
                    className={cn(
                      "w-full text-left px-3 py-2 flex items-center justify-between gap-2 hover:bg-surface-muted transition-colors",
                      selected.iana === tz.iana && "bg-primary/5",
                    )}
                  >
                    <div className="min-w-0">
                      <span className="font-mono text-sm text-foreground">{tz.city}</span>
                      {tz.country && (
                        <span className="font-mono text-xs text-foreground-muted ml-1.5">{tz.country}</span>
                      )}
                      <span className="font-mono text-[10px] text-foreground-muted/50 ml-1.5">· {tz.region}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="font-mono text-[10px] bg-primary/10 text-primary px-1 py-0.5">{tzInfo.abbr}</span>
                      <span className="font-mono text-[10px] text-foreground-muted">{tzInfo.utcOffset}</span>
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

// ── Timeline Bar ──────────────────────────────────────────────────────────────

interface TimeBarProps {
  barMinutes: number;
  label: string;
  color: "primary" | "secondary";
}

function TimeBar({ barMinutes, label, color }: TimeBarProps) {
  const pct = Math.min(100, (barMinutes / 1440) * 100);
  const isPrimary = color === "primary";
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <span className="font-mono text-[10px] text-foreground-muted uppercase tracking-wider truncate mr-2">{label}</span>
        <span className={cn("font-mono text-[11px] shrink-0", isPrimary ? "text-primary" : "text-foreground-muted")}>{fmt24(barMinutes)}</span>
      </div>
      <div className="relative h-3 bg-surface-muted border border-border overflow-hidden">
        {/* Fill */}
        <div
          className={cn("absolute left-0 top-0 bottom-0 transition-all", isPrimary ? "bg-primary/30" : "bg-foreground-muted/20")}
          style={{ width: `${pct}%` }}
        />
        {/* Hour guides */}
        {[6, 12, 18].map((h) => (
          <div
            key={h}
            className="absolute top-0 bottom-0 w-px bg-border/60"
            style={{ left: `${(h / 24) * 100}%` }}
          />
        ))}
        {/* Marker */}
        <div
          className={cn(
            "absolute top-0.5 bottom-0.5 w-1.5 rounded-sm transition-all",
            isPrimary ? "bg-primary" : "bg-foreground-muted/60",
          )}
          style={{ left: `calc(${pct}% - 3px)` }}
        />
      </div>
      <div className="flex justify-between text-[8px] font-mono text-foreground-muted/50 px-0.5">
        {["0", "6", "12", "18", "24"].map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function TimezoneConverter() {
  const [fromTZ, setFromTZ] = useState<TZEntry>(getLocalTZ);
  const [toTZ, setToTZ] = useState<TZEntry>(() => TZ_DATA.find((t) => t.iana === "UTC")!);
  const [dateStr, setDateStr] = useState(getToday);
  const [sliderMinutes, setSliderMinutes] = useState(getNowMinutes);

  const refDate = useMemo(
    () => buildRefDate(fromTZ.iana, dateStr, sliderMinutes),
    [fromTZ.iana, dateStr, sliderMinutes],
  );

  const fromDisplay = useMemo(() => getTZDisplay(fromTZ.iana, refDate), [fromTZ.iana, refDate]);
  const toDisplay = useMemo(() => getTZDisplay(toTZ.iana, refDate), [toTZ.iana, refDate]);

  const dayDiff = useMemo(
    () => daysBetween(toDisplay.dateISO, fromDisplay.dateISO),
    [toDisplay.dateISO, fromDisplay.dateISO],
  );

  function swap() {
    const prev = fromTZ;
    setFromTZ(toTZ);
    setToTZ(prev);
  }

  function useNow() {
    setDateStr(getToday());
    setSliderMinutes(getNowMinutes());
  }

  const sliderH = Math.floor(sliderMinutes / 60);
  const sliderM = sliderMinutes % 60;

  return (
    <div className="space-y-5">
      {/* ── Timezone pickers ── */}
      <div className="flex flex-col sm:flex-row items-end gap-2">
        <TZPicker selected={fromTZ} onSelect={setFromTZ} label="From" refDate={refDate} />
        <button
          onClick={swap}
          title="Swap timezones"
          className={cn(secondaryBtnCls, "shrink-0 px-3 py-2.5 text-sm")}
        >
          ⇌
        </button>
        <TZPicker selected={toTZ} onSelect={setToTZ} label="To" refDate={refDate} />
      </div>

      {/* ── Conversion card ── */}
      <div className="border border-border grid grid-cols-2 divide-x divide-border">
        {/* From */}
        <div className="p-3 sm:p-4 space-y-1">
          <div className="font-mono text-[9px] uppercase tracking-widest text-foreground-muted">
            {fromTZ.city}{fromTZ.country ? `, ${fromTZ.country}` : ""}
          </div>
          <div className="font-mono text-xl sm:text-2xl text-foreground font-semibold tabular-nums">
            {fromDisplay.time}
          </div>
          <div className="font-mono text-[10px] text-foreground-muted">{fromDisplay.dateLong}</div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="font-mono text-[10px] bg-primary/10 text-primary px-1.5 py-0.5">
              {fromDisplay.abbr}
            </span>
            <span className="font-mono text-[10px] text-foreground-muted">{fromDisplay.utcOffset}</span>
          </div>
        </div>
        {/* To */}
        <div className="p-3 sm:p-4 space-y-1">
          <div className="font-mono text-[9px] uppercase tracking-widest text-foreground-muted">
            {toTZ.city}{toTZ.country ? `, ${toTZ.country}` : ""}
          </div>
          <div className="font-mono text-xl sm:text-2xl text-foreground font-semibold tabular-nums">
            {toDisplay.time}
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-foreground-muted">
            <span>{toDisplay.dateLong}</span>
            {dayDiff !== 0 && (
              <span className={cn("px-1 py-0.5", dayDiff > 0 ? "bg-primary/10 text-primary" : "bg-foreground-muted/10")}>
                {dayDiff > 0 ? `+${dayDiff}` : dayDiff} day{Math.abs(dayDiff) !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="font-mono text-[10px] bg-primary/10 text-primary px-1.5 py-0.5">
              {toDisplay.abbr}
            </span>
            <span className="font-mono text-[10px] text-foreground-muted">{toDisplay.utcOffset}</span>
          </div>
        </div>
      </div>

      {/* ── Date picker ── */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className={labelCls}>Date</label>
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className={inputCls}
          />
        </div>
        <button onClick={useNow} className={cn(secondaryBtnCls, "py-2.5")}>
          Now
        </button>
      </div>

      {/* ── Time slider ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className={labelCls}>
            Time in {fromTZ.city} ({fromDisplay.abbr})
          </label>
          <span className="font-mono text-sm text-foreground tabular-nums">
            {String(sliderH).padStart(2, "0")}:{String(sliderM).padStart(2, "0")}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={1439}
          step={5}
          value={sliderMinutes}
          onChange={(e) => setSliderMinutes(Number(e.target.value))}
          className="w-full cursor-pointer accent-primary"
          style={{ height: "6px" }}
        />
        <div className="flex justify-between text-[9px] font-mono text-foreground-muted/60 -mt-0.5 px-0.5">
          {["0", "3", "6", "9", "12", "15", "18", "21", "24"].map((h) => (
            <span key={h}>{h}</span>
          ))}
        </div>
      </div>

      {/* ── 24-hour timeline comparison ── */}
      <div className="border border-border p-3 sm:p-4 space-y-4">
        <div className={cn(labelCls, "!mb-0")}>24-hour timeline</div>
        <TimeBar barMinutes={fromDisplay.barMinutes} label={`${fromTZ.city} · ${fromDisplay.abbr} · ${fromDisplay.utcOffset}`} color="primary" />
        <TimeBar barMinutes={toDisplay.barMinutes} label={`${toTZ.city} · ${toDisplay.abbr} · ${toDisplay.utcOffset}`} color="secondary" />

        {/* Quick hour reference */}
        <div className="pt-1 border-t border-border">
          <div className={cn(labelCls, "!mb-2")}>Quick reference — same moment at key hours</div>
          <div className="grid grid-cols-4 gap-1">
            {[0, 6, 9, 12, 15, 18, 21, 23].map((h) => {
              const mins = h * 60;
              const d = buildRefDate(fromTZ.iana, dateStr, mins);
              const toDisp = getTZDisplay(toTZ.iana, d);
              const dd = daysBetween(toDisp.dateISO, dateStr);
              const isActive = sliderH === h && sliderM < 5;
              return (
                <button
                  key={h}
                  onClick={() => setSliderMinutes(h * 60)}
                  className={cn(
                    "text-left px-2 py-1.5 border transition-colors",
                    isActive
                      ? "border-primary/40 bg-primary/5"
                      : "border-border hover:border-foreground-muted/40 bg-surface",
                  )}
                >
                  <div className="font-mono text-[9px] text-foreground-muted">
                    {String(h).padStart(2, "0")}:00
                  </div>
                  <div className={cn("font-mono text-[10px] tabular-nums mt-0.5", isActive ? "text-primary" : "text-foreground")}>
                    {toDisp.time}
                  </div>
                  {dd !== 0 && (
                    <div className="font-mono text-[8px] text-foreground-muted/60">
                      {dd > 0 ? "+" : ""}{dd}d
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
