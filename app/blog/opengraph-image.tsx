import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";
import { BRAND_NAME, BRAND_DOMAIN, OG_BG, OG_ACCENT, LOGO_PUBLIC_FILE } from "@/lib/brand";

export const runtime = "nodejs";
export const alt = `Blog & Resources — ${BRAND_NAME}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const logoSrc = `data:image/png;base64,${fs.readFileSync(path.join(process.cwd(), "public", LOGO_PUBLIC_FILE)).toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          background: OG_BG,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "60px 80px",
          fontFamily: "monospace",
        }}
      >
        {/* Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "auto",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={44} height={44} alt="" style={{ borderRadius: "8px" }} />
          <span style={{ color: "#ffffff", fontSize: "28px" }}>{BRAND_NAME}</span>
        </div>
        {/* Main */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              color: "#ffffff",
              fontSize: "64px",
              fontWeight: "700",
              lineHeight: "1.1",
            }}
          >
            Blog &amp; Resources
          </div>
          <div style={{ color: "#888888", fontSize: "24px" }}>
            Guides, explainers, and tutorials behind the tools
          </div>
        </div>
        {/* Domain */}
        <div style={{ color: OG_ACCENT, fontSize: "20px", marginTop: "48px" }}>
          {BRAND_DOMAIN}
        </div>
      </div>
    ),
    { ...size }
  );
}
