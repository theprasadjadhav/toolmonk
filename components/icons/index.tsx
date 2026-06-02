import type { ToolMeta } from "@/lib/tools/types";

export type IconProps = {
  className?: string;
  size?: number;
};

function Svg({
  children,
  size = 18,
  className,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

// ── Category Icons ─────────────────────────────────────────────────────────────

export function IconCalculator(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <rect x="7" y="12" width="3.5" height="2.5" rx="0.5" />
      <rect x="10.5" y="12" width="3.5" height="2.5" rx="0.5" />
      <rect x="14" y="12" width="3" height="2.5" rx="0.5" />
      <rect x="7" y="16" width="3.5" height="2.5" rx="0.5" />
      <rect x="10.5" y="16" width="3.5" height="2.5" rx="0.5" />
      <rect x="14" y="16" width="3" height="2.5" rx="0.5" />
    </Svg>
  );
}

export function IconConverter(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8 3 4 7l4 4" />
      <path d="M4 7h16" />
      <path d="M16 21l4-4-4-4" />
      <path d="M20 17H4" />
    </Svg>
  );
}

export function IconCode(p: IconProps) {
  return (
    <Svg {...p}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </Svg>
  );
}

export function IconText(p: IconProps) {
  return (
    <Svg {...p}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="11" x2="21" y2="11" />
      <line x1="3" y1="16" x2="14" y2="16" />
    </Svg>
  );
}

export function IconZap(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </Svg>
  );
}

export function IconImage(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </Svg>
  );
}

export function IconFile(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </Svg>
  );
}

export function IconClock(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </Svg>
  );
}

export function IconSearch(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </Svg>
  );
}

export function IconGlobe(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </Svg>
  );
}

export function IconPalette(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
      <circle cx="8" cy="9" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="7" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="9" r="1" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconWrench(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </Svg>
  );
}

export function IconSparkle(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 3v4M12 17v4M4.22 6.22l2.83 2.83M16.95 16.95l2.83 2.83M3 12h4M17 12h4M4.22 17.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </Svg>
  );
}

// ── Tool-specific Icons ────────────────────────────────────────────────────────

export function IconKey(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="M21 2l-9.6 9.6" />
      <path d="M15.5 7.5l3 3L22 7l-3-3" />
    </Svg>
  );
}

export function IconBraces(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1" />
      <path d="M16 21h1a2 2 0 0 0 2-2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1" />
    </Svg>
  );
}

export function IconHash(p: IconProps) {
  return (
    <Svg {...p}>
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </Svg>
  );
}

export function IconLink(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </Svg>
  );
}

export function IconShuffle(p: IconProps) {
  return (
    <Svg {...p}>
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </Svg>
  );
}

export function IconLayers(p: IconProps) {
  return (
    <Svg {...p}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </Svg>
  );
}

export function IconTrendingUp(p: IconProps) {
  return (
    <Svg {...p}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </Svg>
  );
}

export function IconActivity(p: IconProps) {
  return (
    <Svg {...p}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </Svg>
  );
}

export function IconSigma(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M18 4H6l6 8-6 8h12" />
    </Svg>
  );
}

export function IconBarChart(p: IconProps) {
  return (
    <Svg {...p}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </Svg>
  );
}

export function IconShield(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Svg>
  );
}

export function IconRegex(p: IconProps) {
  return (
    <Svg {...p}>
      <line x1="17" y1="3" x2="7" y2="21" />
      <circle cx="9.5" cy="6.5" r="2" />
      <circle cx="14.5" cy="17.5" r="2" />
    </Svg>
  );
}

export function IconType(p: IconProps) {
  return (
    <Svg {...p}>
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </Svg>
  );
}

export function IconGauge(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      <path d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10" />
      <path d="M12 9l3.5-3.5" />
    </Svg>
  );
}

export function IconGrid(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </Svg>
  );
}

export function IconBox(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </Svg>
  );
}

// ── Additional Tool-specific Icons ────────────────────────────────────────────

export function IconStopwatch(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2.5" />
      <path d="M9 2h6" />
      <path d="M12 2v2" />
    </Svg>
  );
}

export function IconCountdown(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l-3 3" />
      <path d="M9.17 3.17l1.41 1.42" />
      <path d="M14.83 3.17l-1.41 1.42" />
    </Svg>
  );
}

export function IconTimestamp(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M7 10l2 2-2 2" />
      <line x1="12" y1="12" x2="17" y2="12" />
    </Svg>
  );
}

export function IconFlame(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </Svg>
  );
}

export function IconDroplet(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </Svg>
  );
}

export function IconBaby(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="5" r="3" />
      <path d="M12 8v5" />
      <path d="M7 20c0-3 2-5 5-5s5 2 5 5" />
      <path d="M9 20h6" />
    </Svg>
  );
}

export function IconScaleBalance(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 3v18" />
      <path d="M3 9l9-6 9 6" />
      <path d="M5 9l-2 7a4 4 0 0 0 8 0L9 9" />
      <path d="M15 9l-2 7a4 4 0 0 0 8 0l-2-7" />
    </Svg>
  );
}

export function IconHouse(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </Svg>
  );
}

export function IconBanknote(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </Svg>
  );
}

export function IconReceipt(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" />
      <path d="M9 7h6M9 11h6M9 15h4" />
    </Svg>
  );
}

export function IconBriefcase(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <path d="M2 12h20" />
    </Svg>
  );
}

export function IconSunrise(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M17 18a5 5 0 0 0-10 0" />
      <line x1="12" y1="2" x2="12" y2="9" />
      <line x1="4.22" y1="10.22" x2="5.64" y2="11.64" />
      <line x1="1" y1="18" x2="3" y2="18" />
      <line x1="21" y1="18" x2="23" y2="18" />
      <line x1="18.36" y1="11.64" x2="19.78" y2="10.22" />
      <line x1="23" y1="22" x2="1" y2="22" />
      <polyline points="8 6 12 2 16 6" />
    </Svg>
  );
}

export function IconRepeat(p: IconProps) {
  return (
    <Svg {...p}>
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </Svg>
  );
}

export function IconCompress(p: IconProps) {
  return (
    <Svg {...p}>
      <polyline points="4 14 10 14 10 20" />
      <polyline points="20 10 14 10 14 4" />
      <line x1="14" y1="10" x2="21" y2="3" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </Svg>
  );
}

export function IconCrop(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15" />
      <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15" />
    </Svg>
  );
}

export function IconExpand(p: IconProps) {
  return (
    <Svg {...p}>
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </Svg>
  );
}

