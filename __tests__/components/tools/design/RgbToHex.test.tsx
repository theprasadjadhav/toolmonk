import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RgbToHex } from "@/components/tools/design/RgbToHex";

describe("RgbToHex", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  it("renders four channel sliders (R, G, B, A)", () => {
    render(<RgbToHex />);
    const sliders = screen.getAllByRole("slider");
    expect(sliders).toHaveLength(4);
  });

  it("renders four channel number inputs", () => {
    render(<RgbToHex />);
    const spinners = screen.getAllByRole("spinbutton");
    expect(spinners).toHaveLength(4);
  });

  it("renders HEX, HEX+A, RGB, RGBA, HSL output rows", () => {
    render(<RgbToHex />);
    expect(screen.getByText("HEX")).toBeInTheDocument();
    expect(screen.getByText("HEX+A")).toBeInTheDocument();
    expect(screen.getByText("RGB")).toBeInTheDocument();
    expect(screen.getByText("RGBA")).toBeInTheDocument();
    expect(screen.getByText("HSL")).toBeInTheDocument();
  });

  it("renders the color preview div (swatch with inline background style)", () => {
    const { container } = render(<RgbToHex />);
    // The swatch div has an inline style with backgroundColor
    const swatch = container.querySelector('[style*="background-color"]');
    expect(swatch).toBeInTheDocument();
  });

  // ── Color conversion — default state ─────────────────────────────────────

  it("shows initial HEX #3B82F6 (default R=59, G=130, B=246)", () => {
    render(<RgbToHex />);
    // The HEX output row value is uppercase
    expect(screen.getByText("#3B82F6")).toBeInTheDocument();
  });

  it("shows initial RGB string rgb(59, 130, 246)", () => {
    render(<RgbToHex />);
    expect(screen.getByText("rgb(59, 130, 246)")).toBeInTheDocument();
  });

  // ── Color conversion — slider interaction ─────────────────────────────────

  it("converts R=255, G=0, B=0 → #FF0000", () => {
    render(<RgbToHex />);
    const sliders = screen.getAllByRole("slider");
    // R is index 0, G is index 1, B is index 2
    fireEvent.change(sliders[0], { target: { value: "255" } });
    fireEvent.change(sliders[1], { target: { value: "0" } });
    fireEvent.change(sliders[2], { target: { value: "0" } });
    expect(screen.getByText("#FF0000")).toBeInTheDocument();
  });

  it("converts R=0, G=0, B=0 → #000000", () => {
    render(<RgbToHex />);
    const sliders = screen.getAllByRole("slider");
    fireEvent.change(sliders[0], { target: { value: "0" } });
    fireEvent.change(sliders[1], { target: { value: "0" } });
    fireEvent.change(sliders[2], { target: { value: "0" } });
    expect(screen.getByText("#000000")).toBeInTheDocument();
  });

  it("converts R=255, G=255, B=255 → #FFFFFF", () => {
    render(<RgbToHex />);
    const sliders = screen.getAllByRole("slider");
    fireEvent.change(sliders[0], { target: { value: "255" } });
    fireEvent.change(sliders[1], { target: { value: "255" } });
    fireEvent.change(sliders[2], { target: { value: "255" } });
    expect(screen.getByText("#FFFFFF")).toBeInTheDocument();
  });

  // ── Color conversion — number input interaction ───────────────────────────

  it("updates HEX output when typing into number inputs", () => {
    render(<RgbToHex />);
    const spinners = screen.getAllByRole("spinbutton");
    fireEvent.change(spinners[0], { target: { value: "255" } });
    fireEvent.change(spinners[1], { target: { value: "0" } });
    fireEvent.change(spinners[2], { target: { value: "0" } });
    expect(screen.getByText("#FF0000")).toBeInTheDocument();
  });

  // ── Boundary / edge cases ────────────────────────────────────────────────

  it("clamps R channel to 255 when slider is at max", () => {
    render(<RgbToHex />);
    const sliders = screen.getAllByRole("slider");
    fireEvent.change(sliders[0], { target: { value: "255" } });
    // Slider max is 255 — should stay 255
    expect(sliders[0]).toHaveValue("255");
  });

  it("clamps A channel to 100 at max", () => {
    render(<RgbToHex />);
    const sliders = screen.getAllByRole("slider");
    // A channel is index 3, max 100
    fireEvent.change(sliders[3], { target: { value: "100" } });
    expect(sliders[3]).toHaveValue("100");
  });

  it("zero alpha produces transparent preview (alpha css = 0.00)", () => {
    render(<RgbToHex />);
    const sliders = screen.getAllByRole("slider");
    fireEvent.change(sliders[3], { target: { value: "0" } });
    // RGBA output should show alpha 0.00
    expect(screen.getByText(/0\.00/)).toBeInTheDocument();
  });

  it("produces HSL output for red (#FF0000 → hsl(0, 100%, 50%))", () => {
    render(<RgbToHex />);
    const sliders = screen.getAllByRole("slider");
    fireEvent.change(sliders[0], { target: { value: "255" } });
    fireEvent.change(sliders[1], { target: { value: "0" } });
    fireEvent.change(sliders[2], { target: { value: "0" } });
    expect(screen.getByText("hsl(0, 100%, 50%)")).toBeInTheDocument();
  });

  // ── Copy behavior ─────────────────────────────────────────────────────────

  it("copies HEX value to clipboard when its copy button is clicked", async () => {
    const user = userEvent.setup();
    const writeSpy = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    render(<RgbToHex />);
    // Set to a known color first
    const sliders = screen.getAllByRole("slider");
    fireEvent.change(sliders[0], { target: { value: "255" } });
    fireEvent.change(sliders[1], { target: { value: "0" } });
    fireEvent.change(sliders[2], { target: { value: "0" } });

    const copyButtons = screen.getAllByRole("button", { name: /copy/i });
    await user.click(copyButtons[0]);
    expect(writeSpy).toHaveBeenCalledWith("#FF0000");
  });

  it("copies RGB string to clipboard when its copy button is clicked", async () => {
    const user = userEvent.setup();
    const writeSpy = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    render(<RgbToHex />);
    const sliders = screen.getAllByRole("slider");
    fireEvent.change(sliders[0], { target: { value: "255" } });
    fireEvent.change(sliders[1], { target: { value: "0" } });
    fireEvent.change(sliders[2], { target: { value: "0" } });

    // RGB is the 3rd output row (HEX, HEX+A, RGB...)
    const copyButtons = screen.getAllByRole("button", { name: /copy/i });
    await user.click(copyButtons[2]);
    expect(writeSpy).toHaveBeenCalledWith("rgb(255, 0, 0)");
  });

  // ── Accessibility ─────────────────────────────────────────────────────────

  it("R, G, B, A channel labels are visible", () => {
    render(<RgbToHex />);
    expect(screen.getByText("R")).toBeInTheDocument();
    expect(screen.getByText("G")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
  });
});
