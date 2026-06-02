"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

const labelCls =
  "font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60 mb-1 block";
const inputCls =
  "w-full font-mono text-sm bg-surface-muted border border-border px-3 py-2 text-foreground outline-none focus:border-foreground-muted";
const selectCls =
  "w-full font-mono text-sm bg-surface-muted border border-border px-3 py-2 text-foreground outline-none focus:border-foreground-muted";
const errCls = "font-mono text-[10px] text-red-500/70 mt-1";

const FORMATS = [
  { value: "CODE128", label: "Code 128 — alphanumeric", placeholder: "Hello World 123" },
  { value: "CODE39", label: "Code 39 — uppercase + digits", placeholder: "HELLO 123" },
  { value: "EAN13", label: "EAN-13 — 12 digits (check auto-added)", placeholder: "012345678901" },
  { value: "EAN8", label: "EAN-8 — 7 digits (check auto-added)", placeholder: "0123456" },
  { value: "UPC", label: "UPC-A — 11 digits (check auto-added)", placeholder: "01234567890" },
  { value: "ITF14", label: "ITF-14 — 13 digits", placeholder: "0123456789012" },
  { value: "MSI", label: "MSI — digits only", placeholder: "123456" },
  { value: "pharmacode", label: "Pharmacode — 3 to 131103", placeholder: "12345" },
];

export function BarcodeGenerator() {
  const svgRef = useRef<SVGSVGElement>(null);

  const [value, setValue] = useState("Hello World 123");
  const [format, setFormat] = useState("CODE128");
  const [barWidth, setBarWidth] = useState("2");
  const [height, setHeight] = useState("100");
  const [displayValue, setDisplayValue] = useState(true);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColorVal, setBgColorVal] = useState("#ffffff");
  const [renderError, setRenderError] = useState<string | null>(null);

  const widthNum = parseFloat(barWidth);
  const heightNum = parseFloat(height);

  const widthErr =
    barWidth === "" ? null
    : isNaN(widthNum) || widthNum < 1 ? "Min 1"
    : widthNum > 10 ? "Max 10"
    : null;
  const heightErr =
    height === "" ? null
    : isNaN(heightNum) || heightNum < 10 ? "Min 10"
    : heightNum > 500 ? "Max 500"
    : null;
  const valueErr = value.trim() === "" ? "Value required" : null;

  useEffect(() => {
    if (!svgRef.current || valueErr) {
      setRenderError(null);
      return;
    }
    const validW = !isNaN(widthNum) && widthNum >= 1 && widthNum <= 10 ? widthNum : 2;
    const validH = !isNaN(heightNum) && heightNum >= 10 && heightNum <= 500 ? heightNum : 100;

    import("jsbarcode").then((mod) => {
      const JsBarcode = mod.default;
      try {
        JsBarcode(svgRef.current, value, {
          format,
          width: validW,
          height: validH,
          displayValue,
          lineColor: fgColor,
          background: bgColorVal,
          margin: 10,
        });
        setRenderError(null);
      } catch (e: unknown) {
        setRenderError(e instanceof Error ? e.message : "Invalid value for selected format");
      }
    });
  }, [value, format, barWidth, height, displayValue, fgColor, bgColorVal, widthNum, heightNum, valueErr]);

  const downloadSvg = () => {
    if (!svgRef.current) return;
    const xml = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([xml], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "barcode.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentFormat = FORMATS.find((f) => f.value === format)!;

  return (
    <div className="space-y-5">
      {/* Format */}
      <div>
        <label className={labelCls}>— barcode format</label>
        <select
          value={format}
          onChange={(e) => {
            const fmt = e.target.value;
            setFormat(fmt);
            const placeholder = FORMATS.find((f) => f.value === fmt)?.placeholder ?? "";
            setValue(placeholder);
          }}
          className={selectCls}
        >
          {FORMATS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Value */}
      <div>
        <label className={labelCls}>— value</label>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={currentFormat.placeholder}
          className={cn(
            inputCls,
            (valueErr || renderError) && "border-red-400/60 focus:border-red-400",
          )}
        />
        {valueErr && <p className={errCls}>{valueErr}</p>}
        {renderError && !valueErr && <p className={errCls}>{renderError}</p>}
      </div>

      {/* Width + Height */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>— bar width (1–10)</label>
          <input
            type="number"
            min={1}
            max={10}
            step={0.5}
            value={barWidth}
            onChange={(e) => setBarWidth(e.target.value)}
            className={cn(inputCls, widthErr && "border-red-400/60 focus:border-red-400")}
          />
          {widthErr && <p className={errCls}>{widthErr}</p>}
        </div>
        <div>
          <label className={labelCls}>— height px (10–500)</label>
          <input
            type="number"
            min={10}
            max={500}
            step={5}
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className={cn(inputCls, heightErr && "border-red-400/60 focus:border-red-400")}
          />
          {heightErr && <p className={errCls}>{heightErr}</p>}
        </div>
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>— bar color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={fgColor}
              onChange={(e) => setFgColor(e.target.value)}
              className="h-[34px] w-12 cursor-pointer bg-surface-muted border border-border p-0.5"
            />
            <input
              type="text"
              value={fgColor}
              onChange={(e) => setFgColor(e.target.value)}
              className={cn(inputCls, "flex-1")}
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>— background color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={bgColorVal}
              onChange={(e) => setBgColorVal(e.target.value)}
              className="h-[34px] w-12 cursor-pointer bg-surface-muted border border-border p-0.5"
            />
            <input
              type="text"
              value={bgColorVal}
              onChange={(e) => setBgColorVal(e.target.value)}
              className={cn(inputCls, "flex-1")}
            />
          </div>
        </div>
      </div>

      {/* Show value toggle */}
      <div>
        <button
          onClick={() => setDisplayValue((v) => !v)}
          className={cn(
            "font-mono text-[10px] px-3 py-1.5 border transition-colors",
            displayValue
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border text-foreground-muted hover:text-foreground",
          )}
        >
          {displayValue ? "✓ " : ""}show text below barcode
        </button>
      </div>

      {/* Preview */}
      <div className="border border-border bg-surface p-6 flex flex-col items-center gap-4 overflow-x-auto">
        <p className={labelCls}>— preview</p>
        <svg ref={svgRef} />
        <button
          onClick={downloadSvg}
          disabled={!!valueErr || !!renderError}
          className="font-mono text-[10px] px-4 py-2 border border-border text-foreground-muted hover:text-foreground disabled:opacity-30"
        >
          download SVG
        </button>
      </div>
    </div>
  );
}
