"use client";

import { useState, useEffect } from "react";

interface DeviceInfo {
  browser: { name: string; version: string; engine: string };
  os: { name: string; version: string };
  device: { type: string; architecture: string };
  hardware: {
    cores: string;
    memory: string;
    touchPoints: string;
    online: string;
    connection: string;
    cookiesEnabled: string;
    language: string;
    languages: string;
    platform: string;
  };
  display: {
    resolution: string;
    physicalResolution: string;
    dpr: string;
    colorDepth: string;
    orientation: string;
  };
}

async function gatherInfo(): Promise<DeviceInfo> {
  const nav = navigator as Navigator & {
    userAgentData?: {
      platform: string;
      mobile: boolean;
      brands: Array<{ brand: string; version: string }>;
      getHighEntropyValues: (hints: string[]) => Promise<Record<string, unknown>>;
    };
    deviceMemory?: number;
    connection?: { effectiveType?: string; type?: string };
  };

  let browserName = "Unknown";
  let browserVersion = "Unknown";
  let osName = "Unknown";
  let osVersion = "Unknown";
  let deviceType = "desktop";
  let cpuArch = "Unknown";
  let engineName = "Unknown";

  // Try UA-CH (Client Hints) first
  if (nav.userAgentData) {
    try {
      const hints = await nav.userAgentData.getHighEntropyValues([
        "architecture",
        "platformVersion",
        "fullVersionList",
      ]);

      const brands = nav.userAgentData.brands;
      const significantBrand = brands.find(
        (b) => !b.brand.includes("Not") && !b.brand.includes("Chromium")
      );
      browserName = significantBrand?.brand ?? brands[0]?.brand ?? "Unknown";

      const fullList = hints.fullVersionList as Array<{ brand: string; version: string }> | undefined;
      const full = fullList?.find((b) => b.brand === browserName);
      browserVersion = full?.version ?? significantBrand?.version ?? "Unknown";

      osName = hints.platform as string ?? nav.userAgentData.platform;
      osVersion = hints.platformVersion as string ?? "Unknown";
      cpuArch = hints.architecture as string ?? "Unknown";
      deviceType = nav.userAgentData.mobile ? "mobile" : "desktop";
    } catch {
      /* fall through */
    }
  }

  // UAParser.js fallback for anything still unknown
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod = await import("ua-parser-js") as any;
    const UAParser = mod.UAParser ?? mod.default;
    const result = new UAParser().getResult();

    if (browserName === "Unknown") browserName = result.browser?.name ?? "Unknown";
    if (browserVersion === "Unknown") browserVersion = result.browser?.version ?? "Unknown";
    if (osName === "Unknown") osName = result.os?.name ?? "Unknown";
    if (osVersion === "Unknown") osVersion = result.os?.version ?? "Unknown";
    if (cpuArch === "Unknown") cpuArch = result.cpu?.architecture ?? "Unknown";
    if (deviceType === "desktop" && result.device?.type) deviceType = result.device.type;
    engineName = result.engine?.name ?? "Unknown";
  } catch {
    /* ignore */
  }

  const dpr = window.devicePixelRatio || 1;
  const conn = nav.connection;

  return {
    browser: { name: browserName, version: browserVersion, engine: engineName },
    os: { name: osName, version: osVersion },
    device: { type: deviceType, architecture: cpuArch },
    hardware: {
      cores: nav.hardwareConcurrency ? `${nav.hardwareConcurrency} logical cores` : "Unknown",
      memory: nav.deviceMemory ? `${nav.deviceMemory} GB (approximate)` : "Unknown",
      touchPoints: `${nav.maxTouchPoints ?? 0}`,
      online: navigator.onLine ? "Online" : "Offline",
      connection: conn?.effectiveType ?? conn?.type ?? "Unknown",
      cookiesEnabled: navigator.cookieEnabled ? "Enabled" : "Disabled",
      language: navigator.language ?? "Unknown",
      languages: (navigator.languages ?? [navigator.language]).join(", "),
      platform: navigator.platform ?? "Unknown",
    },
    display: {
      resolution: `${screen.width} × ${screen.height} px`,
      physicalResolution: `${Math.round(screen.width * dpr)} × ${Math.round(screen.height * dpr)} px`,
      dpr: `${dpr}×`,
      colorDepth: `${screen.colorDepth}-bit`,
      orientation: screen.orientation?.type ?? "Unknown",
    },
  };
}