export function IconRotateCw(p: IconProps) {
  return (
    <Svg {...p}>
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </Svg>
  );
}

export function IconStamp(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 22h14" />
      <path d="M19.27 13.73A2.5 2.5 0 0 0 17.5 13h-11A2.5 2.5 0 0 0 4 15.5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1.5c0-.66-.26-1.3-.73-1.77z" />
      <path d="M14 13V8.5C14 7 15 6 15 5a3 3 0 0 0-6 0c0 1 1 2 1 3.5V13" />
    </Svg>
  );
}

export function IconEraser(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M20 20H7L3 16l11-11 8 8-2 7z" />
      <path d="M6 14l4-4" />
    </Svg>
  );
}

export function IconMerge(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8 7H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3" />
      <polyline points="15 3 12 0 9 3" />
      <line x1="12" y1="0" x2="12" y2="13" />
    </Svg>
  );
}

export function IconSplit(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M16 3h5v5" />
      <path d="M8 3H3v5" />
      <path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" />
      <path d="M12 22v-8.3a4 4 0 0 1 1.172-2.872L21 3" />
    </Svg>
  );
}

export function IconLock(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconUnlock(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 1 1 8 0" />
      <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconEyedropper(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 2a3 3 0 1 1 4 4L7 15l-4 1 1-4L12 2z" />
      <circle cx="3.5" cy="20.5" r="2.5" />
      <path d="M6 16l-2.5 2.5" />
    </Svg>
  );
}

export function IconShadow(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="2" y="2" width="14" height="14" rx="1" />
      <rect x="8" y="8" width="14" height="14" rx="1" strokeDasharray="4 2" />
    </Svg>
  );
}

export function IconCornerRadius(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M22 12H17" />
      <path d="M12 22V17" />
      <path d="M2 12h5a5 5 0 0 1 5 5v5" />
      <path d="M2 2h8a12 12 0 0 1 12 12v8" />
    </Svg>
  );
}

export function IconFavicon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M12 8l1.5 3h3l-2.5 2 1 3-3-2-3 2 1-3-2.5-2h3z" />
    </Svg>
  );
}

export function IconCoin(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M14.8 9A2 2 0 0 0 13 8h-2a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-2a2 2 0 0 1-1.8-1" />
      <path d="M12 6v2M12 16v2" />
    </Svg>
  );
}

export function IconDice(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="2" y="2" width="20" height="20" rx="3" />
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconBattery(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="2" y="7" width="16" height="10" rx="2" />
      <path d="M22 11v2" />
      <line x1="6" y1="11" x2="6" y2="13" />
      <line x1="10" y1="11" x2="10" y2="13" />
    </Svg>
  );
}

export function IconWifi(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconMonitor(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </Svg>
  );
}

export function IconCpu(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="8" y="8" width="8" height="8" />
      <path d="M4 12H2M20 12h2M12 4V2M12 20v2" />
      <path d="M4 8H2M4 16H2M20 8h2M20 16h2" />
    </Svg>
  );
}

export function IconRobot(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="6" y="9" width="12" height="12" rx="1" />
      <path d="M12 9V5" />
      <circle cx="12" cy="4" r="1" />
      <path d="M2 13h4M18 13h4" />
      <circle cx="10" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="14" r="1" fill="currentColor" stroke="none" />
      <path d="M10 18h4" />
    </Svg>
  );
}

export function IconSitemap(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="9" y="1" width="6" height="5" rx="1" />
      <rect x="1" y="16" width="6" height="5" rx="1" />
      <rect x="9" y="16" width="6" height="5" rx="1" />
      <rect x="17" y="16" width="6" height="5" rx="1" />
      <path d="M12 6v4M4 16v-4h16v4M12 10v2" />
    </Svg>
  );
}

export function IconTag(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth={2} />
    </Svg>
  );
}

export function IconDomainAge(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M12 10v3l2 2" />
    </Svg>
  );
}

export function IconCamera(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </Svg>
  );
}

export function IconSchedule(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <circle cx="16" cy="16" r="3" />
      <path d="M16 14.5v1.5l1 1" />
    </Svg>
  );
}

export function IconFingerprint(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M2 12a10 10 0 0 1 18-6" />
      <path d="M2 17.5c.95.75 2.02 1.36 3.17 1.79" />
      <path d="M20 10a10 10 0 0 1 .67 4.5" />
      <path d="M6 22c.21-.51.36-1.02.45-1.56" />
      <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
      <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
      <path d="M9 18.5c1-1.5 1-2.5 1-6.5a2 2 0 0 1 2-2" />
      <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
    </Svg>
  );
}

export function IconCaseSensitive(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 19L8 5l5 14" />
      <path d="M5.5 13h5" />
      <circle cx="18" cy="14" r="4" />
      <path d="M18 10V9" />
    </Svg>
  );
}

export function IconListSort(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 6h12M3 10h9M3 14h6" />
      <path d="M17 4v16M14 7l3-3 3 3M14 17l3 3 3-3" />
    </Svg>
  );
}

export function IconCheckBraces(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8 3H7a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1" />
      <path d="M14 13l2 2 4-4" />
    </Svg>
  );
}

export function IconDiff(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="1" y="2" width="10" height="20" rx="1" />
      <rect x="13" y="2" width="10" height="20" rx="1" />
      <line x1="3" y1="7" x2="9" y2="7" />
      <line x1="3" y1="11" x2="9" y2="11" />
      <line x1="3" y1="15" x2="7" y2="15" />
      <line x1="15" y1="7" x2="21" y2="7" />
      <line x1="15" y1="11" x2="21" y2="11" />
      <line x1="15" y1="15" x2="19" y2="15" />
    </Svg>
  );
}

export function IconThermometer(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </Svg>
  );
}

export function IconRuler(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="2" y="8" width="20" height="8" rx="1" />
      <path d="M6 8v3M9 8v2M12 8v3M15 8v2M18 8v3" />
    </Svg>
  );
}

export function IconBeaker(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M9 2v6.5L4 17a3 3 0 0 0 2.83 4h10.34A3 3 0 0 0 20 17L15 8.5V2" />
      <line x1="9" y1="2" x2="15" y2="2" />
      <path d="M5 14h14" />
    </Svg>
  );
}

export function IconFuelPump(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 22V8a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14" />
      <path d="M3 22h12" />
      <path d="M7 4V2M11 4V2" />
      <path d="M15 8.5v3a2 2 0 0 0 4 0V10l-2-2" />
      <path d="M5 11h8" />
    </Svg>
  );
}

