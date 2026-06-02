"use client";

import { useEffect, useRef } from "react";
import { adsConfig } from "@/lib/ads/config";
import type { AdPlacement } from "@/lib/ads/config";
import { cn } from "@/lib/utils/cn";

interface AdSlotProps {
  placement: AdPlacement;
  className?: string;
}

const slotMap: Record<AdPlacement, keyof typeof adsConfig.slots> = {
  "top-banner": "topBanner",
  sidebar: "sidebar",
  "in-content": "inContent",
  footer: "footer",
};

export function AdSlot({ placement, className }: AdSlotProps) {
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!adsConfig.enabled) return;
    try {
      const adsbygoogle = (window as unknown as { adsbygoogle: unknown[] })
        .adsbygoogle;
      if (Array.isArray(adsbygoogle)) {
        adsbygoogle.push({});
      }
    } catch {
      // AdSense not loaded yet
    }
  }, []);

  if (!adsConfig.enabled || !adsConfig.slots[slotMap[placement]]) {
    return null;
  }

  return (
    <div
      className={cn("overflow-hidden", className)}
      aria-label="Advertisement"
      role="complementary"
    >
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adsConfig.publisherId}
        data-ad-slot={adsConfig.slots[slotMap[placement]]}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
