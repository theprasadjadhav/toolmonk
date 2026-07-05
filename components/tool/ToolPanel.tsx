"use client";

import { useState, useEffect, useRef, createContext, useContext } from "react";
import { cn } from "@/lib/utils/cn";

interface FullscreenCtx {
  fullscreen: boolean;
  toggle: () => void;
}

const FullscreenContext = createContext<FullscreenCtx>({ fullscreen: false, toggle: () => {} });
export const useToolFullscreen = () => useContext(FullscreenContext).fullscreen;

export function FullscreenButton() {
  const { fullscreen, toggle } = useContext(FullscreenContext);
  return (
    <button
      onClick={toggle}
      title={fullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"}
      className="flex items-center gap-1.5 px-2.5 py-1 font-mono text-[11px] tracking-wider uppercase text-foreground-muted border border-border hover:text-primary hover:border-primary/40 transition-colors"
    >
      {fullscreen
        ? <><MinimizeIcon /><span className="hidden sm:inline">minimize</span></>
        : <><MaximizeIcon /><span className="hidden sm:inline">fullscreen</span></>
      }
    </button>
  );
}

interface ToolPanelProps {
  children: React.ReactNode;
}

export function ToolPanel({ children }: ToolPanelProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const toggle = () => setFullscreen((v) => !v);
  const panelRef = useRef<HTMLDivElement>(null);

  // Scroll panel into view on mount so the tool is immediately visible
  useEffect(() => {
    if (!panelRef.current) return;
    const HEADER_H = 56; // sticky header height
    const y = panelRef.current.getBoundingClientRect().top + window.scrollY - HEADER_H - 16;
    window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  useEffect(() => {
    document.body.style.overflow = fullscreen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [fullscreen]);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFullscreen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  return (
    <FullscreenContext.Provider value={{ fullscreen, toggle }}>
      <div
        ref={panelRef}
        className={cn(
          "bg-surface-muted border border-border",
          fullscreen ? "fixed inset-x-0 top-14 h-[calc(100vh-3.5rem)] flex flex-col p-5 md:p-7" : "p-5 md:p-7"
        )}
      >
        <div className={cn(fullscreen && "flex-1 min-h-0 overflow-hidden flex flex-col")}>
          {children}
        </div>
      </div>
    </FullscreenContext.Provider>
  );
}

function MaximizeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 4.5V1.5H4M9 1.5h3v3M12 8.5v3H9M4 11.5H1v-3" strokeLinecap="square" />
    </svg>
  );
}

function MinimizeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4.5 1v3H1.5M8.5 1v3h3M8.5 12v-3h3M4.5 12v-3h-3" strokeLinecap="square" />
    </svg>
  );
}