export function IconAngleMeasure(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 20h14" />
      <path d="M5 20V6" />
      <path d="M5 6l14 14" />
      <path d="M8 20A5 5 0 0 1 5 15.5" strokeDasharray="3 2" />
    </Svg>
  );
}

export function IconHardDrive(p: IconProps) {
  return (
    <Svg {...p}>
      <line x1="22" y1="12" x2="2" y2="12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" />
      <line x1="16" y1="16" x2="17" y2="16" />
    </Svg>
  );
}

export function IconTerminal(p: IconProps) {
  return (
    <Svg {...p}>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </Svg>
  );
}

// ── Language-specific Icons ────────────────────────────────────────────────────

/** Python — official Python logo (#127) */
export function IconPython(p: IconProps) {
  const { size = 18, className } = p;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 20 20" fill="currentColor" stroke="none" className={className} aria-hidden="true">
      <g transform="translate(-284, -7439)">
        <path fillRule="evenodd" clipRule="evenodd" d="M296.744,7457.45798 C296.262,7457.45798 295.872,7457.06594 295.872,7456.58142 C295.872,7456.0969 296.262,7455.70587 296.744,7455.70587 C297.226,7455.70587 297.616,7456.0969 297.616,7456.58142 C297.616,7457.06594 297.226,7457.45798 296.744,7457.45798 M294.072,7459 C299.15,7459 298.833,7456.78649 298.833,7456.78649 L298.827,7454.49357 L293.982,7454.49357 L293.982,7453.80499 L300.751,7453.80499 C300.751,7453.80499 304,7454.17591 304,7449.02614 C304,7443.87636 301.165,7444.0583 301.165,7444.0583 L299.472,7444.0583 L299.472,7446.44873 C299.472,7446.44873 299.563,7449.29855 296.682,7449.29855 L291.876,7449.29855 C291.876,7449.29855 289.176,7449.25533 289.176,7451.9222 L289.176,7456.33112 C289.176,7456.33112 288.766,7459 294.072,7459 M291.257,7440.54202 C291.739,7440.54202 292.128,7440.93406 292.128,7441.41858 C292.128,7441.9031 291.739,7442.29413 291.257,7442.29413 C290.775,7442.29413 290.385,7441.9031 290.385,7441.41858 C290.385,7440.93406 290.775,7440.54202 291.257,7440.54202 M293.928,7439 C288.851,7439 289.168,7441.21351 289.168,7441.21351 L289.174,7443.50643 L294.019,7443.50643 L294.019,7444.19501 L287.249,7444.19501 C287.249,7444.19501 284,7443.82409 284,7448.97386 C284,7454.12364 286.836,7453.9417 286.836,7453.9417 L288.528,7453.9417 L288.528,7451.55127 C288.528,7451.55127 288.437,7448.70145 291.319,7448.70145 L296.124,7448.70145 C296.124,7448.70145 298.824,7448.74467 298.824,7446.0778 L298.824,7441.66888 C298.824,7441.66888 299.234,7439 293.928,7439" />
      </g>
    </svg>
  );
}

/** JavaScript — official JS badge (16×16 fill) */
export function IconJavaScript(p: IconProps) {
  const { size = 18, className } = p;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 16 16" fill="currentColor" stroke="none" className={className} aria-hidden="true">
      <path fillRule="nonzero" clipRule="nonzero" d="M0 1.75C0 0.783501 0.783502 0 1.75 0H14.25C15.2165 0 16 0.783502 16 1.75V3.75C16 4.16421 15.6642 4.5 15.25 4.5C14.8358 4.5 14.5 4.16421 14.5 3.75V1.75C14.5 1.61193 14.3881 1.5 14.25 1.5H1.75C1.61193 1.5 1.5 1.61193 1.5 1.75V14.25C1.5 14.3881 1.61193 14.5 1.75 14.5H15.25C15.6642 14.5 16 14.8358 16 15.25C16 15.6642 15.6642 16 15.25 16H1.75C0.783501 16 0 15.2165 0 14.25V1.75ZM8.25 5.75C8.66421 5.75 9 6.08579 9 6.5V10.5C9 11.5048 8.72399 12.2584 8.15514 12.7324C7.61223 13.1848 6.95384 13.25 6.5 13.25C6.08579 13.25 5.75 12.9142 5.75 12.5C5.75 12.0858 6.08579 11.75 6.5 11.75C6.84617 11.75 7.06277 11.6902 7.19486 11.5801C7.301 11.4916 7.5 11.2452 7.5 10.5V6.5C7.5 6.08579 7.83578 5.75 8.25 5.75ZM11.2757 6.58011C11.6944 6.08164 12.3507 5.75 13.25 5.75C14.0849 5.75 14.7148 6.03567 15.1394 6.48481C15.4239 6.78583 15.4105 7.26052 15.1095 7.54505C14.8085 7.82958 14.3338 7.81621 14.0493 7.51519C13.9394 7.39898 13.7204 7.25 13.25 7.25C12.7493 7.25 12.5306 7.41836 12.4243 7.54489C12.2934 7.70065 12.25 7.896 12.25 8C12.25 8.104 12.2934 8.29935 12.4243 8.45511C12.5306 8.58164 12.7493 8.75 13.25 8.75C13.3257 8.75 13.3988 8.76121 13.4676 8.78207C14.1307 8.87646 14.6319 9.17251 14.9743 9.58011C15.3684 10.0493 15.5 10.604 15.5 11C15.5 11.396 15.3684 11.9507 14.9743 12.4199C14.5556 12.9184 13.8993 13.25 13 13.25C12.1651 13.25 11.5352 12.9643 11.1106 12.5152C10.8261 12.2142 10.8395 11.7395 11.1405 11.4549C11.4415 11.1704 11.9162 11.1838 12.2007 11.4848C12.3106 11.601 12.5296 11.75 13 11.75C13.5007 11.75 13.7194 11.5816 13.8257 11.4551C13.9566 11.2993 14 11.104 14 11C14 10.896 13.9566 10.7007 13.8257 10.5449C13.7194 10.4184 13.5007 10.25 13 10.25C12.9243 10.25 12.8512 10.2388 12.7824 10.2179C12.1193 10.1235 11.6181 9.82749 11.2757 9.41989C10.8816 8.95065 10.75 8.396 10.75 8C10.75 7.604 10.8816 7.04935 11.2757 6.58011Z" />
    </svg>
  );
}

