"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
  } catch { return iso; }
}

function calcAge(iso: string | null): string {
  if (!iso) return "—";
  try {
    const ms   = Date.now() - new Date(iso).getTime();
    const days = Math.floor(ms / 86_400_000);
    const years  = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const parts: string[] = [];
    if (years  > 0) parts.push(`${years} year${years  !== 1 ? "s" : ""}`);
    if (months > 0) parts.push(`${months} month${months !== 1 ? "s" : ""}`);
    if (parts.length === 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
    return parts.join(", ");
  } catch { return "—"; }
}

interface DomainInfo {
  domain: string;
  registrationDate: string | null;
  expirationDate:   string | null;
  lastChangedDate:  string | null;
  registrar:        string;
}

// ── Style tokens ───────────────────────────────────────────────────────────────

const labelCls =
  "font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60 mb-1 block";
const inputCls =
  "w-full font-mono text-sm bg-surface-muted border border-border px-3 py-2.5 text-foreground outline-none focus:border-foreground-muted";
const errCls = "font-mono text-[10px] text-red-500/70 mt-1";

// ── Component ──────────────────────────────────────────────────────────────────

export function DomainAgeChecker() {
  const [domain,  setDomain]  = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [result,  setResult]  = useState<DomainInfo | null>(null);

  const domainErr =
    domain.trim() === "" ? "" :
    !/^[a-zA-Z0-9][a-zA-Z0-9._-]*\.[a-zA-Z]{2,}$/.test(
      domain.trim().replace(/^https?:\/\//i, "").replace(/\/.*/, "").replace(/^www\./, "")
    ) ? "Enter a valid domain (e.g. example.com)" : "";

  const handleCheck = useCallback(async () => {
    const raw = domain.trim();
    if (!raw || domainErr) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/domain-age?domain=${encodeURIComponent(raw)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" && data.error
          ? data.error
          : "Domain lookup failed. Check your connection and try again.");
        return;
      }
      setResult(data as DomainInfo);
    } catch {
      setError("Domain lookup failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [domain, domainErr]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCheck();
  };

  const rows: { label: string; value: string }[] = result
    ? [
        { label: "Domain",              value: result.domain },
        { label: "Registration date",   value: formatDate(result.registrationDate) },
        { label: "Domain age",          value: calcAge(result.registrationDate) },
        { label: "Expiration date",     value: formatDate(result.expirationDate) },
        { label: "Last updated",        value: formatDate(result.lastChangedDate) },
        { label: "Registrar",           value: result.registrar },
      ]
    : [];

  return (
    <div className="space-y-5">

      {/* Input */}
      <div>
        <label className={labelCls}>— domain name</label>
        <input
          type="text"
          value={domain}
          onChange={(e) => { setDomain(e.target.value); setError(null); setResult(null); }}
          onKeyDown={handleKeyDown}
          placeholder="example.com"
          className={cn(inputCls, domainErr && "border-red-500/40")}
          disabled={loading}
        />
        {domainErr && <p className={errCls}>{domainErr}</p>}
      </div>

      {/* Check button */}
      <button
        onClick={handleCheck}
        disabled={!domain.trim() || !!domainErr || loading}
        className={cn(
          "w-full font-mono text-[11px] uppercase tracking-wider px-4 py-3 border transition-colors",
          !domain.trim() || !!domainErr || loading
            ? "border-border text-foreground-muted/40 cursor-not-allowed"
            : "border-foreground-muted text-foreground hover:border-primary/40 hover:text-primary",
        )}
      >
        {loading ? "Looking up…" : "Check domain age"}
      </button>

      {/* Error */}
      {error && (
        <p className="font-mono text-[11px] text-red-500/70 border border-red-500/20 bg-surface-muted px-4 py-3">
          {error}
        </p>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-1">
          <p className={labelCls}>— results</p>
          <div className="border border-border divide-y divide-border">
            {rows.map(({ label, value }) => (
              <div key={label} className="flex items-center bg-surface">
                <span className="font-mono text-[10px] uppercase tracking-wider px-4 py-3 w-40 sm:w-48 shrink-0 border-r border-border text-foreground-muted/80">
                  {label}
                </span>
                <span className="font-mono text-sm px-4 py-3 flex-1 text-foreground/80 break-all">
                  {value}
                </span>
              </div>
            ))}
          </div>
          <p className="font-mono text-[10px] text-foreground-muted/30 mt-1">
            Data sourced from RDAP (Registration Data Access Protocol)
          </p>
        </div>
      )}

    </div>
  );
}
