"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

// ── Micro SVG primitives ────────────────────────────────────────────────────────

function Ico(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className="w-3.5 h-3.5 shrink-0" aria-hidden="true"
      {...props}
    />
  );
}

export const Icons = {
  Sample:   () => <Ico><path d="M3 1h7l3 3v11H3V1z"/><path d="M10 1v3h3M5 8h6M5 11h4"/></Ico>,
  Clear:    () => <Ico><path d="M4 4l8 8M12 4l-8 8"/></Ico>,
  Copy:     () => <Ico><rect x="5" y="2" width="8" height="10" rx="1"/><path d="M3 4v10h7"/></Ico>,
  CopyAll:  () => <Ico><rect x="6" y="1" width="8" height="10" rx="1"/><rect x="2" y="5" width="8" height="10" rx="1"/></Ico>,
  Download: () => <Ico><path d="M8 2v9M4 8l4 4 4-4M2 14h12"/></Ico>,
  Upload:   () => <Ico><path d="M8 11V2M4 5l4-4 4 4M2 14h12"/></Ico>,
  Format:   () => <Ico><path d="M2 3h12M4 6h8M4 9h6M2 12h10"/></Ico>,
  Minify:   () => <Ico><path d="M4 2h8M2 5h12M2 8h12M2 11h12M4 14h8"/></Ico>,
  Generate: () => <Ico><path d="M2.5 8a5.5 5.5 0 1 0 1-3.2M2 2v4h4"/></Ico>,
  Swap:     () => <Ico><path d="M2 5h12M11 2l3 3-3 3M14 11H2M5 8l-3 3 3 3"/></Ico>,
  Clock:    () => <Ico><circle cx="8" cy="8" r="5.5"/><path d="M8 5.5V8l2 2"/></Ico>,
  Upper:    () => <Ico><path d="M3 13L6.5 3l3.5 10M4.5 9h5" strokeWidth="1.3"/></Ico>,
};

// ── Toolbar container ──────────────────────────────────────────────────────────

export function Toolbar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center flex-wrap gap-2 pb-4 border-b border-border shrink-0",
        className
      )}
    >
      {children}
    </div>
  );
}

// ── Right-aligned group ────────────────────────────────────────────────────────

export function ToolbarRight({ children }: { children: React.ReactNode }) {
  return <div className="ml-auto flex items-center gap-2">{children}</div>;
}

// ── Stat badge (hidden on mobile) ─────────────────────────────────────────────

export function ToolbarBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="hidden sm:inline font-mono text-[10px] text-foreground-muted/50 whitespace-nowrap">
      {children}
    </span>
  );
}

// ── Action button ──────────────────────────────────────────────────────────────

interface ToolbarButtonProps {
  /** Icon shown on mobile (< sm). Required for responsive icon-only mode. */
  icon: React.ReactNode;
  /** Text label shown on desktop (≥ sm). Also used as the title tooltip. */
  label: string;
  /** Temporary feedback text (e.g. "copied!") – shown on all screen sizes. */
  feedback?: string;
  showFeedback?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  /** Highlight the button as active/pressed (toggle state). */
  active?: boolean;
  className?: string;
}

export function ToolbarButton({
  icon,
  label,
  feedback,
  showFeedback,
  onClick,
  disabled,
  active,
  className,
}: ToolbarButtonProps) {
  const isFeedback = showFeedback && feedback;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={cn(
        "px-3 py-1 font-mono text-xs border transition-colors",
        active
          ? "border-primary/40 text-primary bg-primary/10"
          : "border-border text-foreground-muted hover:text-foreground hover:border-foreground-muted",
        "disabled:opacity-30",
        className
      )}
    >
      {isFeedback ? (
        feedback
      ) : (
        <>
          <span className="sm:hidden flex items-center justify-center">{icon}</span>
          <span className="hidden sm:inline">{label}</span>
        </>
      )}
    </button>
  );
}

// ── Select with label ──────────────────────────────────────────────────────────

interface ToolbarSelectProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: { value: string | number; label: string }[];
}

export function ToolbarSelect({
  label,
  value,
  onChange,
  options,
}: ToolbarSelectProps) {
  return (
    <label className="flex items-center gap-1.5">
      <span className="hidden sm:inline font-mono text-[11px] text-foreground-muted uppercase tracking-wider">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-2 py-1 border border-border bg-surface font-mono text-xs text-foreground focus:outline-none transition-colors"
      >
        {options.map((o) => (
          <option key={String(o.value)} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

// ── Checkbox with label ────────────────────────────────────────────────────────

interface ToolbarCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ToolbarCheckbox({
  label,
  checked,
  onChange,
}: ToolbarCheckboxProps) {
  return (
    <label
      className="flex items-center gap-1.5 cursor-pointer select-none"
      title={label}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-primary"
      />
      <span className="hidden sm:inline font-mono text-[11px] text-foreground-muted uppercase tracking-wider">
        {label}
      </span>
    </label>
  );
}

// ── Segmented toggle group (encode|decode, v4|v7, …) ─────────────────────────

interface ToggleOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface ToolbarToggleGroupProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: ToggleOption<T>[];
}

export function ToolbarToggleGroup<T extends string>({
  value,
  onChange,
  options,
}: ToolbarToggleGroupProps<T>) {
  return (
    <div className="flex">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          title={o.label}
          className={cn(
            "px-3 py-1 font-mono text-xs border transition-colors",
            value === o.value
              ? "border-primary/40 text-primary bg-primary/10"
              : "border-border text-foreground-muted hover:text-foreground hover:border-foreground-muted"
          )}
        >
          {o.icon ? (
            <>
              <span className="sm:hidden flex items-center justify-center">{o.icon}</span>
              <span className="hidden sm:inline">{o.label}</span>
            </>
          ) : (
            o.label
          )}
        </button>
      ))}
    </div>
  );
}

// ── Panel label row ────────────────────────────────────────────────────────────
// Replaces the plain <p> tag above each editor/output panel.
// Place action buttons (upload, copy, download) in the `actions` slot.

export function PanelLabel({
  children,
  actions,
}: {
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between shrink-0 min-h-[1.25rem]">
      <span className="font-mono text-[11px] tracking-wider text-foreground-muted uppercase">
        {children}
      </span>
      {actions && (
        <div className="flex items-center gap-0.5 -mr-0.5">{actions}</div>
      )}
    </div>
  );
}

// ── Panel action button (always icon-only, sits in PanelLabel) ────────────────

export function PanelButton({
  icon,
  title,
  onClick,
  disabled,
  active,
}: {
  icon: React.ReactNode;
  title: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <div className="relative inline-flex">
      <button
        title={title}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "p-1 transition-colors",
           disabled
              ? "text-foreground-muted/20 cursor-not-allowed"
              : "text-foreground-muted hover:text-foreground hover:bg-foreground/5"
        )}
      >
        {icon}
      </button>
      {active && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide bg-foreground text-surface whitespace-nowrap pointer-events-none">
          copied!
        </span>
      )}
    </div>
  );
}