/** TypeScript — official TS badge (16×16 fill) */
export function IconTypeScript(p: IconProps) {
  const { size = 18, className } = p;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 16 16" fill="currentColor" stroke="none" className={className} aria-hidden="true">
      <path fillRule="nonzero" clipRule="nonzero" d="M0 1.75C0 0.783501 0.783502 0 1.75 0H14.25C15.2165 0 16 0.783502 16 1.75V3.75C16 4.16421 15.6642 4.5 15.25 4.5C14.8358 4.5 14.5 4.16421 14.5 3.75V1.75C14.5 1.61193 14.3881 1.5 14.25 1.5H1.75C1.61193 1.5 1.5 1.61193 1.5 1.75V14.25C1.5 14.3881 1.61193 14.5 1.75 14.5H15.25C15.6642 14.5 16 14.8358 16 15.25C16 15.6642 15.6642 16 15.25 16H1.75C0.783501 16 0 15.2165 0 14.25V1.75ZM4.75 6.5C4.75 6.08579 5.08579 5.75 5.5 5.75H9.25C9.66421 5.75 10 6.08579 10 6.5C10 6.91421 9.66421 7.25 9.25 7.25H8.25V12.5C8.25 12.9142 7.91421 13.25 7.5 13.25C7.08579 13.25 6.75 12.9142 6.75 12.5V7.25H5.5C5.08579 7.25 4.75 6.91421 4.75 6.5ZM11.2757 6.58011C11.6944 6.08164 12.3507 5.75 13.25 5.75C14.0849 5.75 14.7148 6.03567 15.1394 6.48481C15.4239 6.78583 15.4105 7.26052 15.1095 7.54505C14.8085 7.82958 14.3338 7.81621 14.0493 7.51519C13.9394 7.39898 13.7204 7.25 13.25 7.25C12.7493 7.25 12.5306 7.41836 12.4243 7.54489C12.2934 7.70065 12.25 7.896 12.25 8C12.25 8.104 12.2934 8.29935 12.4243 8.45511C12.5306 8.58164 12.7493 8.75 13.25 8.75C13.3257 8.75 13.3988 8.76121 13.4676 8.78207C14.1307 8.87646 14.6319 9.17251 14.9743 9.58011C15.3684 10.0493 15.5 10.604 15.5 11C15.5 11.396 15.3684 11.9507 14.9743 12.4199C14.5556 12.9184 13.8993 13.25 13 13.25C12.1651 13.25 11.5352 12.9643 11.1106 12.5152C10.8261 12.2142 10.8395 11.7395 11.1405 11.4549C11.4415 11.1704 11.9162 11.1838 12.2007 11.4848C12.3106 11.601 12.5296 11.75 13 11.75C13.5007 11.75 13.7194 11.5816 13.8257 11.4551C13.9566 11.2993 14 11.104 14 11C14 10.896 13.9566 10.7007 13.8257 10.5449C13.7194 10.4184 13.5007 10.25 13 10.25C12.9243 10.25 12.8512 10.2388 12.7824 10.2179C12.1193 10.1235 11.6181 9.82749 11.2757 9.41989C10.8816 8.95065 10.75 8.396 10.75 8C10.75 7.604 10.8816 7.04935 11.2757 6.58011Z" />
    </svg>
  );
}

/** Java — official Java logo (16×16 fill) */
export function IconJava(p: IconProps) {
  const { size = 18, className } = p;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 16 16" fill="currentColor" stroke="none" className={className} aria-hidden="true">
      <path fillRule="nonzero" clipRule="nonzero" d="M4.45262 0.77086C4.71879 0.451461 5.19348 0.408307 5.51288 0.674473C6.27367 1.30846 6.56914 2.05693 6.4059 2.79543C6.26691 3.42419 5.82892 3.87253 5.4875 4.11099C5.27416 4.29388 5.18522 4.43743 5.14847 4.52681C5.11339 4.61211 5.11415 4.67467 5.12613 4.72887C5.15746 4.87054 5.29291 5.0395 5.44856 5.14327C5.7945 5.37389 5.88798 5.84129 5.65735 6.18722C5.42673 6.53316 4.95933 6.62664 4.61339 6.39602C4.26717 6.1652 3.80036 5.70682 3.65602 5.05387C3.49275 4.31537 3.78822 3.56689 4.54901 2.9329L4.5799 2.90715L4.61336 2.88485C4.76901 2.78108 4.90445 2.61213 4.93577 2.47046C4.94775 2.41627 4.94851 2.3537 4.91343 2.2684C4.87525 2.17555 4.78076 2.02424 4.54901 1.83112C4.22961 1.56495 4.18646 1.09026 4.45262 0.77086ZM9.1224 2.77835C9.38857 3.09775 9.34542 3.57244 9.02602 3.83861C8.79427 4.03173 8.69978 4.18303 8.66159 4.27588C8.62651 4.36119 8.62728 4.42375 8.63926 4.47794C8.67057 4.61962 8.80602 4.78857 8.96166 4.89233C9.3076 5.12296 9.40108 5.59035 9.17045 5.93629C8.93983 6.28223 8.47243 6.3757 8.1265 6.14508C7.78027 5.91426 7.31347 5.45587 7.16913 4.80292C7.00588 4.06442 7.30136 3.31595 8.06214 2.68196C8.38154 2.41579 8.85624 2.45895 9.1224 2.77835ZM0.207849 7.59455C0.29163 7.25942 0.59274 7.02432 0.938179 7.02432H12.4962C12.8417 7.02432 13.1428 7.25942 13.2266 7.59455C13.3354 8.03003 13.3631 8.58563 13.3041 9.20747H15.1472C15.563 9.20747 15.9 9.54451 15.9 9.96027C15.9 10.6991 15.8551 11.8958 15.103 12.8984C14.3624 13.8856 13.0731 14.5203 11.0103 14.5882C10.7408 14.9262 10.444 15.2603 10.1177 15.5866C9.97652 15.7278 9.78504 15.8071 9.58538 15.8071H3.84904C3.64938 15.8071 3.4579 15.7278 3.31672 15.5866C1.86788 14.1377 0.999928 12.5367 0.537609 11.1148C0.0832301 9.7174 0.000142552 8.42537 0.207849 7.59455ZM9.26725 14.3015C9.54933 14.0025 9.80359 13.6979 10.0322 13.3914C10.965 12.1406 11.4703 10.8584 11.691 9.80577C11.7965 9.30267 11.8334 8.87025 11.8284 8.52994H1.60604C1.59838 9.05604 1.69095 9.79279 1.96944 10.6493C2.34144 11.7933 3.02818 13.0942 4.16717 14.3015H9.26725ZM12.0935 12.9643C13.0969 12.7691 13.6142 12.3739 13.8986 11.9949C14.1788 11.6214 14.3043 11.176 14.3577 10.7131H13.0182C12.8197 11.4239 12.5193 12.189 12.0935 12.9643Z" />
    </svg>
  );
}

