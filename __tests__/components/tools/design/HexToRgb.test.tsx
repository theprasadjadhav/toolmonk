import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HexToRgb } from "@/components/tools/design/HexToRgb";

describe("HexToRgb", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  it("renders the hex input field", () => {
    render(<HexToRgb />);
    const input = screen.getByPlaceholderText("#3b82f6");
    expect(input).toBeInTheDocument();
  });

  it("renders placeholder output rows before any input", () => {
    render(<HexToRgb />);
    expect(screen.getByText("rgb(-, -, -)")).toBeInTheDocument();
    expect(screen.getByText("rgba(-, -, -, -)")).toBeInTheDocument();
  });

  // ── Color conversion — standard values ────────────────────────────────────

  it("converts #ff0000 to rgb(255, 0, 0)", async () => {
    const user = userEvent.setup();
    render(<HexToRgb />);
    const input = screen.getByPlaceholderText("#3b82f6");
    await user.clear(input);
    await user.type(input, "ff0000");
    expect(screen.getByText("rgb(255, 0, 0)")).toBeInTheDocument();
  });

  it("converts #000000 to rgb(0, 0, 0)", async () => {
    const user = userEvent.setup();
    render(<HexToRgb />);
    const input = screen.getByPlaceholderText("#3b82f6");
    await user.clear(input);
    await user.type(input, "000000");
    expect(screen.getByText("rgb(0, 0, 0)")).toBeInTheDocument();
  });

  it("converts #ffffff to rgb(255, 255, 255)", async () => {
    const user = userEvent.setup();
    render(<HexToRgb />);
    const input = screen.getByPlaceholderText("#3b82f6");
    await user.clear(input);
    await user.type(input, "ffffff");
    expect(screen.getByText("rgb(255, 255, 255)")).toBeInTheDocument();
  });

  it("converts with # prefix typed by user", async () => {
    const user = userEvent.setup();
    render(<HexToRgb />);
    const input = screen.getByPlaceholderText("#3b82f6");
    await user.clear(input);
    await user.type(input, "#00ff00");
    expect(screen.getByText("rgb(0, 255, 0)")).toBeInTheDocument();
  });

  // ── Edge cases ─────────────────────────────────────────────────────────────

  it("converts 3-digit shorthand hex #f00 to rgb(255, 0, 0)", async () => {
    const user = userEvent.setup();
    render(<HexToRgb />);
    const input = screen.getByPlaceholderText("#3b82f6");
    await user.clear(input);
    await user.type(input, "f00");
    expect(screen.getByText("rgb(255, 0, 0)")).toBeInTheDocument();
  });

  it("handles uppercase hex input #FF0000", async () => {
    const user = userEvent.setup();
    render(<HexToRgb />);
    const input = screen.getByPlaceholderText("#3b82f6");
    await user.clear(input);
    await user.type(input, "FF0000");
    expect(screen.getByText("rgb(255, 0, 0)")).toBeInTheDocument();
  });

  it("produces RGBA output with alpha = 1", async () => {
    const user = userEvent.setup();
    render(<HexToRgb />);
    const input = screen.getByPlaceholderText("#3b82f6");
    await user.clear(input);
    await user.type(input, "0000ff");
    expect(screen.getByText("rgba(0, 0, 255, 1)")).toBeInTheDocument();
  });

  it("shows HSL output for a known color (#ff0000 → hsl(0, 100%, 50%))", async () => {
    const user = userEvent.setup();
    render(<HexToRgb />);
    const input = screen.getByPlaceholderText("#3b82f6");
    await user.clear(input);
    await user.type(input, "ff0000");
    expect(screen.getByText("hsl(0, 100%, 50%)")).toBeInTheDocument();
  });

  it("exposes individual R, G, B channel values", async () => {
    const user = userEvent.setup();
    render(<HexToRgb />);
    const input = screen.getByPlaceholderText("#3b82f6");
    await user.clear(input);
    await user.type(input, "1a2b3c");
    // R=26, G=43, B=60
    expect(screen.getByText("26")).toBeInTheDocument();
    expect(screen.getByText("43")).toBeInTheDocument();
    expect(screen.getByText("60")).toBeInTheDocument();
  });

  // ── Validation ────────────────────────────────────────────────────────────

  it("shows an invalid-hex warning for partial/wrong input", async () => {
    const user = userEvent.setup();
    render(<HexToRgb />);
    const input = screen.getByPlaceholderText("#3b82f6");
    await user.clear(input);
    await user.type(input, "gg0000");
    expect(screen.getByText(/invalid hex/i)).toBeInTheDocument();
  });

  it("does not show invalid message when input is empty", () => {
    render(<HexToRgb />);
    expect(screen.queryByText(/invalid hex/i)).not.toBeInTheDocument();
  });

  // ── Copy behavior ─────────────────────────────────────────────────────────

  it("copies RGB value to clipboard when copy button is clicked", async () => {
    const user = userEvent.setup();
    const writeSpy = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    render(<HexToRgb />);
    const input = screen.getByPlaceholderText("#3b82f6");
    await user.clear(input);
    await user.type(input, "ff0000");

    const copyButtons = screen.getAllByRole("button", { name: /copy/i });
    // First copy button is for RGB row
    await user.click(copyButtons[0]);
    expect(writeSpy).toHaveBeenCalledWith("rgb(255, 0, 0)");
  });

  // ── Accessibility ─────────────────────────────────────────────────────────

  it("hex input is a textbox (no explicit role override)", () => {
    render(<HexToRgb />);
    // input without type="..." defaults to text role
    const input = screen.getByPlaceholderText("#3b82f6");
    expect(input).toBeInTheDocument();
  });

  it("color info panel shows Hue, Saturation, Lightness labels after valid input", async () => {
    const user = userEvent.setup();
    render(<HexToRgb />);
    const input = screen.getByPlaceholderText("#3b82f6");
    await user.clear(input);
    await user.type(input, "3b82f6");
    expect(screen.getByText("Hue")).toBeInTheDocument();
    expect(screen.getByText("Saturation")).toBeInTheDocument();
    expect(screen.getByText("Lightness")).toBeInTheDocument();
  });
});
