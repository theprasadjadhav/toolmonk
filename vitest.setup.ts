import "@testing-library/jest-dom";
import { vi } from "vitest";

// ── Clipboard ─────────────────────────────────────────────────────────────────
// NOTE: userEvent.setup() installs its own virtual clipboard that intercepts
// writeText/readText automatically. We only need a fallback for tests that
// don't use userEvent (e.g., direct component tests without user interactions).
// Use navigator.clipboard.readText() to verify what was copied in assertions.
if (typeof navigator.clipboard === "undefined") {
  const _clipboardData: Record<string, string> = {};
  Object.defineProperty(global.navigator, "clipboard", {
    value: {
      writeText: vi.fn(async (text: string) => { _clipboardData["text/plain"] = text; }),
      readText: vi.fn(async () => _clipboardData["text/plain"] ?? ""),
    },
    writable: true,
    configurable: true,
  });
}

// ── Canvas ────────────────────────────────────────────────────────────────────
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn().mockReturnValue({ data: new Uint8ClampedArray(4) }),
  putImageData: vi.fn(),
  drawImage: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  translate: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  measureText: vi.fn().mockReturnValue({ width: 0 }),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  createLinearGradient: vi.fn().mockReturnValue({
    addColorStop: vi.fn(),
  }),
  createRadialGradient: vi.fn().mockReturnValue({
    addColorStop: vi.fn(),
  }),
  setLineDash: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
});

HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue(
  "data:image/png;base64,AAAA"
);
HTMLCanvasElement.prototype.toBlob = vi.fn((cb) =>
  cb(new Blob(["fake"], { type: "image/png" }))
);

// ── ResizeObserver ─────────────────────────────────────────────────────────────
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// ── IntersectionObserver ──────────────────────────────────────────────────────
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// ── URL.createObjectURL / revokeObjectURL ─────────────────────────────────────
global.URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
global.URL.revokeObjectURL = vi.fn();

// ── matchMedia ────────────────────────────────────────────────────────────────
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ── scrollIntoView ─────────────────────────────────────────────────────────────
Element.prototype.scrollIntoView = vi.fn();

// ── next/navigation mock ──────────────────────────────────────────────────────
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => "/"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useParams: vi.fn(() => ({})),
}));

// ── next/headers mock ─────────────────────────────────────────────────────────
vi.mock("next/headers", () => ({
  headers: vi.fn(() => new Map()),
  cookies: vi.fn(() => ({ get: vi.fn() })),
}));