/** C — official C logo (hexagon + C arc, 15×15 stroke) */
export function IconC(p: IconProps) {
  const { size = 18, className } = p;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M10 5.5L9.93198 5.43198C9.33524 4.83524 8.52589 4.5 7.68198 4.5H7.5C5.84315 4.5 4.5 5.84315 4.5 7.5C4.5 9.15685 5.84315 10.5 7.5 10.5H7.68198C8.52589 10.5 9.33524 10.1648 9.93198 9.56802L10 9.5M1.5 10.5V4.5L7.5 1L13.5 4.5V10.5L7.5 14L1.5 10.5Z" />
    </svg>
  );
}

/** C++ — official file_cpp logo (20×20 fill) */
export function IconCpp(p: IconProps) {
  const { size = 18, className } = p;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 20 20" fill="currentColor" stroke="none" className={className} aria-hidden="true">
      <g transform="translate(-164, -1159)">
        <path fillRule="evenodd" clipRule="evenodd" d="M183.7247,1165.1171 L178.2747,1159.36202 C178.0857,1159.16505 177.8237,1159.0009 177.5497,1159.0009 L165.9997,1159.0009 C164.8957,1159.0009 163.9997,1159.99573 163.9997,1161.09402 L163.9997,1168.0578 C163.9997,1168.60794 164.4477,1169.05263 164.9997,1169.05263 C165.5527,1169.05263 165.9997,1168.60794 165.9997,1168.0578 L165.9997,1162.08884 C165.9997,1161.5397 166.4477,1160.99055 166.9997,1160.99055 L175.9997,1160.99055 L175.9997,1165.07332 C175.9997,1166.17261 176.8957,1166.95952 177.9997,1166.95952 L181.9997,1166.95952 L181.9997,1168.0578 C181.9997,1168.60794 182.4477,1169.05263 182.9997,1169.05263 C183.5527,1169.05263 183.9997,1168.60794 183.9997,1168.0578 L183.9997,1165.80253 C183.9997,1165.54786 183.9017,1165.30213 183.7247,1165.1171 M181.9997,1174.02677 C181.9997,1173.47762 181.5527,1173.03194 180.9997,1173.03194 L179.9997,1173.03194 L179.9997,1175.02159 L180.9997,1175.02159 C181.5527,1175.02159 181.9997,1174.5769 181.9997,1174.02677 M183.9997,1173.9233 C183.9997,1175.57173 182.6567,1176.90778 180.9997,1176.90778 L179.9997,1176.90778 L179.9997,1178.00607 C179.9997,1178.55621 179.5527,1179.0009 178.9997,1179.0009 C178.4477,1179.0009 177.9997,1178.55621 177.9997,1178.00607 L177.9997,1172.03711 C177.9997,1171.48797 178.4477,1170.93882 178.9997,1170.93882 L180.9997,1170.93882 C182.6567,1170.93882 183.9997,1172.27488 183.9997,1173.9233 M174.9997,1174.02677 C174.9997,1173.47762 174.5527,1173.03194 173.9997,1173.03194 L172.9997,1173.03194 L172.9997,1175.02159 L173.9997,1175.02159 C174.5527,1175.02159 174.9997,1174.5769 174.9997,1174.02677 M176.9997,1173.9233 C176.9997,1175.57173 175.6567,1176.90778 173.9997,1176.90778 L172.9997,1176.90778 L172.9997,1178.00607 C172.9997,1178.55621 172.5527,1179.0009 171.9997,1179.0009 C171.4477,1179.0009 170.9997,1178.55621 170.9997,1178.00607 L170.9997,1172.03711 C170.9997,1171.48797 171.4477,1170.93882 171.9997,1170.93882 L173.9997,1170.93882 C175.6567,1170.93882 176.9997,1172.27488 176.9997,1173.9233 M165.9997,1174.91813 C165.9997,1176.01642 166.8957,1176.90778 167.9997,1176.90778 L168.9997,1176.90778 C169.5527,1176.90778 169.9997,1177.35247 169.9997,1177.90261 C169.9997,1178.45176 169.5527,1178.89744 168.9997,1178.89744 L167.9997,1178.89744 C165.7907,1178.89744 163.9997,1177.1157 163.9997,1174.91813 C163.9997,1172.72056 165.7907,1170.93882 167.9997,1170.93882 L168.9997,1170.93882 C169.5527,1170.93882 169.9997,1171.38351 169.9997,1171.93365 C169.9997,1172.48279 169.5527,1172.92848 168.9997,1172.92848 L167.9997,1172.92848 C166.8957,1172.92848 165.9997,1173.81885 165.9997,1174.91813" />
      </g>
    </svg>
  );
}

/** Go — official Go logo (double-ring, 16×16 fill) */
export function IconGo(p: IconProps) {
  const { size = 18, className } = p;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 16 16" fill="currentColor" stroke="none" className={className} aria-hidden="true">
      <path fillRule="nonzero" clipRule="nonzero" d="M4.12903 5.54839C2.70378 5.54839 1.54839 6.70378 1.54839 8.12903C1.54839 9.55428 2.70378 10.7097 4.12903 10.7097C5.28455 10.7097 6.26269 9.95022 6.59153 8.90323H4.64516C4.21759 8.90323 3.87097 8.55661 3.87097 8.12903C3.87097 7.70146 4.21759 7.35484 4.64516 7.35484H7.8144C8.17678 5.44449 9.85518 4 11.871 4C14.1514 4 16 5.84863 16 8.12903C16 10.4094 14.1514 12.2581 11.871 12.2581C10.0971 12.2581 8.58443 11.1394 8 9.56909C7.41558 11.1394 5.90294 12.2581 4.12903 12.2581C1.84863 12.2581 0 10.4094 0 8.12903C0 5.84863 1.84863 4 4.12903 4C4.94646 4 5.71059 4.23833 6.35292 4.64957C6.71302 4.88011 6.81804 5.35892 6.5875 5.71902C6.35695 6.07912 5.87814 6.18414 5.51805 5.9536C5.11749 5.69715 4.64182 5.54839 4.12903 5.54839ZM11.871 5.54839C10.4457 5.54839 9.29032 6.70378 9.29032 8.12903C9.29032 9.55428 10.4457 10.7097 11.871 10.7097C13.2962 10.7097 14.4516 9.55428 14.4516 8.12903C14.4516 6.70378 13.2962 5.54839 11.871 5.54839Z" />
    </svg>
  );
}


