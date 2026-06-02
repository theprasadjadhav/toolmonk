export const analyticsConfig = {
  measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "",
  enabled:
    process.env.NODE_ENV === "production" &&
    Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID),
} as const;
