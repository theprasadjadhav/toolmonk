"use client";

import { useState } from "react";
import { useToolFullscreen, FullscreenButton } from "@/components/tool/ToolPanel";
import { textareaCls } from "@/lib/utils/formStyles";
import { Toolbar, ToolbarButton, ToolbarRight, Icons, PanelLabel, PanelButton } from "@/components/ui/Toolbar";
import { uploadText } from "@/lib/utils/file";
import { cn } from "@/lib/utils/cn";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

// ── JWT helpers ────────────────────────────────────────────────────────────────

function b64urlDecode(str: string): string {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "===".slice(0, (4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function pretty(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}

function fmtTime(unix: number): string {
  return new Date(unix * 1000).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

interface Decoded {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

function decodeJwt(token: string): Decoded {
  const parts = token.trim().split(".");
  if (parts.length !== 3) throw new Error("A JWT must have exactly three dot-separated parts.");
  const header  = JSON.parse(b64urlDecode(parts[0])) as Record<string, unknown>;
  const payload = JSON.parse(b64urlDecode(parts[1])) as Record<string, unknown>;
  return { header, payload, signature: parts[2] };
}

// ── Component ──────────────────────────────────────────────────────────────────

export function JwtDecoder() {
  const [input,   setInput]   = useState("");
  const [decoded, setDecoded] = useState<Decoded | null>(null);
  const [error,   setError]   = useState("");
  const [copied,  setCopied]  = useState<"header" | "payload" | null>(null);
  const fullscreen = useToolFullscreen();

  const process = (value: string) => {
    if (!value.trim()) { setDecoded(null); setError(""); return; }
    try {
      setDecoded(decodeJwt(value));
      setError("");
    } catch (e) {
      setDecoded(null);
      setError(e instanceof Error ? e.message : "Invalid JWT.");
    }
  };

  const handleChange = (v: string) => { setInput(v); process(v); };

  const copy = async (key: "header" | "payload") => {
    if (!decoded) return;
    await navigator.clipboard.writeText(pretty(decoded[key]));
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const clear = () => { setInput(""); setDecoded(null); setError(""); };

  const handleUpload = async () => {
    const content = await uploadText(".txt");
    if (content !== null) handleChange(content.trim());
  };

  // Derived token info
  const payload = decoded?.payload ?? {};
  const exp  = typeof payload.exp  === "number" ? payload.exp  : null;
  const iat  = typeof payload.iat  === "number" ? payload.iat  : null;
  const nbf  = typeof payload.nbf  === "number" ? payload.nbf  : null;
  const sub  = typeof payload.sub  === "string" ? payload.sub  : null;
  const iss  = typeof payload.iss  === "string" ? payload.iss  : null;
  const alg  = typeof decoded?.header.alg === "string" ? decoded.header.alg : null;
  // eslint-disable-next-line react-hooks/purity
  const now  = Math.floor(Date.now() / 1000);
  const isExpired = exp !== null && now > exp;
  const isNotYetValid = nbf !== null && now < nbf;

  return (
    <div className={cn("space-y-4", fullscreen && "h-full flex flex-col")}>
      {/* Toolbar */}
      <Toolbar>
        <ToolbarButton icon={<Icons.Clear />} label="clear" onClick={clear} />
        <ToolbarRight><FullscreenButton /></ToolbarRight>
      </Toolbar>

      {/* JWT Input */}
      <div className="shrink-0 space-y-2">
        <PanelLabel actions={<PanelButton icon={<Icons.Upload />} title="Upload JWT file" onClick={handleUpload} />}>— jwt token</PanelLabel>
        <textarea
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Paste your JWT here… eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature"
          spellCheck={false}
          autoComplete="off"
          className={cn(textareaCls, "h-28 resize-none")}
        />
      </div>

      {/* Error */}
      {error && <ErrorBanner error={error} className="shrink-0" />}

      {/* Token info bar */}
      {decoded && (
        <div className="shrink-0 flex flex-wrap gap-x-6 gap-y-2 px-4 py-3 border border-border bg-surface">
          {alg && (
            <span className="font-mono text-xs">
              <span className="text-foreground-muted">alg </span>
              <span className="text-foreground">{alg}</span>
            </span>
          )}
          {iss && (
            <span className="font-mono text-xs">
              <span className="text-foreground-muted">iss </span>
              <span className="text-foreground truncate max-w-48">{iss}</span>
            </span>
          )}
          {sub && (
            <span className="font-mono text-xs">
              <span className="text-foreground-muted">sub </span>
              <span className="text-foreground truncate max-w-48">{sub}</span>
            </span>
          )}
          {iat !== null && (
            <span className="font-mono text-xs">
              <span className="text-foreground-muted">iat </span>
              <span className="text-foreground">{fmtTime(iat)}</span>
            </span>
          )}
          {exp !== null && (
            <span className="font-mono text-xs">
              <span className="text-foreground-muted">exp </span>
              <span className={isExpired ? "text-red-400" : "text-green-400"}>{fmtTime(exp)}</span>
            </span>
          )}
          {isExpired && (
            <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-red-500/15 border border-red-500/30 text-red-400">
              expired
            </span>
          )}
          {isNotYetValid && (
            <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-yellow-500/15 border border-yellow-500/30 text-yellow-400">
              not yet valid
            </span>
          )}
          {!isExpired && !isNotYetValid && exp !== null && (
            <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-green-500/15 border border-green-500/30 text-green-400">
              valid
            </span>
          )}
        </div>
      )}

      {/* Header + Payload panels */}
      {decoded && (
        <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-4", fullscreen && "flex-1 min-h-0")}>
          <div className={cn(fullscreen ? "flex flex-col gap-2 min-h-0" : "space-y-2")}>
            <PanelLabel actions={<PanelButton icon={<Icons.Copy />} title={copied === "header" ? "Copied!" : "Copy header"} onClick={() => copy("header")} active={copied === "header"} />}>— header</PanelLabel>
            <div className={cn("border border-border bg-surface font-mono text-xs overflow-auto", fullscreen ? "flex-1 min-h-0" : "h-56")}>
              <pre className="p-4 whitespace-pre-wrap break-words text-foreground m-0 leading-relaxed">{pretty(decoded.header)}</pre>
            </div>
          </div>
          <div className={cn(fullscreen ? "flex flex-col gap-2 min-h-0" : "space-y-2")}>
            <PanelLabel actions={<PanelButton icon={<Icons.Copy />} title={copied === "payload" ? "Copied!" : "Copy payload"} onClick={() => copy("payload")} active={copied === "payload"} />}>— payload</PanelLabel>
            <div className={cn("border border-border bg-surface font-mono text-xs overflow-auto", fullscreen ? "flex-1 min-h-0" : "h-56")}>
              <pre className="p-4 whitespace-pre-wrap break-words text-foreground m-0 leading-relaxed">{pretty(decoded.payload)}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Signature */}
      {decoded && (
        <div className="shrink-0 space-y-2">
          <p className="font-mono text-[11px] tracking-wider text-foreground-muted uppercase">— signature (base64url)</p>
          <div className="px-4 py-3 border border-border bg-surface font-mono text-xs text-foreground-muted break-all leading-relaxed">
            {decoded.signature}
          </div>
        </div>
      )}
    </div>
  );
}
