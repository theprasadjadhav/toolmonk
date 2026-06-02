"use client";

import { useState } from "react";
import { useToolFullscreen, FullscreenButton } from "@/components/tool/ToolPanel";
import { Toolbar, ToolbarButton, ToolbarRight, ToolbarSelect, ToolbarToggleGroup, Icons, PanelLabel, PanelButton } from "@/components/ui/Toolbar";
import { downloadText } from "@/lib/utils/file";
import { cn } from "@/lib/utils/cn";

// ── UUID generation ────────────────────────────────────────────────────────────

function genV4(): string {
  return crypto.randomUUID();
}

function genV7(): string {
  const ts = Date.now();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  // Embed 48-bit timestamp
  bytes[0] = (ts / 0x10000000000) & 0xff;
  bytes[1] = (ts / 0x100000000) & 0xff;
  bytes[2] = (ts / 0x1000000) & 0xff;
  bytes[3] = (ts / 0x10000) & 0xff;
  bytes[4] = (ts / 0x100) & 0xff;
  bytes[5] = ts & 0xff;
  // Version 7
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  // Variant 10xx
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const h = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}

// ── Component ──────────────────────────────────────────────────────────────────

type Version = "v4" | "v7";
const COUNTS = [1, 5, 10, 25, 50] as const;

export function UuidGenerator() {
  const [version,   setVersion]   = useState<Version>("v4");
  const [count,     setCount]     = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [uuids,     setUuids]     = useState<string[]>([]);
  const [copied,    setCopied]    = useState<string | null>(null);
  const fullscreen = useToolFullscreen();

  const fmt = (u: string) => uppercase ? u.toUpperCase() : u;

  const generate = () => {
    const gen = version === "v4" ? genV4 : genV7;
    setUuids(Array.from({ length: count }, () => fmt(gen())));
    setCopied(null);
  };

  const copyOne = async (u: string) => {
    await navigator.clipboard.writeText(u);
    setCopied(u);
    setTimeout(() => setCopied(null), 1500);
  };

  const copyAll = async () => {
    if (!uuids.length) return;
    await navigator.clipboard.writeText(uuids.join("\n"));
    setCopied("__all__");
    setTimeout(() => setCopied(null), 1500);
  };

  const clear = () => { setUuids([]); setCopied(null); };

  const handleDownload = () => {
    if (!uuids.length) return;
    downloadText(uuids.join("\n"), "uuids.txt");
  };

  return (
    <div className={cn("space-y-4", fullscreen && "h-full flex flex-col")}>
      {/* Toolbar */}
      <Toolbar>
        <ToolbarToggleGroup value={version} onChange={setVersion} options={[{value:"v4",label:"UUID v4"},{value:"v7",label:"UUID v7"}]} />
        <ToolbarSelect label="Count" value={count} onChange={(v) => setCount(Number(v))} options={COUNTS.map(c => ({value:c, label:`${c} UUIDs`}))} />
        <ToolbarButton icon={<Icons.Upper />} label="UPPER" active={uppercase} onClick={() => setUppercase(p => !p)} />
        <ToolbarButton icon={<Icons.Generate />} label="generate" onClick={generate} />
        <ToolbarRight>
          <ToolbarButton icon={<Icons.CopyAll />} label="copy all" feedback="copied!" showFeedback={copied === '__all__'} onClick={copyAll} disabled={!uuids.length} />
          <ToolbarButton icon={<Icons.Clear />} label="clear" onClick={clear} disabled={!uuids.length} />
          <FullscreenButton />
        </ToolbarRight>
      </Toolbar>

      {/* UUID list */}
      {uuids.length === 0 ? (
        <div className="flex items-center justify-center border border-border bg-surface h-48">
          <p className="font-mono text-xs text-foreground-muted">press generate to create UUIDs</p>
        </div>
      ) : (
        <>
          <PanelLabel actions={<PanelButton icon={<Icons.Download />} title="Download UUIDs" onClick={handleDownload} />}>
            — generated uuids
          </PanelLabel>
          <div className={cn("space-y-1", fullscreen && "flex-1 overflow-auto")}>
            {uuids.map((u) => (
              <div key={u}
                onClick={() => copyOne(u)}
                className="flex items-center justify-between px-4 py-3 border border-border bg-surface group cursor-pointer hover:border-foreground-muted transition-colors">
                <span className="font-mono text-sm text-foreground tracking-wider">{u}</span>
                <span className="font-mono text-[10px] text-foreground-muted opacity-0 group-hover:opacity-100 transition-opacity">
                  {copied === u ? "copied!" : "click to copy"}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
