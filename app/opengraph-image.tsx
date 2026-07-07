import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";
import { TOOLS } from "@/lib/tools/registry";
import { BRAND_NAME, BRAND_DOMAIN, OG_ACCENT, LOGO_PUBLIC_FILE } from "@/lib/brand";

export const runtime = "nodejs";
export const alt = `${BRAND_NAME} — Every tool. One place.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function hexRgba(hex: string, a: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export default function Image() {
  const logoSrc = `data:image/svg+xml;base64,${fs.readFileSync(path.join(process.cwd(), "public", LOGO_PUBLIC_FILE)).toString("base64")}`;
  const toolCount = TOOLS.filter((t) => !t.aliasOf).length;

  // Three key features — the actual unique value props of the app
  const FEATURES = [
    {
      color: "#2A8F8A",
      title: "Runs in Your Browser",
      desc: "Every tool is client-side only. Your data never leaves your device — no server, no storage.",
    },
    {
      color: OG_ACCENT,
      title: "Zero Signup Ever",
      desc: "No account, no email, no registration. Open any of the " + String(toolCount) + "+ tools and use it instantly.",
    },
    {
      color: "#3E9B72",
      title: "Completely Free",
      desc: "No plan, no trial, no paywall. Every tool is free — today, tomorrow, always.",
    },
  ];

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
          padding: "40px 68px 36px",
          fontFamily: "monospace",
          borderTopWidth: 3,
          borderTopStyle: "solid",
          borderTopColor: OG_ACCENT,
        }}
      >
        {/* ── Header ──────────────────────────────────────────────── */}
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

        {/* ── Middle: tagline + logo ───────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            gap: 48,
            marginTop: 18,
            marginBottom: 20,
          }}
        >
          {/* Left: label + title + description */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            {/* Label */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 20, height: 2, backgroundColor: OG_ACCENT }} />
              <span
                style={{
                  color: hexRgba(OG_ACCENT, 0.75),
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.26em",
                }}
              >
                free utility suite
              </span>
            </div>

            {/* Title — brand tagline */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  color: "#f0f0f8",
                  fontSize: 74,
                  fontWeight: 700,
                  lineHeight: 1.0,
                  letterSpacing: "-0.035em",
                }}
              >
                Every tool.
              </span>
              <span
                style={{
                  color: OG_ACCENT,
                  fontSize: 74,
                  fontWeight: 700,
                  lineHeight: 1.05,
                  letterSpacing: "-0.035em",
                }}
              >
                One place.
              </span>
            </div>

            {/* What it covers */}
            <div
              style={{
                color: "#424255",
                fontSize: 16,
                lineHeight: 1.55,
                marginTop: 18,
                maxWidth: 540,
              }}
            >
              Calculators, converters, dev tools, PDF tools, generators, compilers &amp; more — for developers, designers, students &amp; everyone.
            </div>
          </div>

          {/* Right: logo card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              width: 188,
              height: 188,
              borderRadius: 26,
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: hexRgba(OG_ACCENT, 0.22),
              backgroundColor: hexRgba(OG_ACCENT, 0.07),
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={122} height={122} alt="" />
          </div>
        </div>

        {/* ── Feature cards row ────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 10 }}>
          {FEATURES.map((f) => (
            <div
              key={f.title}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                padding: "14px 16px",
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: hexRgba(f.color, 0.18),
                borderRadius: 6,
                backgroundColor: hexRgba(f.color, 0.05),
                gap: 7,
              }}
            >
              {/* Feature title row: dot + label */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    backgroundColor: f.color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    color: "#c8c8d8",
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: "0.01em",
                  }}
                >
                  {f.title}
                </span>
              </div>
              {/* Description */}
              <span style={{ color: "#36364a", fontSize: 12, lineHeight: 1.45 }}>
                {f.desc}
              </span>
            </div>
          ))}
        </div>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
          <span style={{ color: OG_ACCENT, fontSize: 14, letterSpacing: "0.05em" }}>
            {BRAND_DOMAIN}
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
