import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";
import { TOOLS, CATEGORIES as CAT_LIST } from "@/lib/tools/registry";
import { BRAND_NAME, BRAND_DOMAIN, OG_ACCENT, LOGO_PUBLIC_FILE } from "@/lib/brand";

export const runtime = "nodejs";
export const alt = `${BRAND_NAME} — Every tool. One place.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const logoSrc = `data:image/svg+xml;base64,${fs.readFileSync(path.join(process.cwd(), "public", LOGO_PUBLIC_FILE)).toString("base64")}`;

  const toolCount = String(TOOLS.filter((t) => !t.aliasOf).length);
  const catCount = String(CAT_LIST.length);

  const STATS = [
    { value: toolCount, label: "tools" },
    { value: catCount, label: "categories" },
    { value: "100%", label: "free" },
    { value: "zero", label: "signup" },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          backgroundColor: "#0a0a0b",
          backgroundImage:
            "radial-gradient(ellipse 900px 700px at 105% 110%, rgba(229,77,46,0.13) 0%, transparent 60%)",
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
        {/* Header: small brand row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={26} height={26} alt="" style={{ borderRadius: "5px", opacity: 0.8 }} />
            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 17, letterSpacing: "0.05em" }}>{BRAND_NAME}</span>
          </div>
          <span style={{ color: "rgba(255,255,255,0.18)", fontSize: 13, letterSpacing: "0.08em" }}>
            {BRAND_DOMAIN}
          </span>
        </div>

        {/* Main row: left content + right logo */}
        <div style={{ display: "flex", alignItems: "center", flex: 1, gap: 60, marginTop: 24 }}>

          {/* ── Left column ── */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>

            {/* Label */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div style={{ width: 24, height: 2, backgroundColor: OG_ACCENT }} />
              <span style={{ color: OG_ACCENT, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.24em" }}>
                free utility suite
              </span>
            </div>

            {/* Title — brand tagline, two lines */}
            <div style={{ display: "flex", flexDirection: "column", marginBottom: 20 }}>
              <span
                style={{
                  color: "#ffffff",
                  fontSize: 70,
                  fontWeight: 700,
                  lineHeight: 1.0,
                  letterSpacing: "-0.03em",
                }}
              >
                Every tool.
              </span>
              <span
                style={{
                  color: OG_ACCENT,
                  fontSize: 70,
                  fontWeight: 700,
                  lineHeight: 1.08,
                  letterSpacing: "-0.03em",
                }}
              >
                One place.
              </span>
            </div>

            {/* Description — who it's for, not a repeat of the stats */}
            <div
              style={{
                color: "#505062",
                fontSize: 17,
                lineHeight: 1.6,
                maxWidth: 560,
                marginBottom: 28,
              }}
            >
              For developers, designers, students &amp; professionals — calculators, converters, dev tools, PDF tools, generators &amp; more.
            </div>

            {/* Stats row — single source of key metrics */}
            <div style={{ display: "flex", gap: 1 }}>
              {STATS.map((s) => (
                <div
                  key={s.label}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    padding: "11px 16px",
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: "rgba(255,255,255,0.07)",
                    gap: 5,
                  }}
                >
                  <span style={{ color: "#d8d8e8", fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em" }}>
                    {s.value}
                  </span>
                  <span style={{ color: "#383848", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.16em" }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right column: big logo card ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              width: 196,
              height: 196,
              borderRadius: 28,
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: "rgba(229,77,46,0.25)",
              backgroundColor: "rgba(229,77,46,0.07)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={128} height={128} alt="" />
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20 }}>
          <span style={{ color: OG_ACCENT, fontSize: 15, letterSpacing: "0.05em" }}>{BRAND_DOMAIN}</span>
          <span style={{ color: "rgba(255,255,255,0.13)", fontSize: 15 }}>—</span>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13, letterSpacing: "0.04em" }}>
            no signup · no installs · open to everyone
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
