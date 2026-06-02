import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";
import { CATEGORIES } from "@/lib/tools/registry";

export const runtime = "nodejs";
export const alt = "ToolMonk";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ category: string }>;
}

export default async function Image({ params }: Props) {
  const { category: slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);
  const title = category?.title ?? "Tools";
  const description = category?.description ?? "Free online tools";

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "auto",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={40} height={40} alt="" style={{ borderRadius: "8px" }} />
          <span style={{ color: "#ffffff", fontSize: "24px" }}>ToolMonk</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              color: "#888888",
              fontSize: "20px",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
            }}
          >
            Category
          </div>
          <div
            style={{
              color: "#ffffff",
              fontSize: "60px",
              fontWeight: "700",
              lineHeight: "1.1",
            }}
          >
            {title}
          </div>
          <div style={{ color: "#888888", fontSize: "22px", maxWidth: "900px" }}>
            {description.slice(0, 120)}
          </div>
        </div>
        <div style={{ color: "#e54d2e", fontSize: "20px", marginTop: "48px" }}>
          toolmonk.net
        </div>
      </div>
    ),
    { ...size }
  );
}
