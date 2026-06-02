"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { useCopyState } from "@/lib/hooks/useCopyState";
import { labelCls, inputCls } from "@/lib/utils/formStyles";
import { ResultsTable } from "@/components/ui/ResultsTable";

function pad(n: number) { return String(Math.floor(n)).padStart(2, "0"); }

function toPickerISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function localOffset(d: Date): string {
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? "+" : "-";
  return `${sign}${pad(Math.floor(Math.abs(off) / 60))}:${pad(Math.abs(off) % 60)}`;
}

function isoLocal(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${localOffset(d)}`;
}

function isoWeek(d: Date): number {
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.ceil((((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function relativeTime(d: Date): string {
  const diff = d.getTime() - Date.now();
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (abs < 60000)       return rtf.format(Math.round(diff / 1000), "second");
  if (abs < 3600000)     return rtf.format(Math.round(diff / 60000), "minute");
  if (abs < 86400000)    return rtf.format(Math.round(diff / 3600000), "hour");
  if (abs < 2592000000)  return rtf.format(Math.round(diff / 86400000), "day");
  if (abs < 31536000000) return rtf.format(Math.round(diff / 2592000000), "month");
  return rtf.format(Math.round(diff / 31536000000), "year");
}

function parseAny(raw: string): Date | null {
  if (!raw.trim()) return null;
  // Numeric Unix timestamp (sec or ms)
  if (/^-?\d+(\.\d+)?$/.test(raw.trim())) {
    const n = Number(raw.trim());
    const ms = Math.abs(n) > 1e10 ? n : n * 1000;
    const d = new Date(ms);
    if (!isNaN(d.getTime())) return d;
  }
  // Any parseable date string
  const d = new Date(raw.trim());
  if (!isNaN(d.getTime())) return d;
  return null;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function TimestampConverter() {
  const [textInput, setTextInput] = useState(() => String(Math.floor(Date.now() / 1000)));
  const [pickerVal, setPickerVal] = useState(() => toPickerISO(new Date()));
  const { copied, copy } = useCopyState();

  function handleText(val: string) {
    setTextInput(val);
    const d = parseAny(val);
    if (d) setPickerVal(toPickerISO(d));
  }

  function handlePicker(val: string) {
    setPickerVal(val);
    if (val) {
      const d = new Date(val);
      if (!isNaN(d.getTime())) setTextInput(toPickerISO(d));
    }
  }

  function handleNow() {
    const now = new Date();
    setTextInput(String(Math.floor(now.getTime() / 1000)));
    setPickerVal(toPickerISO(now));
  }

  const parsed = useMemo(() => {
    if (textInput.trim()) return parseAny(textInput);
    return pickerVal ? new Date(pickerVal) : null;
  }, [textInput, pickerVal]);

  const isInvalid = textInput.trim() !== "" && !parsed;

  const rows = useMemo(() => {
    if (!parsed || isNaN(parsed.getTime())) return [];
    const ms = parsed.getTime();
    const sec = Math.floor(ms / 1000);
    return [
      { key: "unix_sec",    label: "Unix seconds",      format: "Integer",                     value: String(sec) },
      { key: "unix_ms",     label: "Unix milliseconds", format: "Integer",                     value: String(ms) },
      { key: "iso_utc",     label: "ISO 8601 (UTC)",    format: "YYYY-MM-DDTHH:mm:ss.sssZ",   value: parsed.toISOString() },
      { key: "iso_local",   label: "ISO 8601 (local)",  format: "YYYY-MM-DDTHH:mm:ss±HH:MM", value: isoLocal(parsed) },
      { key: "utc_str",     label: "UTC string",        format: "RFC 7231",                   value: parsed.toUTCString() },
      { key: "date_only",   label: "Date only",         format: "YYYY-MM-DD",                 value: `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}` },
      { key: "time_only",   label: "Time only",         format: "HH:MM:SS",                   value: `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}:${pad(parsed.getSeconds())}` },
      { key: "locale",      label: "Locale date-time",  format: "Browser locale",             value: parsed.toLocaleString("en-US", { dateStyle: "long", timeStyle: "medium" }) },
      { key: "locale_utc",  label: "Locale (UTC)",      format: "Browser locale, UTC",        value: parsed.toLocaleString("en-US", { timeZone: "UTC", dateStyle: "long", timeStyle: "medium" }) + " UTC" },
      { key: "day_of_week", label: "Day of week",       format: "Full name",                  value: DAYS[parsed.getDay()] },
      { key: "week_num",    label: "ISO week number",   format: "Week N of YYYY",             value: `Week ${isoWeek(parsed)} of ${parsed.getFullYear()}` },
      { key: "relative",    label: "Relative",          format: "Natural language",           value: relativeTime(parsed) },
    ];
  }, [parsed]);

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <div>
          <label className={labelCls}>— paste date, time, or unix timestamp</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={textInput}
              placeholder="e.g. 1744617600 · 2024-01-15T10:00:00Z · Jan 15 2024"
              onChange={(e) => handleText(e.target.value)}
              className={cn(inputCls, "flex-1", isInvalid && "border-red-500/40")}
            />
            <button
              onClick={handleNow}
              className="font-mono text-[10px] px-3 border border-border text-foreground-muted hover:text-primary hover:border-primary/40 transition-colors whitespace-nowrap shrink-0">
              Use now
            </button>
          </div>
          {isInvalid && <p className="font-mono text-[10px] text-red-500/70 mt-1">Could not parse this as a date or timestamp.</p>}
        </div>
        <div>
          <label className={labelCls}>— or pick from calendar</label>
          <input
            type="datetime-local"
            value={pickerVal}
            onChange={(e) => handlePicker(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      {rows.length > 0 && (
        <div className="space-y-1">
          <p className={labelCls}>— all formats</p>
          <ResultsTable
            rows={rows.map(({ key, label, format, value }) => ({ key, label, subLabel: format, value }))}
            copied={copied}
            onCopy={copy}
          />
        </div>
      )}
    </div>
  );
}
