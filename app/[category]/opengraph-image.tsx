import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";
import { CATEGORIES, TOOLS } from "@/lib/tools/registry";
import { BRAND_NAME, BRAND_DOMAIN, OG_ACCENT, LOGO_PUBLIC_FILE } from "@/lib/brand";

export const runtime = "nodejs";
export const alt = BRAND_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ category: string }>;
}

function hexRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default async function Image({ params }: Props) {
  const { category: slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);
  const toolCount = TOOLS.filter((t) => t.category === slug && !t.aliasOf).length;
  const title = category?.title ?? "Tools";
  const description = category?.description ?? "";
  const color = category?.color ?? OG_ACCENT;

  const logoSrc = `data:image/svg+xml;base64,${fs.readFileSync(path.join(process.cwd(), "public", LOGO_PUBLIC_FILE)).toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          backgroundColor: "#0a0a0b",
          backgroundImage: `radial-gradient(ellipse 800px 600px at 110% 115%, ${hexRgba(color, 0.14)} 0%, transparent 65%)`,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "52px 80px 48px",
          fontFamily: "monospace",
          borderTopWidth: 3,
          borderTopStyle: "solid",
          borderTopColor: color,
        }}
      >
        {/* Brand header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={38} height={38} alt="" style={{ borderRadius: "8px" }} />
            <span style={{ color: "#ffffff", fontSize: 22, letterSpacing: "0.02em" }}>{BRAND_NAME}</span>
          </div>
          {/* Category badge */}
          <div
            style={{
              padding: "6px 16px",
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: hexRgba(color, 0.4),
              borderRadius: 4,
              backgroundColor: hexRgba(color, 0.1),
              color: color,
              fontSize: 13,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
            }}
          >
            category
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Main row: content + decorative count */}
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          {/* Left content */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 3, height: 16, backgroundColor: color, borderRadius: 2 }} />
              <span style={{ color: color, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.18em" }}>
                {title}
              </span>
            </div>
            <div
              style={{
                color: "#ffffff",
                fontSize: 62,
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                maxWidth: 700,
              }}
            >
              {title}
            </div>
            <div style={{ color: "#6b6b80", fontSize: 20, maxWidth: 680 }}>
              {description.slice(0, 115)}
            </div>
          </div>

          {/* Right: decorative tool count */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              justifyContent: "flex-end",
              marginLeft: 32,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontSize: 148,
                fontWeight: 800,
                color: hexRgba(color, 0.07),
                lineHeight: 1,
                letterSpacing: "-0.04em",
              }}
            >
              {String(toolCount)}
            </div>
            <div
              style={{
                color: color,
                fontSize: 13,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                marginTop: -8,
              }}
            >
              tools
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 44 }}>
          <span style={{ color: OG_ACCENT, fontSize: 17, letterSpacing: "0.04em" }}>{BRAND_DOMAIN}</span>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 17 }}>—</span>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 16 }}>no signup required</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
