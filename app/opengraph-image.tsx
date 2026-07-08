import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";
import { BRAND_NAME, BRAND_DOMAIN, OG_ACCENT, LOGO_PUBLIC_FILE } from "@/lib/brand";

export const runtime = "nodejs";
export const alt = `${BRAND_NAME} — 180+ utility tools at one place.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function hexRgba(hex: string, a: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

const FEATURES = [
  { color: "#2A8F8A", label: "Runs in Browser" },
  { color: OG_ACCENT,  label: "Zero Signup"     },
  { color: "#3E9B72",  label: "100% Free"        },
  { color: "#4A7FB5",  label: "13 Categories"    },
  { color: "#7A5EA8",  label: "180+ Tools"       },
];

export default function Image() {
  const logoSrc = `data:image/svg+xml;base64,${fs.readFileSync(path.join(process.cwd(), "public", LOGO_PUBLIC_FILE)).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          backgroundColor: "#0a0a0b",
          backgroundImage:
            "radial-gradient(ellipse 900px 700px at 105% 110%, rgba(229,77,46,0.12) 0%, transparent 60%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "40px 68px 40px",
          fontFamily: "monospace",
          borderTopWidth: 3,
          borderTopStyle: "solid",
          borderTopColor: OG_ACCENT,
        }}
      >
        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={24} height={24} alt="" style={{ borderRadius: "5px", opacity: 0.75 }} />
            <span style={{ color: "rgba(255,255,255,0.38)", fontSize: 16, letterSpacing: "0.06em" }}>
              {BRAND_NAME}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: OG_ACCENT }} />
            <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 13, letterSpacing: "0.08em" }}>
              {BRAND_DOMAIN}
            </span>
          </div>
        </div>

        {/* ── Middle: left content + right logo ── */}
        <div style={{ display: "flex", alignItems: "center", flex: 1, gap: 52, marginTop: 20 }}>

          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>

            {/* Label */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div style={{ width: 20, height: 2, backgroundColor: OG_ACCENT }} />
              <span style={{ color: hexRgba(OG_ACCENT, 0.7), fontSize: 11, textTransform: "uppercase", letterSpacing: "0.26em" }}>
                free utility suite
              </span>
            </div>

            {/* Title */}
            <div style={{ display: "flex", flexDirection: "column", marginBottom: 20 }}>
              <span style={{ color: "#f0f0f8", fontSize: 70, fontWeight: 700, lineHeight: 1.0, letterSpacing: "-0.03em" }}>
                180+ utility tools
              </span>
              <span style={{ color: "#d63b37", fontSize: 70, fontWeight: 700, lineHeight: 1.06, letterSpacing: "-0.03em" }}>
                at one place.
              </span>
            </div>

            {/* Description */}
            <div style={{ color: "#404052", fontSize: 16, lineHeight: 1.55, maxWidth: 540, marginBottom: 32 }}>
              For developers, designers, students &amp; professionals — calculators, converters, dev tools, PDF tools, generators &amp; more.
            </div>

            {/* Feature chips — app theme: uppercase, mono, sharp, color-coded */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {FEATURES.map((f) => (
                <div
                  key={f.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "7px 14px",
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: hexRgba(f.color, 0.28),
                    backgroundColor: hexRgba(f.color, 0.07),
                  }}
                >
                  <div style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: f.color, flexShrink: 0 }} />
                  <span style={{ color: hexRgba(f.color, 0.85), fontSize: 11, textTransform: "uppercase", letterSpacing: "0.16em" }}>
                    {f.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: logo card */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              width: 200,
              height: 200,
              borderRadius: 24,
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: hexRgba(OG_ACCENT, 0.22),
              backgroundColor: hexRgba(OG_ACCENT, 0.07),
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={128} height={128} alt="" />
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20 }}>
          <span style={{ color: OG_ACCENT, fontSize: 14, letterSpacing: "0.06em" }}>{BRAND_DOMAIN}</span>
          <span style={{ color: "rgba(255,255,255,0.12)", fontSize: 14 }}>—</span>
          <span style={{ color: "rgba(255,255,255,0.18)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em" }}>
            no signup · no installs · open to everyone
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