/** Ruby — official Ruby gem (15×15 fill) */
export function IconRuby(p: IconProps) {
  const { size = 18, className } = p;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 15 15" fill="currentColor" stroke="none" className={className} aria-hidden="true">
      <path d="M14.5 14.5V15H15V14.5H14.5ZM14.5 0.5H15V0H14.5V0.5ZM8.5 0.5V0H8.29289L8.14645 0.146447L8.5 0.5ZM0.5 8.5L0.146447 8.14645L0 8.29289V8.5H0.5ZM0.5 14.5H0V15H0.5V14.5ZM4.5 10.5L4.27639 10.9472L4.29499 10.9565L4.3143 10.9642L4.5 10.5ZM4.5 4.5V4C4.22386 4 4 4.22386 4 4.5H4.5ZM10.5 4.5L10.9642 4.3143L10.9565 4.29499L10.9472 4.27639L10.5 4.5ZM15 14.5V0.5H14V14.5H15ZM14.5 0H8.5V1H14.5V0ZM8.14645 0.146447L0.146447 8.14645L0.853553 8.85355L8.85355 0.853553L8.14645 0.146447ZM0 8.5V14.5H1V8.5H0ZM0.5 15H14.5V14H0.5V15ZM14.1464 0.146447L0.146447 14.1464L0.853553 14.8536L14.8536 0.853553L14.1464 0.146447ZM5 10.5V4.5H4V10.5H5ZM4.5 5H10.5V4H4.5V5ZM4.3143 10.9642L14.3143 14.9642L14.6857 14.0358L4.6857 10.0358L4.3143 10.9642ZM10.0358 4.6857L14.0358 14.6857L14.9642 14.3143L10.9642 4.3143L10.0358 4.6857ZM8.05279 0.723607L10.0528 4.72361L10.9472 4.27639L8.94721 0.276393L8.05279 0.723607ZM0.276393 8.94721L4.27639 10.9472L4.72361 10.0528L0.723607 8.05279L0.276393 8.94721Z" />
    </svg>
  );
}

/** PHP — official PHP logo (512×512 fill) */
export function IconPhp(p: IconProps) {
  const { size = 18, className } = p;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 512 512" fill="currentColor" stroke="none" className={className} aria-hidden="true">
      <path d="M171.844,204.374c-11.137-12.748-28.856-19.123-53.146-19.123H37.96L0.5,377.99h41.984l9.96-51.241h35.963c15.869,0,28.923-1.663,39.173-5.003c10.247-3.33,19.562-8.92,27.945-16.767c7.037-6.467,12.725-13.599,17.087-21.4c4.354-7.797,7.448-16.401,9.278-25.812C186.333,234.919,182.98,217.124,171.844,204.374z M138.493,254.823c-2.903,14.917-8.492,25.563-16.775,31.941c-8.288,6.38-20.897,9.569-37.822,9.569H58.354l15.678-80.667H102.8c15.952,0,26.582,2.943,31.896,8.832C140.006,230.39,141.275,240.497,138.493,254.823z M337.828,237.059l-17.429,89.69h-42.317l16.572-85.278c1.884-9.702,1.193-16.32-2.084-19.847c-3.272-3.529-10.242-5.296-20.9-5.296h-33.289l-21.458,110.421h-41.656l37.46-192.739h41.656l-9.959,51.241h37.111c23.346,0,39.452,4.077,48.317,12.218C338.718,205.615,341.371,218.813,337.828,237.059z M499.554,204.374c-11.137-12.748-28.856-19.123-53.142-19.123h-80.738l-37.46,192.739h41.984l9.96-51.241h35.963c15.869,0,28.918-1.663,39.169-5.003c10.247-3.33,19.562-8.92,27.945-16.767c7.036-6.467,12.729-13.599,17.088-21.4c4.354-7.797,7.447-16.401,9.277-25.812C514.042,234.919,510.694,217.124,499.554,204.374z M466.206,254.823c-2.902,14.917-8.491,25.563-16.779,31.941c-8.284,6.38-20.896,9.569-37.822,9.569h-25.537l15.678-80.667h28.765c15.952,0,26.581,2.943,31.899,8.832C467.72,230.39,468.984,240.497,466.206,254.823z" />
    </svg>
  );
}

/** SQLite — database cylinder (24×24 fill) */
export function IconSqliteDb(p: IconProps) {
  const { size = 18, className } = p;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className} aria-hidden="true">
      <path d="M19.48 4.54C17.1332 3.44415 14.5886 2.83523 12 2.75C9.41134 2.83523 6.8668 3.44415 4.51999 4.54C4.21866 4.68158 3.96427 4.90664 3.78702 5.18847C3.60977 5.47031 3.51709 5.79708 3.51999 6.13V17.87C3.51709 18.2029 3.60977 18.5297 3.78702 18.8115C3.96427 19.0934 4.21866 19.3184 4.51999 19.46C6.8668 20.5559 9.41134 21.1648 12 21.25C14.5886 21.1648 17.1332 20.5559 19.48 19.46C19.7813 19.3184 20.0357 19.0934 20.213 18.8115C20.3902 18.5297 20.4829 18.2029 20.48 17.87V6.13C20.4829 5.79708 20.3902 5.47031 20.213 5.18847C20.0357 4.90664 19.7813 4.68158 19.48 4.54ZM19 12.54C16.8088 13.5858 14.4264 14.1712 12 14.26C9.57362 14.1712 7.19122 13.5858 4.99999 12.54V8.68C7.20966 9.65164 9.58702 10.1848 12 10.25C14.413 10.1848 16.7903 9.65164 19 8.68V12.54ZM5.14999 5.9C7.2984 4.89285 9.62863 4.33155 12 4.25C14.3743 4.33323 16.7075 4.89442 18.86 5.9C18.9021 5.92191 18.9374 5.95492 18.9621 5.99547C18.9868 6.03601 18.9999 6.08254 19 6.13V7C16.8088 8.0458 14.4264 8.63119 12 8.72C9.57362 8.63119 7.19122 8.0458 4.99999 7V6.1C5.00524 6.05643 5.02187 6.01501 5.0482 5.9799C5.07453 5.9448 5.10964 5.91724 5.14999 5.9ZM18.85 18.1C16.7016 19.1071 14.3714 19.6684 12 19.75C9.62566 19.6668 7.29248 19.1056 5.13999 18.1C5.09789 18.0781 5.06258 18.0451 5.0379 18.0045C5.01322 17.964 5.00011 17.9175 4.99999 17.87V14.18C7.20966 15.1516 9.58702 15.6848 12 15.75C14.413 15.6848 16.7903 15.1516 19 14.18V17.87C19.0002 17.9188 18.9861 17.9666 18.9594 18.0074C18.9327 18.0483 18.8947 18.0805 18.85 18.1Z" />
    </svg>
  );
}

