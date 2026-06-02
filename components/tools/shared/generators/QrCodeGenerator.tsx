"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils/cn";

const labelCls =
  "font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60 mb-1 block";
const inputCls =
  "w-full font-mono text-sm bg-surface-muted border border-border px-3 py-2 text-foreground outline-none focus:border-foreground-muted";
const selectCls =
  "w-full font-mono text-sm bg-surface-muted border border-border px-3 py-2 text-foreground outline-none focus:border-foreground-muted";

const DOT_STYLES = ["square", "rounded", "classy", "classy-rounded", "extra-rounded", "dots"] as const;
const CORNER_SQUARE_STYLES = ["square", "dot", "extra-rounded"] as const;
const CORNER_DOT_STYLES = ["square", "dot"] as const;
type DotStyle = (typeof DOT_STYLES)[number];
type CornerSquareStyle = (typeof CORNER_SQUARE_STYLES)[number];
type CornerDotStyle = (typeof CORNER_DOT_STYLES)[number];
type ErrorLevel = "L" | "M" | "Q" | "H";
type GradientType = "linear" | "radial";

interface PresetConfig {
  id: string;
  label: string;
  swatchA: string;
  swatchB?: string;
  dotStyle: DotStyle;
  dotColor: string;
  useGradient: boolean;
  gradientType: GradientType;
  gradientRotation: number;
  gradientFrom: string;
  gradientTo: string;
  bgColor: string;
  cornerSquareStyle: CornerSquareStyle;
  cornerSquareColor: string;
  cornerDotStyle: CornerDotStyle;
  cornerDotColor: string;
  errorLevel: ErrorLevel;
}

const PRESETS: PresetConfig[] = [
  {
    id: "classic", label: "Classic", swatchA: "#000000",
    dotStyle: "square", dotColor: "#000000", useGradient: false,
    gradientType: "linear", gradientRotation: 0, gradientFrom: "#000000", gradientTo: "#666666",
    bgColor: "#ffffff", cornerSquareStyle: "square", cornerSquareColor: "#000000",
    cornerDotStyle: "square", cornerDotColor: "#000000", errorLevel: "M",
  },
  {
    id: "dots", label: "Dots", swatchA: "#111111",
    dotStyle: "dots", dotColor: "#111111", useGradient: false,
    gradientType: "linear", gradientRotation: 0, gradientFrom: "#111111", gradientTo: "#555555",
    bgColor: "#ffffff", cornerSquareStyle: "dot", cornerSquareColor: "#111111",
    cornerDotStyle: "dot", cornerDotColor: "#111111", errorLevel: "M",
  },
  {
    id: "rounded", label: "Rounded", swatchA: "#1a1a2e",
    dotStyle: "extra-rounded", dotColor: "#1a1a2e", useGradient: false,
    gradientType: "linear", gradientRotation: 0, gradientFrom: "#1a1a2e", gradientTo: "#4a4a8a",
    bgColor: "#ffffff", cornerSquareStyle: "extra-rounded", cornerSquareColor: "#1a1a2e",
    cornerDotStyle: "dot", cornerDotColor: "#1a1a2e", errorLevel: "M",
  },
  {
    id: "ocean", label: "Ocean", swatchA: "#0077b6", swatchB: "#90e0ef",
    dotStyle: "extra-rounded", dotColor: "#0077b6", useGradient: true,
    gradientType: "linear", gradientRotation: 135, gradientFrom: "#0077b6", gradientTo: "#90e0ef",
    bgColor: "#ffffff", cornerSquareStyle: "extra-rounded", cornerSquareColor: "#0077b6",
    cornerDotStyle: "dot", cornerDotColor: "#0077b6", errorLevel: "M",
  },
  {
    id: "sunset", label: "Sunset", swatchA: "#f72585", swatchB: "#ff9e00",
    dotStyle: "dots", dotColor: "#f72585", useGradient: true,
    gradientType: "linear", gradientRotation: 90, gradientFrom: "#f72585", gradientTo: "#ff9e00",
    bgColor: "#fff9f0", cornerSquareStyle: "square", cornerSquareColor: "#f72585",
    cornerDotStyle: "square", cornerDotColor: "#f72585", errorLevel: "M",
  },
  {
    id: "neon", label: "Neon", swatchA: "#39ff14",
    dotStyle: "dots", dotColor: "#39ff14", useGradient: false,
    gradientType: "linear", gradientRotation: 0, gradientFrom: "#39ff14", gradientTo: "#00d4ff",
    bgColor: "#0a0a0a", cornerSquareStyle: "dot", cornerSquareColor: "#39ff14",
    cornerDotStyle: "dot", cornerDotColor: "#39ff14", errorLevel: "M",
  },
];

