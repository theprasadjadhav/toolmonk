export const adsConfig = {
  publisherId: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ?? "",
  enabled: Boolean(process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID),
  slots: {
    topBanner: process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP_BANNER ?? "",
    sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR ?? "",
    inContent: process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT ?? "",
    footer: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER ?? "",
  },
} as const;

export type AdPlacement = "top-banner" | "sidebar" | "in-content" | "footer";
