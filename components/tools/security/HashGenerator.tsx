"use client";

import { useState, useEffect, useRef } from "react";
import { md5, sha1, sha256, sha512 } from "@/lib/utils/hash";
import { useToolFullscreen, FullscreenButton } from "@/components/tool/ToolPanel";
import { textareaCls } from "@/lib/utils/formStyles";
import { Toolbar, ToolbarButton, ToolbarRight, Icons, PanelLabel, PanelButton } from "@/components/ui/Toolbar";
import { uploadText } from "@/lib/utils/file";
import { cn } from "@/lib/utils/cn";

const ALGORITHMS = [
  { key: "md5",    label: "MD5",     bits: 128 },
  { key: "sha1",   label: "SHA-1",   bits: 160 },
  { key: "sha256", label: "SHA-256", bits: 256 },
  { key: "sha512", label: "SHA-512", bits: 512 },
] as const;

type AlgoKey = (typeof ALGORITHMS)[number]["key"];

export function HashGenerator() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Partial<Record<AlgoKey, string>>>({});
  const [copied, setCopied] = useState<AlgoKey | null>(null);
  const fullscreen = useToolFullscreen();
  const currentRef = useRef(input);
  // eslint-disable-next-line react-hooks/refs
  currentRef.current = input;

  useEffect(() => {
    if (!input) { setHashes({}); return; }
    const snapshot = input;
    const md5Hash = md5(snapshot);
    setHashes({ md5: md5Hash });

    Promise.all([sha1(snapshot), sha256(snapshot), sha512(snapshot)]).then(([s1, s256, s512]) => {
      if (currentRef.current !== snapshot) return;
      setHashes({ md5: md5Hash, sha1: s1, sha256: s256, sha512: s512 });
    });
  }, [input]);

  const copy = async (key: AlgoKey) => {
    const val = hashes[key];
    if (!val) return;
    await navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const clear = () => { setInput(""); setHashes({}); };

  const handleUpload = async () => {
    const content = await uploadText(".txt");
    if (content !== null) setInput(content);
  };

  return (
    <div className={cn("space-y-4", fullscreen && "h-full flex flex-col")}>
      {/* Toolbar */}
      <Toolbar>
        <ToolbarButton icon={<Icons.Clear />} label="clear" onClick={clear} />
        <ToolbarRight><FullscreenButton /></ToolbarRight>
      </Toolbar>

      {/* Input */}
      <div className={cn(fullscreen ? "flex flex-col gap-2" : "space-y-2", fullscreen && "shrink-0 h-48")}>
        <PanelLabel actions={<PanelButton icon={<Icons.Upload />} title="Upload text file" onClick={handleUpload} />}>— input text</PanelLabel>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to hash…"
          spellCheck={false}
          className={cn(textareaCls, "resize-none", fullscreen ? "flex-1 min-h-0" : "h-48")}
        />
      </div>

      {/* Hash results */}
      <div className={cn("space-y-2", fullscreen && "flex-1 overflow-auto")}>
        {ALGORITHMS.map(({ key, label, bits }) => {
          const val = hashes[key];
          return (
            <div key={key}
              className="flex items-center gap-3 px-4 py-3 border border-border bg-surface group">
              <div className="shrink-0 w-20">
                <span className="font-mono text-[10px] text-foreground-muted uppercase tracking-wider">{label}</span>
                <span className="block font-mono text-[9px] text-foreground-muted/50">{bits}-bit</span>
              </div>
              <span className={cn(
                "flex-1 font-mono text-xs break-all leading-relaxed",
                val ? "text-foreground" : "text-foreground-muted/30"
              )}>
                {val ?? (input ? "…" : "hash appears here")}
              </span>
              <button
                onClick={() => copy(key)}
                disabled={!val}
                className={cn(
                  "shrink-0 px-3 py-1 font-mono text-[10px] border transition-colors disabled:opacity-20 disabled:pointer-events-none",
                  copied === key
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-foreground-muted hover:text-foreground",
                )}>
                {copied === key ? "copied!" : "copy"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
