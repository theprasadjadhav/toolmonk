interface ValidationStatusProps {
  status: "idle" | "valid" | "error";
  errorMessage?: string;
  /** Extra info shown on the right in valid state (e.g. "42 lines") */
  validInfo?: string;
  /** Label shown in green banner (e.g. "valid json") */
  validLabel?: string;
  /** Compact padding variant (py-2) vs normal (py-3) */
  compact?: boolean;
  withIcon?: boolean;
}

export function ValidationStatus({
  status,
  errorMessage,
  validInfo,
  validLabel = "valid",
  compact = false,
  withIcon = false,
}: ValidationStatusProps) {
  const py = compact ? "py-2" : "py-3";
  if (status === "error" && errorMessage) {
    return (
      <div className={`flex items-start ${withIcon ? "gap-3" : "gap-2"} px-4 ${py} bg-status-err-bg border border-status-err-border`}>
        {withIcon && (
          <svg className="w-4 h-4 text-status-err-text shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        {!withIcon && (
          <span className="font-mono text-[10px] text-status-err-text uppercase tracking-wider shrink-0 mt-0.5">error</span>
        )}
        <p className="font-mono text-xs text-status-err-text leading-relaxed">{errorMessage}</p>
      </div>
    );
  }
  if (status === "valid") {
    return (
      <div className={`flex items-center gap-2 px-4 ${py} bg-status-ok-bg border border-status-ok-border`}>
        <span className="font-mono text-[10px] text-status-ok-text uppercase tracking-wider">{validLabel}</span>
        {validInfo && (
          <span className="font-mono text-[10px] text-foreground-muted ml-auto">{validInfo}</span>
        )}
      </div>
    );
  }
  return null;
}