// ── Resolvers ──────────────────────────────────────────────────────────────────

const CATEGORY_MAP: Record<string, React.ComponentType<IconProps>> = {
  calculators: IconCalculator,
  converters: IconConverter,
  "dev-tools": IconCode,
  "text-tools": IconText,
  generators: IconZap,
  "image-tools": IconImage,
  "pdf-tools": IconFile,
  "date-time-tools": IconClock,
  "seo-tools": IconSearch,
  "design-tools": IconPalette,
  "utility-tools": IconWrench,
  comparators: IconDiff,
  compilers: IconTerminal,
};

const SUBCATEGORY_MAP: Record<string, React.ComponentType<IconProps>> = {
  finance: IconTrendingUp,
  health: IconActivity,
  math: IconSigma,
  statistics: IconBarChart,
  basic: IconCalculator,
  unit: IconConverter,
  data: IconLayers,
  file: IconFile,
  currency: IconTrendingUp,
  json: IconBraces,
  xml: IconBraces,
  encoding: IconLayers,
  security: IconShield,
  code: IconCode,
};

export function getCategoryIcon(
  slug: string
): React.ComponentType<IconProps> {
  return CATEGORY_MAP[slug] ?? IconBox;
}

export function getSubcategoryIcon(
  subcategorySlug: string,
  categorySlug: string
): React.ComponentType<IconProps> {
  return (
    SUBCATEGORY_MAP[subcategorySlug] ??
    getCategoryIcon(categorySlug)
  );
}

function has(s: string, ...terms: string[]): boolean {
  return terms.some((t) => s.includes(t));
}

const SLUG_ICON_MAP: Record<string, React.ComponentType<IconProps>> = {
  // ── Calculators › Basic ──────────────────────────────────────────────────────
  "percentage-calculator": IconSigma,
  "average-calculator": IconSigma,
  "ratio-calculator": IconSigma,
  "fraction-calculator": IconSigma,
  "exponent-calculator": IconSigma,
  "root-calculator": IconSigma,
  "scientific-calculator": IconSigma,
  // ── Calculators › Finance ────────────────────────────────────────────────────
  "loan-calculator": IconBanknote,
  "emi-calculator": IconBanknote,
  "mortgage-calculator": IconHouse,
  "interest-calculator": IconTrendingUp,
  "compound-interest-calculator": IconTrendingUp,
  "investment-calculator": IconTrendingUp,
  "sip-calculator": IconRepeat,
  "retirement-calculator": IconSunrise,
  "tax-calculator": IconReceipt,
  "salary-calculator": IconBriefcase,
  // ── Calculators › Health ─────────────────────────────────────────────────────
  "bmi-calculator": IconScaleBalance,
  "calorie-calculator": IconFlame,
  "body-fat-calculator": IconActivity,
  "water-intake-calculator": IconDroplet,
  "pregnancy-due-date-calculator": IconBaby,
  "ideal-weight-calculator": IconScaleBalance,
  // ── Calculators › Math ───────────────────────────────────────────────────────
  "gcd-calculator": IconSigma,
  "lcm-calculator": IconSigma,
  "prime-number-checker": IconHash,
  "factorial-calculator": IconSigma,
  "permutation-calculator": IconBarChart,
  "combination-calculator": IconBarChart,
  // ── Calculators › Statistics ─────────────────────────────────────────────────
  "mean-calculator": IconBarChart,
  "median-calculator": IconBarChart,
  "mode-calculator": IconBarChart,
  "standard-deviation-calculator": IconBarChart,
  "variance-calculator": IconBarChart,
  "probability-calculator": IconBarChart,
  // ── Converters › Unit ────────────────────────────────────────────────────────
  "length-converter": IconRuler,
  "weight-converter": IconScaleBalance,
  "temperature-converter": IconThermometer,
  "speed-converter": IconGauge,
  "time-converter": IconClock,
  "area-converter": IconGrid,
  "volume-converter": IconBeaker,
  "pressure-converter": IconGauge,
  "energy-converter": IconZap,
  "force-converter": IconActivity,
  "power-converter": IconZap,
  "fuel-economy-converter": IconFuelPump,
  "angle-converter": IconAngleMeasure,
  "data-converter": IconHardDrive,
  "timezone-converter": IconGlobe,
  // ── Converters › Data ────────────────────────────────────────────────────────
  "json-to-xml": IconBraces,
  "xml-to-json": IconBraces,
  "json-to-yaml": IconBraces,
  "yaml-to-json": IconBraces,
  "csv-to-json": IconBraces,
  "json-to-csv": IconBraces,
  "base64-converter": IconLayers,
  "hex-to-rgb": IconEyedropper,
  "rgb-to-hex": IconEyedropper,
  // ── Converters › File ────────────────────────────────────────────────────────
  "master-file-converter": IconConverter,
  "pdf-to-word": IconFile,
  "word-to-pdf": IconFile,
  "image-to-pdf": IconFile,
  "pdf-to-jpg": IconImage,
  "jpg-to-png": IconImage,
  "png-to-webp": IconImage,
  "pptx-to-pdf": IconFile,
  "xlsx-to-pdf": IconFile,
  "docx-to-odt": IconFile,
  "odt-to-docx": IconFile,
  "pptx-to-odp": IconFile,
  "odp-to-pptx": IconFile,
  "xlsx-to-ods": IconFile,
  "ods-to-xlsx": IconFile,
  // ── Converters › Currency ────────────────────────────────────────────────────
  "currency-converter": IconBanknote,
  // ── Dev Tools › JSON ─────────────────────────────────────────────────────────
  "json-formatter": IconBraces,
  "json-validator": IconCheckBraces,
  "json-minifier": IconBraces,
  "json-diff": IconDiff,
  // ── Dev Tools › XML ──────────────────────────────────────────────────────────
  "xml-formatter": IconBraces,
  "xml-validator": IconCheckBraces,
  "xml-minifier": IconBraces,
  "xml-diff": IconDiff,
  // ── Dev Tools › Encoding ─────────────────────────────────────────────────────
  "base64-encoder-decoder": IconLayers,
  "url-encode": IconLink,
  "url-decode": IconLink,
  "html-encode": IconCode,
  "html-decode": IconCode,
  "image-to-base64": IconLayers,
  // ── Dev Tools › Security ─────────────────────────────────────────────────────
  "hash-generator": IconHash,
  "jwt-decoder": IconKey,
  "password-generator": IconKey,
  "api-key-generator": IconKey,
  "token-generator": IconKey,
  // ── Dev Tools › Code ─────────────────────────────────────────────────────────
  "regex-tester": IconRegex,
  "uuid-generator": IconFingerprint,
  "cron-generator": IconSchedule,
  "timestamp-converter": IconTimestamp,
  "markdown-preview": IconType,
  "css-box-shadow-generator": IconShadow,
  "code-snapshot": IconCamera,
  // ── Text Tools ───────────────────────────────────────────────────────────────
  "word-counter": IconType,
  "character-counter": IconType,
  "line-counter": IconType,
  "case-converter": IconCaseSensitive,
  "text-sorter": IconListSort,
  "text-reverser": IconType,
  "remove-duplicate-lines": IconType,
  "remove-extra-spaces": IconType,
  "slug-generator": IconLink,
  "lorem-ipsum-generator": IconType,
  "keyword-density-checker": IconSearch,
  // ── Generators ───────────────────────────────────────────────────────────────
  "qr-code-generator": IconGrid,
  "barcode-generator": IconGrid,
  "random-number-generator": IconDice,
  "random-string-generator": IconShuffle,
  "random-color-generator": IconPalette,
  // ── Image Tools ──────────────────────────────────────────────────────────────
  "image-compressor": IconCompress,
  "image-resizer": IconExpand,
  "image-cropper": IconCrop,
  "image-rotator": IconRotateCw,
  "image-watermark": IconStamp,
  "background-remover": IconEraser,
  "base64-to-image": IconImage,
  // ── Date & Time Tools ────────────────────────────────────────────────────────
  "age-calculator": IconClock,
  "date-difference-calculator": IconClock,
  "time-difference-calculator": IconClock,
  "countdown-timer": IconCountdown,
  "stopwatch": IconStopwatch,
  "business-days-calculator": IconBriefcase,
  "date-formatter": IconSchedule,
  "date-calculator": IconClock,
  "date-generator": IconSchedule,
  "relative-time-formatter": IconClock,
  // ── SEO Tools ────────────────────────────────────────────────────────────────
  "meta-tag-generator": IconTag,
  "robots-txt-generator": IconRobot,
  "sitemap-generator": IconSitemap,
  "domain-age-checker": IconDomainAge,
  // ── Design Tools ─────────────────────────────────────────────────────────────
  "color-picker": IconEyedropper,
  "gradient-generator": IconPalette,
  "border-radius-generator": IconCornerRadius,
  "favicon-generator": IconFavicon,
  // ── Utility Tools ────────────────────────────────────────────────────────────
  "speedometer": IconGauge,
  "internet-speed-test": IconGauge,
  "screen-resolution-checker": IconMonitor,
  "device-info-checker": IconCpu,
  "battery-health-checker": IconBattery,
  "coin-flip": IconCoin,
  "dice-roller": IconDice,
  // ── Compilers ────────────────────────────────────────────────────────────────
  "code-compiler": IconTerminal,
  "python-compiler": IconPython,
  "javascript-compiler": IconJavaScript,
  "typescript-compiler": IconTypeScript,
  "java-compiler": IconJava,
  "c-compiler": IconC,
  "cpp-compiler": IconCpp,
  "go-compiler": IconGo,
  "bash-compiler": IconTerminal,
  "ruby-compiler": IconRuby,
  "php-compiler": IconPhp,
  "sqlite-compiler": IconSqliteDb,
  // ── PDF Tools ────────────────────────────────────────────────────────────────
  "pdf-compressor": IconCompress,
  "pdf-rotate": IconRotateCw,
  "pdf-merger": IconMerge,
  "pdf-splitter": IconSplit,
  "pdf-lock": IconLock,
  "pdf-unlock": IconUnlock,
  "pdf-page-number": IconHash,
};

