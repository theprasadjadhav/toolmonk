import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";
import { BRAND_NAME, BRAND_DOMAIN, OG_ACCENT, LOGO_PUBLIC_FILE } from "@/lib/brand";

export const runtime = "nodejs";
export const alt = `Blog & Resources — ${BRAND_NAME}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const logoSrc = `data:image/svg+xml;base64,${fs.readFileSync(path.join(process.cwd(), "public", LOGO_PUBLIC_FILE)).toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          backgroundColor: "#0a0a0b",
          backgroundImage:
            "radial-gradient(ellipse 800px 600px at 110% 115%, rgba(229,77,46,0.11) 0%, transparent 65%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "52px 80px 48px",
          fontFamily: "monospace",
          borderTopWidth: 3,
          borderTopStyle: "solid",
          borderTopColor: OG_ACCENT,
        }}
      >
        {/* Brand header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={38} height={38} alt="" style={{ borderRadius: "8px" }} />
            <span style={{ color: "#ffffff", fontSize: 22, letterSpacing: "0.02em" }}>{BRAND_NAME}</span>
          </div>
          <div
            style={{
              padding: "6px 16px",
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: "rgba(229,77,46,0.35)",
              borderRadius: 4,
              backgroundColor: "rgba(229,77,46,0.08)",
              color: OG_ACCENT,
              fontSize: 13,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
            }}
          >
            blog
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 3, height: 16, backgroundColor: OG_ACCENT, borderRadius: 2 }} />
            <span style={{ color: OG_ACCENT, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.18em" }}>
              resources &amp; guides
            </span>
          </div>
          <div
            style={{
              color: "#ffffff",
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            Blog &amp; Resources
          </div>
          <div style={{ color: "#6b6b80", fontSize: 21 }}>
            Guides, explainers, and tutorials behind the tools
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 44 }}>
          <span style={{ color: OG_ACCENT, fontSize: 17, letterSpacing: "0.04em" }}>{BRAND_DOMAIN}</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