export function QrCodeGenerator() {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const qrRef = useRef<any>(null);
  const initialized = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState("https://example.com");
  const [size, setSize] = useState("300");
  const [margin, setMargin] = useState("10");
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>("M");

  // Dot options
  const [dotStyle, setDotStyle] = useState<DotStyle>("square");
  const [dotColor, setDotColor] = useState("#000000");
  const [useGradient, setUseGradient] = useState(false);
  const [gradientType, setGradientType] = useState<GradientType>("linear");
  const [gradientRotation, setGradientRotation] = useState("0");
  const [gradientFrom, setGradientFrom] = useState("#000000");
  const [gradientTo, setGradientTo] = useState("#666666");

  // Background
  const [bgColor, setBgColor] = useState("#ffffff");

  // Corners
  const [cornerSquareStyle, setCornerSquareStyle] = useState<CornerSquareStyle>("square");
  const [cornerSquareColor, setCornerSquareColor] = useState("#000000");
  const [cornerDotStyle, setCornerDotStyle] = useState<CornerDotStyle>("square");
  const [cornerDotColor, setCornerDotColor] = useState("#000000");

  // Center image
  const [centerImage, setCenterImage] = useState("");
  const [imageSize, setImageSize] = useState("0.4");
  const [imageMargin, setImageMargin] = useState("5");
  const [hideBackgroundDots, setHideBackgroundDots] = useState(true);

  // Active preset
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const sizeNum = parseInt(size, 10);
  const marginNum = parseInt(margin, 10);

  const sizeErr =
    size === "" ? null
    : isNaN(sizeNum) || sizeNum < 50 ? "Min 50"
    : sizeNum > 2000 ? "Max 2000"
    : null;
  const marginErr =
    margin === "" ? null
    : isNaN(marginNum) || marginNum < 0 ? "Min 0"
    : marginNum > 100 ? "Max 100"
    : null;
  const textErr = text.trim() === "" ? "Content required" : null;
  const imageSizeNum = parseFloat(imageSize);
  const imageMarginNum = parseInt(imageMargin, 10);
  const imageSizeErr =
    imageSize === "" ? null
    : isNaN(imageSizeNum) || imageSizeNum < 0.1 ? "Min 0.1"
    : imageSizeNum > 0.6 ? "Max 0.6"
    : null;
  const imageMarginErr =
    imageMargin === "" ? null
    : isNaN(imageMarginNum) || imageMarginNum < 0 ? "Min 0"
    : imageMarginNum > 20 ? "Max 20"
    : null;

  const applyPreset = useCallback((p: PresetConfig) => {
    setActivePreset(p.id);
    setDotStyle(p.dotStyle);
    setDotColor(p.dotColor);
    setUseGradient(p.useGradient);
    setGradientType(p.gradientType);
    setGradientRotation(String(p.gradientRotation));
    setGradientFrom(p.gradientFrom);
    setGradientTo(p.gradientTo);
    setBgColor(p.bgColor);
    setCornerSquareStyle(p.cornerSquareStyle);
    setCornerSquareColor(p.cornerSquareColor);
    setCornerDotStyle(p.cornerDotStyle);
    setCornerDotColor(p.cornerDotColor);
    setErrorLevel(p.errorLevel);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const validW = !isNaN(sizeNum) && sizeNum >= 50 && sizeNum <= 2000 ? sizeNum : 300;
    const validM = !isNaN(marginNum) && marginNum >= 0 && marginNum <= 100 ? marginNum : 10;
    const validImgSize =
      !isNaN(imageSizeNum) && imageSizeNum >= 0.1 && imageSizeNum <= 0.6 ? imageSizeNum : 0.4;
    const validImgMargin =
      !isNaN(imageMarginNum) && imageMarginNum >= 0 && imageMarginNum <= 20 ? imageMarginNum : 5;
    const rotDeg = parseInt(gradientRotation, 10);
    const validRotation = !isNaN(rotDeg) ? (rotDeg * Math.PI) / 180 : 0;

    const dotsOpts = useGradient
      ? {
          type: dotStyle,
          gradient: {
            type: gradientType,
            rotation: validRotation,
            colorStops: [
              { offset: 0, color: gradientFrom },
              { offset: 1, color: gradientTo },
            ],
          },
        }
      : { type: dotStyle, color: dotColor };

    const opts: Record<string, unknown> = {
      data: text.trim() || " ",
      width: validW,
      height: validW,
      margin: validM,
      qrOptions: { errorCorrectionLevel: errorLevel },
      dotsOptions: dotsOpts,
      backgroundOptions: { color: bgColor },
      cornersSquareOptions: { type: cornerSquareStyle, color: cornerSquareColor },
      cornersDotOptions: { type: cornerDotStyle, color: cornerDotColor },
      image: centerImage,
      imageOptions: { crossOrigin: "anonymous", margin: validImgMargin, imageSize: validImgSize, hideBackgroundDots },
    };

    import("qr-code-styling").then((mod) => {
      if (!containerRef.current) return;
      const QRCodeStyling = mod.default;
      if (!initialized.current) {
        qrRef.current = new QRCodeStyling(opts);
        qrRef.current.append(containerRef.current);
        initialized.current = true;
      } else {
        qrRef.current?.update(opts);
      }
    });
  }, [
    text, size, margin, errorLevel,
    dotStyle, dotColor, useGradient, gradientType, gradientRotation, gradientFrom, gradientTo,
    bgColor, cornerSquareStyle, cornerSquareColor, cornerDotStyle, cornerDotColor,
    centerImage, imageSize, imageMargin, hideBackgroundDots,
    sizeNum, marginNum, imageSizeNum, imageMarginNum,
  ]);

  const download = (ext: "png" | "svg") => {
    qrRef.current?.download({ name: "qrcode", extension: ext });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCenterImage((ev.target?.result as string) ?? "");
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setCenterImage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-5">
      {/* Content */}
      <div>
        <label className={labelCls}>— content (URL, text, email, phone…)</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="https://example.com"
          className={cn(inputCls, textErr && "border-red-400/60 focus:border-red-400")}
        />
        {textErr && <p className="font-mono text-[10px] text-red-500/70 mt-1">{textErr}</p>}
      </div>

      {/* Style Presets */}
      <div>
        <label className={labelCls}>— style presets</label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              className={cn(
                "border overflow-hidden transition-colors",
                activePreset === p.id
                  ? "border-primary"
                  : "border-border hover:border-foreground-muted/50",
              )}
            >
              <div
                className="h-6 w-full"
                style={{
                  background: p.swatchB
                    ? `linear-gradient(135deg, ${p.swatchA}, ${p.swatchB})`
                    : p.swatchA,
                }}
              />
              <span
                className={cn(
                  "block font-mono text-[10px] px-2 py-1.5 text-center",
                  activePreset === p.id
                    ? "text-primary bg-primary/10"
                    : "text-foreground-muted/70 bg-surface",
                )}
              >
                {p.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Size + Margin + Error correction */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>— size px (50–2000)</label>
          <input
            type="number"
            min={50}
            max={2000}
            step={10}
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className={cn(inputCls, sizeErr && "border-red-400/60 focus:border-red-400")}
          />
          {sizeErr && <p className="font-mono text-[10px] text-red-500/70 mt-1">{sizeErr}</p>}
        </div>
        <div>
          <label className={labelCls}>— margin px (0–100)</label>
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={margin}
            onChange={(e) => setMargin(e.target.value)}
            className={cn(inputCls, marginErr && "border-red-400/60 focus:border-red-400")}
          />
          {marginErr && <p className="font-mono text-[10px] text-red-500/70 mt-1">{marginErr}</p>}
        </div>
        <div>
          <label className={labelCls}>— error correction</label>
          <select
            value={errorLevel}
            onChange={(e) => setErrorLevel(e.target.value as ErrorLevel)}
            className={selectCls}
          >
            <option value="L">L — Low (7%)</option>
            <option value="M">M — Medium (15%)</option>
            <option value="Q">Q — Quartile (25%)</option>
            <option value="H">H — High (30%)</option>
          </select>
        </div>
      </div>

      {/* Dot style + fill */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>— dot style</label>
          <select
            value={dotStyle}
            onChange={(e) => setDotStyle(e.target.value as DotStyle)}
            className={selectCls}
          >
            {DOT_STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">
              — dot fill
            </span>
            <button
              onClick={() => setUseGradient((v) => !v)}
              className={cn(
                "font-mono text-[9px] px-2 py-0.5 border transition-colors",
                useGradient
                  ? "border-primary/40 text-primary bg-primary/10"
                  : "border-border text-foreground-muted/60 hover:text-foreground",
              )}
            >
              {useGradient ? "gradient ✓" : "gradient"}
            </button>
          </div>
          {!useGradient ? (
            <div className="flex gap-2">
              <input
                type="color"
                value={dotColor}
                onChange={(e) => setDotColor(e.target.value)}
                className="h-[34px] w-12 cursor-pointer bg-surface-muted border border-border p-0.5"
              />
              <input
                type="text"
                value={dotColor}
                onChange={(e) => setDotColor(e.target.value)}
                className={cn(inputCls, "flex-1")}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <select
                  value={gradientType}
                  onChange={(e) => setGradientType(e.target.value as GradientType)}
                  className={cn(selectCls, "flex-1")}
                >
                  <option value="linear">linear</option>
                  <option value="radial">radial</option>
                </select>
                {gradientType === "linear" && (
                  <input
                    type="number"
                    min={0}
                    max={360}
                    step={15}
                    value={gradientRotation}
                    onChange={(e) => setGradientRotation(e.target.value)}
                    placeholder="°"
                    title="rotation in degrees"
                    className={cn(inputCls, "w-16 flex-none")}
                  />
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={gradientFrom}
                  onChange={(e) => setGradientFrom(e.target.value)}
                  className="h-[30px] w-9 shrink-0 cursor-pointer bg-surface-muted border border-border p-0.5"
                />
                <input
                  type="text"
                  value={gradientFrom}
                  onChange={(e) => setGradientFrom(e.target.value)}
                  className={cn(inputCls, "flex-1 min-w-0")}
                />
                <span className="font-mono text-[9px] text-foreground-muted/40 shrink-0">→</span>
                <input
                  type="color"
                  value={gradientTo}
                  onChange={(e) => setGradientTo(e.target.value)}
                  className="h-[30px] w-9 shrink-0 cursor-pointer bg-surface-muted border border-border p-0.5"
                />
                <input
                  type="text"
                  value={gradientTo}
                  onChange={(e) => setGradientTo(e.target.value)}
                  className={cn(inputCls, "flex-1 min-w-0")}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Corner square style + color */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>— corner square style</label>
          <select
            value={cornerSquareStyle}
            onChange={(e) => setCornerSquareStyle(e.target.value as CornerSquareStyle)}
            className={selectCls}
          >
            {CORNER_SQUARE_STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>— corner square color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={cornerSquareColor}
              onChange={(e) => setCornerSquareColor(e.target.value)}
              className="h-[34px] w-12 cursor-pointer bg-surface-muted border border-border p-0.5"
            />
            <input
              type="text"
              value={cornerSquareColor}
              onChange={(e) => setCornerSquareColor(e.target.value)}
              className={cn(inputCls, "flex-1")}
            />
          </div>
        </div>
      </div>

      {/* Corner dot style + color */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>— corner dot style</label>
          <select
            value={cornerDotStyle}
            onChange={(e) => setCornerDotStyle(e.target.value as CornerDotStyle)}
            className={selectCls}
          >
            {CORNER_DOT_STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>— corner dot color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={cornerDotColor}
              onChange={(e) => setCornerDotColor(e.target.value)}
              className="h-[34px] w-12 cursor-pointer bg-surface-muted border border-border p-0.5"
            />
            <input
              type="text"
              value={cornerDotColor}
              onChange={(e) => setCornerDotColor(e.target.value)}
              className={cn(inputCls, "flex-1")}
            />
          </div>
        </div>
      </div>

      {/* Background color */}
      <div>
        <label className={labelCls}>— background color</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="h-[34px] w-12 cursor-pointer bg-surface-muted border border-border p-0.5"
          />
          <input
            type="text"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className={cn(inputCls, "flex-1")}
          />
        </div>
      </div>

      {/* Center image */}
      <div className="border border-border">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">
            — center image (logo)
          </span>
          {centerImage && (
            <button
              onClick={removeImage}
              className="font-mono text-[10px] text-foreground-muted/60 hover:text-foreground"
            >
              remove
            </button>
          )}
        </div>
        <div className="px-4 py-3 space-y-3">
          {!centerImage ? (
            <label className="flex items-center gap-3 cursor-pointer">
              <span className="font-mono text-[10px] px-3 py-1.5 border border-border text-foreground-muted hover:text-foreground">
                upload image
              </span>
              <span className="font-mono text-[10px] text-foreground-muted/50">PNG, JPG, or SVG</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="sr-only"
              />
            </label>
          ) : (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={centerImage}
                alt="QR code center image preview"
                className="h-10 w-10 object-contain border border-border bg-white"
              />
              <span className="font-mono text-[10px] text-foreground-muted/60">image ready</span>
            </div>
          )}

          {centerImage && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>— image size ratio (0.1–0.6)</label>
                  <input
                    type="number"
                    min={0.1}
                    max={0.6}
                    step={0.05}
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value)}
                    className={cn(inputCls, imageSizeErr && "border-red-400/60 focus:border-red-400")}
                  />
                  {imageSizeErr && (
                    <p className="font-mono text-[10px] text-red-500/70 mt-1">{imageSizeErr}</p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>— image margin px (0–20)</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    step={1}
                    value={imageMargin}
                    onChange={(e) => setImageMargin(e.target.value)}
                    className={cn(
                      inputCls,
                      imageMarginErr && "border-red-400/60 focus:border-red-400",
                    )}
                  />
                  {imageMarginErr && (
                    <p className="font-mono text-[10px] text-red-500/70 mt-1">{imageMarginErr}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setHideBackgroundDots((v) => !v)}
                className={cn(
                  "font-mono text-[10px] px-3 py-1.5 border transition-colors",
                  hideBackgroundDots
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-foreground-muted hover:text-foreground",
                )}
              >
                {hideBackgroundDots ? "✓ " : ""}hide dots behind image
              </button>
              {errorLevel !== "H" && (
                <p className="font-mono text-[10px] text-amber-500/80">
                  Tip: set error correction to H when embedding a logo for better scan reliability.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Preview + Download */}
      <div className="border border-border bg-surface p-6 flex flex-col items-center gap-4">
        <p className={labelCls}>— preview</p>
        <div ref={containerRef} />
        <div className="flex gap-2">
          <button
            onClick={() => download("png")}
            disabled={!!textErr}
            className="font-mono text-[10px] px-4 py-2 border border-border text-foreground-muted hover:text-primary hover:border-primary/40 disabled:opacity-30"
          >
            download PNG
          </button>
          <button
            onClick={() => download("svg")}
            disabled={!!textErr}
            className="font-mono text-[10px] px-4 py-2 border border-border text-foreground-muted hover:text-primary hover:border-primary/40 disabled:opacity-30"
          >
            download SVG
          </button>
        </div>
      </div>
    </div>
  );
}
