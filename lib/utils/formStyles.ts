/**
 * Shared Tailwind class strings for form inputs, labels, and error messages.
 * Import specific names — do NOT import all.
 */

export const labelCls =
  "font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60 mb-1 block";

export const inputCls =
  "w-full font-mono text-sm bg-surface-muted border border-border px-3 py-2.5 text-foreground outline-none focus:border-foreground-muted";

export const inputBaseCls =
  "w-full font-mono text-base bg-surface-muted border border-border px-3 py-2.5 text-foreground outline-none focus:border-foreground-muted";

export const textareaCls =
  "w-full font-mono text-sm bg-surface-muted border border-border px-3 py-2.5 text-foreground outline-none focus:border-foreground-muted resize-y";

export const inputErrCls = "border-red-400/60 focus:border-red-400";

export const errCls = "font-mono text-[10px] text-red-500/70 mt-1";

// Toggle / segmented-control buttons
export const toggleBtnBase = "font-mono text-[10px] px-3 py-1.5 border transition-colors";
export const toggleActiveCls = "border-primary/40 bg-primary/10 text-primary";
export const toggleInactiveCls = "border-border text-foreground-muted hover:text-foreground";

// Primary action CTA (Convert, Download, Export, Generate)
export const actionBtnBase =
  "w-full font-mono text-[11px] uppercase tracking-wider px-4 py-3 border transition-colors";
export const actionBtnEnabledCls =
  "border-foreground-muted/40 text-foreground hover:text-primary hover:border-primary/40";
export const actionBtnDisabledCls = "border-border text-foreground-muted/30 cursor-not-allowed";

// Secondary / ghost button (Clear, Reset, Swap)
export const secondaryBtnCls =
  "font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 border border-border text-foreground-muted hover:text-primary hover:border-primary/40 transition-colors";
