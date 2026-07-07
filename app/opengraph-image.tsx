import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";
import { BRAND_NAME, BRAND_DOMAIN, OG_ACCENT, LOGO_PUBLIC_FILE } from "@/lib/brand";

export const runtime = "nodejs";
export const alt = `${BRAND_NAME} — Free Online Tools`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const HIGHLIGHTS = [
  { label: "185+ Tools", sub: "free utilities" },
  { label: "No Signup", sub: "open & instant" },
  { label: "Browser-Based", sub: "no installs" },
  { label: "12 Categories", sub: "everything you need" },
];

const CATEGORIES = ["PDF Tools", "Dev Tools", "Converters", "Calculators", "Generators", "Compilers"];

export default function Image() {
  const logoSrc = `data:image/svg+xml;base64,${fs.readFileSync(path.join(process.cwd(), "public", LOGO_PUBLIC_FILE)).toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          backgroundColor: "#0a0a0b",
          backgroundImage:
            "radial-gradient(ellipse 900px 700px at 105% 110%, rgba(229,77,46,0.14) 0%, transparent 60%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "44px 72px 44px",
          fontFamily: "monospace",
          borderTopWidth: 3,
          borderTopStyle: "solid",
          borderTopColor: OG_ACCENT,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={30} height={30} alt="" style={{ borderRadius: "6px", opacity: 0.9 }} />
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 18, letterSpacing: "0.04em" }}>{BRAND_NAME}</span>
          </div>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 14, letterSpacing: "0.06em" }}>{BRAND_DOMAIN}</span>
        </div>

        {/* Main row */}
        <div style={{ display: "flex", alignItems: "center", flex: 1, gap: 64, marginTop: 28 }}>

          {/* ── Left: content ── */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>

            {/* Label */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 28, height: 2, backgroundColor: OG_ACCENT }} />
              <span style={{ color: OG_ACCENT, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.22em" }}>
                free online toolkit
              </span>
            </div>

            {/* Title */}
            <div
              style={{
                color: "#ffffff",
                fontSize: 58,
                fontWeight: 700,
                lineHeight: 1.06,
                letterSpacing: "-0.02em",
                maxWidth: 640,
                marginBottom: 14,
              }}
            >
              200+ Free Online Tools
            </div>

            {/* Description */}
            <div
              style={{
                color: "#5c5c70",
                fontSize: 17,
                lineHeight: 1.55,
                maxWidth: 580,
                marginBottom: 30,
              }}
            >
              PDF tools, dev utilities, calculators, converters, generators &amp; more — all free, no signup, runs entirely in your browser.
            </div>

            {/* Highlight chips */}
            <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
              {HIGHLIGHTS.map((h) => (
                <div
                  key={h.label}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "9px 14px",
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: "rgba(255,255,255,0.09)",
                    borderRadius: 6,
                    backgroundColor: "rgba(255,255,255,0.03)",
                    gap: 3,
                  }}
                >
                  <span style={{ color: "#e8e8f0", fontSize: 13, fontWeight: 600, letterSpacing: "0.01em" }}>
                    {h.label}
                  </span>
                  <span style={{ color: "#444458", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {h.sub}
                  </span>
                </div>
              ))}
            </div>

            {/* Category tags */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {CATEGORIES.map((cat) => (
                <div
                  key={cat}
                  style={{
                    display: "flex",
                    padding: "4px 10px",
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: "rgba(229,77,46,0.18)",
                    borderRadius: 3,
                    backgroundColor: "rgba(229,77,46,0.05)",
                    color: "rgba(229,77,46,0.6)",
                    fontSize: 11,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  {cat}
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: big logo card ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              width: 210,
              height: 210,
              borderRadius: 28,
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: "rgba(229,77,46,0.25)",
              backgroundColor: "rgba(229,77,46,0.07)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={138} height={138} alt="" />
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 24 }}>
          <span style={{ color: OG_ACCENT, fontSize: 16, letterSpacing: "0.05em" }}>{BRAND_DOMAIN}</span>
          <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 16 }}>—</span>
          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 14, letterSpacing: "0.04em" }}>
            no signup required · works in your browser
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
