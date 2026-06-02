import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CssBoxShadowGenerator } from "@/components/tools/design/CssBoxShadowGenerator";

describe("CssBoxShadowGenerator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  it("renders control sliders for X offset, Y offset, Blur, Spread, Opacity", () => {
    render(<CssBoxShadowGenerator />);
    // 5 sliders for the 5 properties
    const sliders = screen.getAllByRole("slider");
    expect(sliders).toHaveLength(5);
  });

  it("renders the labeled controls", () => {
    render(<CssBoxShadowGenerator />);
    expect(screen.getByText("X offset")).toBeInTheDocument();
    expect(screen.getByText("Y offset")).toBeInTheDocument();
    expect(screen.getByText("Blur")).toBeInTheDocument();
    expect(screen.getByText("Spread")).toBeInTheDocument();
    expect(screen.getByText("Opacity")).toBeInTheDocument();
  });

  it("renders a color input for the shadow color", () => {
    render(<CssBoxShadowGenerator />);
    expect(screen.getByText("Color")).toBeInTheDocument();
    const colorInput = document.querySelector('input[type="color"]');
    expect(colorInput).toBeInTheDocument();
  });

  it("renders the inset checkbox", () => {
    render(<CssBoxShadowGenerator />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
  });

  it("renders inset label text", () => {
    render(<CssBoxShadowGenerator />);
    expect(screen.getByText("inset")).toBeInTheDocument();
  });

  it("renders Shadow 1 tab", () => {
    render(<CssBoxShadowGenerator />);
    expect(screen.getByRole("button", { name: "Shadow 1" })).toBeInTheDocument();
  });

  it("renders the + add button for adding shadows", () => {
    render(<CssBoxShadowGenerator />);
    expect(screen.getByRole("button", { name: /\+ add/i })).toBeInTheDocument();
  });

  // ── CSS output ────────────────────────────────────────────────────────────

  it("shows box-shadow property in CSS output by default", () => {
    render(<CssBoxShadowGenerator />);
    expect(screen.getByText(/box-shadow:/)).toBeInTheDocument();
  });

  it("default CSS output contains pixel values and rgba()", () => {
    render(<CssBoxShadowGenerator />);
    const pre = screen.getByText(/box-shadow:/);
    expect(pre.textContent).toMatch(/\d+px/);
    expect(pre.textContent).toMatch(/rgba\(/);
  });

  it("inset keyword appears in CSS when inset checkbox is checked", () => {
    render(<CssBoxShadowGenerator />);
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(screen.getByText(/box-shadow:/).textContent).toMatch(/inset/);
  });

  it("inset keyword is absent when inset is unchecked (default)", () => {
    render(<CssBoxShadowGenerator />);
    expect(screen.getByText(/box-shadow:/).textContent).not.toMatch(/inset/);
  });

  // ── Slider interaction ────────────────────────────────────────────────────

  it("changing X offset slider updates CSS output", () => {
    render(<CssBoxShadowGenerator />);
    const sliders = screen.getAllByRole("slider");
    // X offset is first slider
    fireEvent.change(sliders[0], { target: { value: "20" } });
    const css = screen.getByText(/box-shadow:/).textContent ?? "";
    expect(css).toMatch(/20px/);
  });

  it("changing Blur slider updates CSS output", () => {
    render(<CssBoxShadowGenerator />);
    const sliders = screen.getAllByRole("slider");
    // Blur is index 2
    fireEvent.change(sliders[2], { target: { value: "0" } });
    const css = screen.getByText(/box-shadow:/).textContent ?? "";
    // 0px blur should appear
    expect(css).toMatch(/0px/);
  });

  it("changing opacity to 0 produces rgba with opacity 0.00", () => {
    render(<CssBoxShadowGenerator />);
    const sliders = screen.getAllByRole("slider");
    // Opacity is index 4
    fireEvent.change(sliders[4], { target: { value: "0" } });
    const css = screen.getByText(/box-shadow:/).textContent ?? "";
    expect(css).toMatch(/rgba\(\d+,\d+,\d+,0\.00\)/);
  });

  // ── Multiple shadows ──────────────────────────────────────────────────────

  it("adding a second shadow creates Shadow 2 tab", () => {
    render(<CssBoxShadowGenerator />);
    fireEvent.click(screen.getByRole("button", { name: /\+ add/i }));
    expect(screen.getByRole("button", { name: "Shadow 2" })).toBeInTheDocument();
  });

  it("removing the only shadow is not possible (no × button with 1 shadow)", () => {
    render(<CssBoxShadowGenerator />);
    // With only 1 shadow, no × remove button should exist next to the tab
    const xButtons = Array.from(document.querySelectorAll("button")).filter(
      (b) => b.textContent === "×",
    );
    expect(xButtons).toHaveLength(0);
  });

  it("removing a shadow when 2 exist leaves only 1", () => {
    render(<CssBoxShadowGenerator />);
    fireEvent.click(screen.getByRole("button", { name: /\+ add/i }));
    // Now there are 2 shadows; × buttons appear
    const xButtons = Array.from(document.querySelectorAll("button")).filter(
      (b) => b.textContent === "×",
    );
    expect(xButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(xButtons[0]);
    expect(screen.queryByRole("button", { name: "Shadow 2" })).not.toBeInTheDocument();
  });

  // ── Copy behavior ─────────────────────────────────────────────────────────

  it("copy button triggers clipboard.writeText with the CSS string", async () => {
    const user = userEvent.setup();
    const writeSpy = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    render(<CssBoxShadowGenerator />);
    const copyBtn = screen.getByRole("button", { name: "copy" });
    await user.click(copyBtn);
    expect(writeSpy).toHaveBeenCalledWith(
      expect.stringMatching(/box-shadow:/),
    );
  });

  it("copy button label changes to 'copied' after click", async () => {
    const user = userEvent.setup();
    render(<CssBoxShadowGenerator />);
    await user.click(screen.getByRole("button", { name: "copy" }));
    expect(screen.getByRole("button", { name: "copied" })).toBeInTheDocument();
  });

  // ── Accessibility ─────────────────────────────────────────────────────────

  it("inset checkbox has accessible label via surrounding label element", () => {
    render(<CssBoxShadowGenerator />);
    const checkbox = screen.getByRole("checkbox");
    // The checkbox is wrapped in a <label> so it should be accessible
    expect(checkbox.closest("label")).toBeTruthy();
  });
});
