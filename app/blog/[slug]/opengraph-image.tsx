import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";
import { getArticle } from "@/lib/blog/articles";
import { BRAND_NAME, BRAND_DOMAIN, OG_BG, OG_ACCENT, LOGO_PUBLIC_FILE } from "@/lib/brand";

export const runtime = "nodejs";
export const alt = `${BRAND_NAME} Blog`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);

  const title = article?.title ?? slug;
  const description = article?.description ?? "";
  const label = article?.category ?? "blog";

  const logoSrc = `data:image/svg+xml;base64,${fs.readFileSync(path.join(process.cwd(), "public", LOGO_PUBLIC_FILE)).toString("base64")}`;
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={40} height={40} alt="" style={{ borderRadius: "8px" }} />
            <span style={{ color: "#ffffff", fontSize: "24px" }}>{BRAND_NAME}</span>
          </div>
          <span
            style={{
              color: "#888888",
              fontSize: "18px",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
            }}
          >
            {label}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              color: "#ffffff",
              fontSize: "52px",
              fontWeight: "700",
              lineHeight: "1.15",
            }}
          >
            {title.slice(0, 80)}
          </div>
          <div style={{ color: "#888888", fontSize: "22px", maxWidth: "900px" }}>
            {description.slice(0, 120)}
          </div>
        </div>
        <div style={{ color: OG_ACCENT, fontSize: "20px", marginTop: "48px" }}>
          {BRAND_DOMAIN}
        </div>
      </div>
    ),
    { ...size }
  );
}
