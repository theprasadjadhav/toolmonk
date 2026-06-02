interface ErrorBannerProps {
  error: string;
  label?: string;
  /** When true adds gap-3 and an X icon (used by xml/json minifiers & validators) */
  withIcon?: boolean;
  className?: string;
}

export function ErrorBanner({ error, label = "error", withIcon = false, className }: ErrorBannerProps) {
  return (
    <div className={`flex items-start ${withIcon ? "gap-3" : "gap-2"} px-4 py-3 bg-status-err-bg border border-status-err-border ${className ?? ""}`}>
      {withIcon && (
        <svg className="w-4 h-4 text-status-err-text shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {!withIcon && (
        <span className="font-mono text-[10px] text-status-err-text uppercase tracking-wider shrink-0 mt-0.5">{label}</span>
      )}
      <div>
        {withIcon && (
          <span className="font-mono text-[10px] text-status-err-text uppercase tracking-wider block mb-1">{label}</span>
        )}
        <p className="font-mono text-xs text-status-err-text leading-relaxed">{error}</p>
      </div>
    </div>
  );
}