export function getToolIcon(
  tool: ToolMeta
): React.ComponentType<IconProps> {
  const s = tool.slug;

  if (SLUG_ICON_MAP[s]) return SLUG_ICON_MAP[s];

  if (has(s, "password", "passphrase", "api-key", "token", "jwt", "secret"))
    return IconKey;
  if (has(s, "json", "xml", "yaml", "toml"))
    return IconBraces;
  if (has(s, "hash", "md5", "sha", "checksum", "crc"))
    return IconHash;
  if (has(s, "url", "link", "uri", "slug"))
    return IconLink;
  if (has(s, "uuid", "random", "shuffle", "dice", "coin", "number-picker", "lottery"))
    return IconShuffle;
  if (has(s, "base64", "encode", "decode", "cipher"))
    return IconLayers;
  if (has(s, "color", "rgb", "hex", "hsl", "palette", "gradient"))
    return IconPalette;
  if (has(s, "age", "date", "time", "clock", "timestamp", "epoch", "countdown", "stopwatch", "timezone", "business-day"))
    return IconClock;
  if (has(s, "loan", "emi", "mortgage", "interest", "investment", "sip", "retire", "tax", "salary", "currency"))
    return IconTrendingUp;
  if (has(s, "bmi", "calorie", "body-fat", "water-intake", "pregnancy", "ideal-weight"))
    return IconActivity;
  if (has(s, "mean", "median", "mode", "deviation", "variance", "probability", "permut", "combin", "factorial", "gcd", "lcm", "prime", "sigma"))
    return IconBarChart;
  if (has(s, "scientific", "square-root", "exponent", "fraction", "ratio", "average", "percentage"))
    return IconSigma;
  if (has(s, "regex"))
    return IconRegex;
  if (has(s, "markdown", "lorem", "word", "character", "line", "case", "sort", "reverse", "duplicate", "space", "slug"))
    return IconType;
  if (has(s, "pdf"))
    return IconFile;
  if (has(s, "ip-lookup", "whois", "dns", "ping", "port", "website-status", "domain"))
    return IconGlobe;
  if (has(s, "meta-tag", "robots", "sitemap", "keyword", "url-encoder", "url-decoder"))
    return IconSearch;
  if (has(s, "css", "border-radius", "box-shadow", "favicon"))
    return IconCode;
  if (has(s, "qr-code", "barcode"))
    return IconGrid;
  if (has(s, "speed", "screen", "battery", "device", "internet"))
    return IconGauge;
  if (has(s, "grammar", "summar", "email-writer", "resume", "code-gen", "image-gen"))
    return IconSparkle;
  if (has(s, "image"))
    return IconImage;

  return getCategoryIcon(tool.category);
}
