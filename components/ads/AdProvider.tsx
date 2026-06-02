"use client";

import Script from "next/script";
import { adsConfig } from "@/lib/ads/config";

export function AdProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {adsConfig.enabled && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsConfig.publisherId}`}
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      )}
      {children}
    </>
  );
}
