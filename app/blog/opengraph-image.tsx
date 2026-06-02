import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const alt = "Blog & Resources — ToolMonk";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const logoSrc = `data:image/png;base64,${fs.readFileSync(path.join(process.cwd(), "public", "logo.png")).toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
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
          <span style={{ color: "#ffffff", fontSize: "28px" }}>ToolMonk</span>
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
        <div style={{ color: "#e54d2e", fontSize: "20px", marginTop: "48px" }}>
          toolmonk.net
        </div>
      </div>
    ),
    { ...size }
  );
}
