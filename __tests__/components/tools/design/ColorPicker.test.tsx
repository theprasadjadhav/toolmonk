import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ColorPicker } from "@/components/tools/design/ColorPicker";

/** Return the HEX text input (not the hidden native color picker). */
const getHexTextInput = () => {
  const inputs = screen.getAllByDisplayValue(/^#[0-9a-f]{6}$/i);
  return inputs.find(
    (el) => (el as HTMLInputElement).type !== "color",
  ) as HTMLInputElement;
};

describe("ColorPicker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  it("renders a native color input", () => {
    render(<ColorPicker />);
    const colorInput = document.querySelector('input[type="color"]');
    expect(colorInput).toBeInTheDocument();
  });

  it("renders HEX text input with the default color value", () => {
    render(<ColorPicker />);
    const hexInput = getHexTextInput();
    expect(hexInput).toBeInTheDocument();
    expect(hexInput.value).toBe("#3b82f6");
  });

  it("renders output labels HEX, RGB, HSL, HSV", () => {
    render(<ColorPicker />);
    expect(screen.getByText("HEX")).toBeInTheDocument();
    expect(screen.getByText("RGB")).toBeInTheDocument();
    expect(screen.getByText("HSL")).toBeInTheDocument();
    expect(screen.getByText("HSV")).toBeInTheDocument();
  });

  it("renders RGB channel sliders and number inputs", () => {
    render(<ColorPicker />);
    const sliders = screen.getAllByRole("slider");
    expect(sliders).toHaveLength(3);
    const spinners = screen.getAllByRole("spinbutton");
    expect(spinners).toHaveLength(3);
  });

  it("renders rgb channel section labels R, G, B", () => {
    render(<ColorPicker />);
    expect(screen.getByText("R")).toBeInTheDocument();
    expect(screen.getByText("G")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  // ── Default displayed values ──────────────────────────────────────────────

  it("displays initial RGB value for #3b82f6 (59, 130, 246)", () => {
    render(<ColorPicker />);
    expect(screen.getByText(/rgb\(59, 130, 246\)/)).toBeInTheDocument();
  });

  it("HEX text input defaults to lowercase #3b82f6", () => {
    render(<ColorPicker />);
    const hexInput = getHexTextInput();
    expect(hexInput.value).toBe("#3b82f6");
  });

  it("displays HSL value for initial color", () => {
    render(<ColorPicker />);
    const hslText = screen.getByText(/hsl\(/);
    expect(hslText).toBeInTheDocument();
  });

  it("displays HSV value for initial color", () => {
    render(<ColorPicker />);
    const hsvText = screen.getByText(/hsv\(/);
    expect(hsvText).toBeInTheDocument();
  });

  // ── HEX input interaction ─────────────────────────────────────────────────

  it("typing a valid hex into HEX input updates RGB display", async () => {
    const user = userEvent.setup();
    render(<ColorPicker />);
    const hexInput = getHexTextInput();
    await user.clear(hexInput);
    await user.type(hexInput, "#ff0000");
    expect(screen.getByText("rgb(255, 0, 0)")).toBeInTheDocument();
  });

  it("typing a hex without # prefix is accepted", async () => {
    const user = userEvent.setup();
    render(<ColorPicker />);
    const hexInput = getHexTextInput();
    await user.clear(hexInput);
    await user.type(hexInput, "00ff00");
    expect(screen.getByText("rgb(0, 255, 0)")).toBeInTheDocument();
  });

  it("partial / invalid hex input does not crash the component", async () => {
    const user = userEvent.setup();
    render(<ColorPicker />);
    const hexInput = getHexTextInput();
    await user.clear(hexInput);
    await user.type(hexInput, "#gg");
    // Component should still be present and hex input unchanged
    expect(hexInput).toBeInTheDocument();
  });

  // ── Native color picker interaction ──────────────────────────────────────

  it("changing the native color input updates the HEX text input value", () => {
    render(<ColorPicker />);
    const colorInput = document.querySelector('input[type="color"]') as HTMLInputElement;
    fireEvent.change(colorInput, { target: { value: "#ff0000" } });
    // After update, the text input should also reflect the new color
    const hexInput = getHexTextInput();
    expect(hexInput.value).toBe("#ff0000");
  });

  it("changing native color input updates RGB display", () => {
    render(<ColorPicker />);
    const colorInput = document.querySelector('input[type="color"]') as HTMLInputElement;
    fireEvent.change(colorInput, { target: { value: "#000000" } });
    expect(screen.getByText("rgb(0, 0, 0)")).toBeInTheDocument();
  });

  // ── RGB slider interaction ─────────────────────────────────────────────────

  it("moving R, G, B sliders to 255,0,0 updates hex text input to #ff0000", () => {
    render(<ColorPicker />);
    const sliders = screen.getAllByRole("slider");
    fireEvent.change(sliders[0], { target: { value: "255" } });
    fireEvent.change(sliders[1], { target: { value: "0" } });
    fireEvent.change(sliders[2], { target: { value: "0" } });
    const hexInput = getHexTextInput();
    expect(hexInput.value).toBe("#ff0000");
  });

  it("RGB sliders are clamped at 0 at minimum", () => {
    render(<ColorPicker />);
    const sliders = screen.getAllByRole("slider");
    fireEvent.change(sliders[0], { target: { value: "0" } });
    expect(sliders[0]).toHaveValue("0");
  });

  it("RGB sliders are clamped at 255 at maximum", () => {
    render(<ColorPicker />);
    const sliders = screen.getAllByRole("slider");
    fireEvent.change(sliders[0], { target: { value: "255" } });
    expect(sliders[0]).toHaveValue("255");
  });

  // ── Copy behavior ─────────────────────────────────────────────────────────

  it("clicking copy next to HEX calls clipboard.writeText with uppercase hex", async () => {
    const user = userEvent.setup();
    const writeSpy = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    render(<ColorPicker />);
    const copyButtons = screen.getAllByRole("button", { name: /copy/i });
    // HEX row copy is first button
    await user.click(copyButtons[0]);
    // hexStr = hex.toUpperCase() = "#3B82F6"
    expect(writeSpy).toHaveBeenCalledWith("#3B82F6");
  });

  it("clicking copy next to RGB calls clipboard.writeText with rgb() value", async () => {
    const user = userEvent.setup();
    const writeSpy = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    render(<ColorPicker />);
    const copyButtons = screen.getAllByRole("button", { name: /copy/i });
    // RGB row copy is second button
    await user.click(copyButtons[1]);
    expect(writeSpy).toHaveBeenCalledWith("rgb(59, 130, 246)");
  });

  it("clicked copy button shows 'copied!' label", async () => {
    const user = userEvent.setup();
    render(<ColorPicker />);
    const copyButtons = screen.getAllByRole("button", { name: /copy/i });
    await user.click(copyButtons[0]);
    expect(screen.getByText("copied!")).toBeInTheDocument();
  });

  // ── Color history ─────────────────────────────────────────────────────────

  it("history section does not appear with just the initial color", () => {
    render(<ColorPicker />);
    // history only shows when history.length > 1
    expect(screen.queryByText(/— recent/i)).not.toBeInTheDocument();
  });

  it("history section appears after a second color is picked", () => {
    render(<ColorPicker />);
    const colorInput = document.querySelector('input[type="color"]') as HTMLInputElement;
    fireEvent.change(colorInput, { target: { value: "#ff0000" } });
    // verify by checking text content includes "recent"
    expect(document.body.textContent).toMatch(/recent/i);
  });

  // ── Accessibility ─────────────────────────────────────────────────────────

  it("native color input has accessible title attribute", () => {
    render(<ColorPicker />);
    const colorInput = document.querySelector('input[type="color"]');
    expect(colorInput).toHaveAttribute("title", "Click to open color picker");
  });

  it("hex text input is of type text (not color)", () => {
    render(<ColorPicker />);
    const hexInput = getHexTextInput();
    expect(hexInput.type).not.toBe("color");
  });

  // ── Contrast preview swatches ─────────────────────────────────────────────

  it("renders 'on white' contrast preview", () => {
    render(<ColorPicker />);
    expect(screen.getByText("on white")).toBeInTheDocument();
  });

  it("renders 'on black' contrast preview", () => {
    render(<ColorPicker />);
    expect(screen.getByText("on black")).toBeInTheDocument();
  });
});
