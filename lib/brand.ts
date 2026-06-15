/**
 * Central brand configuration.
 *
 * Every place that references the site name, logo, icon, domain, or OG colours
 * imports from here. Changing a value once propagates to Header, Footer,
 * all OG images, and structured-data automatically.
 */

/** Displayed site name */
export const BRAND_NAME = "ToolMonk";

/** Public domain (no protocol) */
export const BRAND_DOMAIN = "toolmonk.net";

/** One-line brand description used in footer copy and schema.org */
export const BRAND_DESCRIPTION =
  "Free online tools for developers, designers, students, and professionals. No signup required.";

/** next/image src for the square logo mark (used in header / footer) */
export const LOGO_PATH = "/logo.svg";

/** next/image src for the app icon (used in schema.org) */
export const ICON_PATH = "/icon.svg";

/**
 * Filename of the logo inside /public — used by OG image routes that read
 * the file with fs.readFileSync at build/request time.
 *
 * Usage: path.join(process.cwd(), "public", LOGO_PUBLIC_FILE)
 */
export const LOGO_PUBLIC_FILE = "logo.svg";

/** Background colour for OG images (matches --surface dark token) */
export const OG_BG = "#0a0a0a";

/** Accent / brand colour used in OG images (domain watermark) */
export const OG_ACCENT = "#e54d2e";