const sectionLabelCls =
  "font-mono text-[10px] uppercase tracking-wider text-foreground-muted/40 px-4 py-2 border-b border-border bg-surface";

export function DeviceInfoChecker() {
  const [info, setInfo] = useState<DeviceInfo | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gatherInfo()
      .then(setInfo)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const copyRow = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  if (loading || !info) {
    return (
      <p className="font-mono text-[10px] text-foreground-muted/40">Gathering device info…</p>
    );
  }

  const sections: Array<{
    title: string;
    rows: Array<{ key: string; label: string; value: string }>;
  }> = [
    {
      title: "Browser",
      rows: [
        { key: "b-name", label: "Name", value: info.browser.name },
        { key: "b-ver", label: "Version", value: info.browser.version },
        { key: "b-engine", label: "Engine", value: info.browser.engine },
      ],
    },
    {
      title: "Operating System",
      rows: [
        { key: "os-name", label: "Name", value: info.os.name },
        { key: "os-ver", label: "Version", value: info.os.version },
        { key: "cpu-arch", label: "Architecture", value: info.device.architecture },
        { key: "dev-type", label: "Device Type", value: info.device.type },
      ],
    },
    {
      title: "Hardware & System",
      rows: [
        { key: "cores", label: "CPU Cores", value: info.hardware.cores },
        { key: "mem", label: "Memory", value: info.hardware.memory },
        { key: "touch", label: "Touch Points", value: info.hardware.touchPoints },
        { key: "online", label: "Network Status", value: info.hardware.online },
        { key: "conn", label: "Connection Type", value: info.hardware.connection },
        { key: "cookies", label: "Cookies", value: info.hardware.cookiesEnabled },
        { key: "lang", label: "Language", value: info.hardware.language },
        { key: "langs", label: "Languages", value: info.hardware.languages },
        { key: "platform", label: "Platform", value: info.hardware.platform },
      ],
    },
    {
      title: "Display",
      rows: [
        { key: "res", label: "Resolution", value: info.display.resolution },
        { key: "phys-res", label: "Physical Resolution", value: info.display.physicalResolution },
        { key: "dpr", label: "Pixel Ratio", value: info.display.dpr },
        { key: "depth", label: "Color Depth", value: info.display.colorDepth },
        { key: "orient", label: "Orientation", value: info.display.orientation },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="border border-border divide-y divide-border">
        {sections.map((section) => (
          <div key={section.title}>
            <div className={sectionLabelCls}>— {section.title}</div>
            {section.rows.map(({ key, label, value }) => (
              <div
                key={key}
                className="flex items-center bg-surface hover:bg-surface-muted transition-colors"
              >
                <span className="font-mono text-[10px] uppercase tracking-wider px-4 py-2.5 w-36 sm:w-48 shrink-0 border-r border-border text-foreground-muted/70 whitespace-nowrap">
                  {label}
                </span>
                <span className="font-mono text-sm px-4 py-2.5 flex-1 text-foreground/80 break-all">
                  {value}
                </span>
                <button
                  onClick={() => copyRow(key, value)}
                  className="font-mono text-[10px] px-3 py-2.5 text-foreground-muted/40 hover:text-primary shrink-0 transition-colors"
                  title="Copy"
                >
                  {copied === key ? "✓" : "⎘"}
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
      <p className="font-mono text-[10px] text-foreground-muted/40">
        Memory and CPU cores may be rounded or capped by the browser for privacy.
      </p>
    </div>
  );
}
