/** Hex string (#rrggbb or rrggbb) → [r, g, b] or null */
export const hexToRgb = (hex: string): [number, number, number] | null => {
  const m = hex.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
};

/** [r, g, b] → #rrggbb */
export const rgbToHex = (r: number, g: number, b: number): string =>
  "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");

/** [r, g, b] → [h(0-360), s(0-100), l(0-100)] */
export const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};
