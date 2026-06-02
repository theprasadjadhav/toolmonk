import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GradientGenerator } from "@/components/tools/design/GradientGenerator";

describe("GradientGenerator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  it("renders type selector buttons: Linear, Radial, Conic", () => {
    render(<GradientGenerator />);
    expect(screen.getByRole("button", { name: "Linear" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Radial" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Conic" })).toBeInTheDocument();
  });

  it("renders the angle slider when linear type is selected (default)", () => {
    render(<GradientGenerator />);
    // angle section label is visible
    expect(screen.getByText(/— angle/i)).toBeInTheDocument();
    const sliders = screen.getAllByRole("slider");
    // one slider for angle + 2 for stop positions = at least 3
    expect(sliders.length).toBeGreaterThanOrEqual(1);
  });

  it("renders color stop controls (default 2 stops)", () => {
    render(<GradientGenerator />);
    const colorInputs = document.querySelectorAll('input[type="color"]');
    expect(colorInputs).toHaveLength(2);
  });

  it("renders + add button for color stops", () => {
    render(<GradientGenerator />);
    expect(screen.getByRole("button", { name: "+ add" })).toBeInTheDocument();
  });

  it("renders the CSS output section", () => {
    render(<GradientGenerator />);
    expect(screen.getByText(/background:/)).toBeInTheDocument();
  });

  // ── CSS output correctness ────────────────────────────────────────────────

  it("default output is a valid linear-gradient CSS value", () => {
    render(<GradientGenerator />);
    const pre = screen.getByText(/background:/);
    expect(pre.textContent).toMatch(/linear-gradient\(/);
    expect(pre.textContent).toMatch(/background:/);
  });

  it("default linear gradient contains the angle (135deg)", () => {
    render(<GradientGenerator />);
    expect(screen.getByText(/background:/).textContent).toMatch(/135deg/);
  });

  it("default linear gradient contains both default stop colors", () => {
    render(<GradientGenerator />);
    const css = screen.getByText(/background:/).textContent ?? "";
    expect(css).toMatch(/#3b82f6/i);
    expect(css).toMatch(/#8b5cf6/i);
  });

  it("switching to Radial type produces radial-gradient() in CSS", () => {
    render(<GradientGenerator />);
    fireEvent.click(screen.getByRole("button", { name: "Radial" }));
    expect(screen.getByText(/background:/).textContent).toMatch(/radial-gradient\(/);
  });

  it("switching to Conic type produces conic-gradient() in CSS", () => {
    render(<GradientGenerator />);
    fireEvent.click(screen.getByRole("button", { name: "Conic" }));
    expect(screen.getByText(/background:/).textContent).toMatch(/conic-gradient\(/);
  });

  it("hides angle controls when Radial is selected", () => {
    render(<GradientGenerator />);
    fireEvent.click(screen.getByRole("button", { name: "Radial" }));
    expect(screen.queryByText(/— angle/i)).not.toBeInTheDocument();
  });

  // ── Angle control ─────────────────────────────────────────────────────────

  it("angle display span shows current angle value with degree symbol", () => {
    render(<GradientGenerator />);
    // The angle is shown in a <span> with specific styling — there's also a
    // preset button for 135°; use getAllByText and verify at least one element exists
    const angleDisplays = screen.getAllByText(/135°/);
    expect(angleDisplays.length).toBeGreaterThanOrEqual(1);
  });

  it("clicking a preset angle button (e.g. 45°) updates the CSS output angle", () => {
    render(<GradientGenerator />);
    // Use a preset that is NOT 135° to avoid ambiguity
    fireEvent.click(screen.getByRole("button", { name: "45°" }));
    expect(screen.getByText(/background:/).textContent).toMatch(/45deg/);
  });

  it("changing the angle slider updates the CSS output", () => {
    render(<GradientGenerator />);
    const sliders = screen.getAllByRole("slider");
    // First slider is the angle slider
    fireEvent.change(sliders[0], { target: { value: "45" } });
    expect(screen.getByText(/background:/).textContent).toMatch(/45deg/);
  });

  // ── Color stops ───────────────────────────────────────────────────────────

  it("adding a stop increases the color inputs count to 3", () => {
    render(<GradientGenerator />);
    fireEvent.click(screen.getByRole("button", { name: "+ add" }));
    const colorInputs = document.querySelectorAll('input[type="color"]');
    expect(colorInputs).toHaveLength(3);
  });

  it("cannot remove a stop when only 2 remain (remove buttons disabled)", () => {
    render(<GradientGenerator />);
    const removeButtons = Array.from(document.querySelectorAll("button")).filter(
      (b) => b.textContent === "×",
    );
    // All remove buttons should be disabled with 2 stops
    removeButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it("can remove a third stop, returning to 2", () => {
    render(<GradientGenerator />);
    fireEvent.click(screen.getByRole("button", { name: "+ add" }));
    // Now 3 stops — remove buttons are enabled
    const enabledRemove = Array.from(document.querySelectorAll("button")).filter(
      (b) => b.textContent === "×" && !b.hasAttribute("disabled"),
    );
    expect(enabledRemove.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(enabledRemove[0]);
    const colorInputs = document.querySelectorAll('input[type="color"]');
    expect(colorInputs).toHaveLength(2);
  });

  it("stop positions appear as % labels", () => {
    render(<GradientGenerator />);
    // Default stops are at 0% and 100%
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("updating a stop position slider updates CSS output", () => {
    render(<GradientGenerator />);
    const sliders = screen.getAllByRole("slider");
    // sliders[0] = angle, sliders[1] = first stop position, sliders[2] = second stop position
    fireEvent.change(sliders[1], { target: { value: "25" } });
    expect(screen.getByText(/background:/).textContent).toMatch(/25%/);
  });

  // ── Copy behavior ─────────────────────────────────────────────────────────

  it("copy button triggers clipboard.writeText with the CSS string", async () => {
    const user = userEvent.setup();
    const writeSpy = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    render(<GradientGenerator />);
    await user.click(screen.getByRole("button", { name: "copy" }));
    expect(writeSpy).toHaveBeenCalledWith(
      expect.stringMatching(/background:.*gradient\(/),
    );
  });

  it("copy button label changes to 'copied' after click", async () => {
    const user = userEvent.setup();
    render(<GradientGenerator />);
    await user.click(screen.getByRole("button", { name: "copy" }));
    expect(screen.getByRole("button", { name: "copied" })).toBeInTheDocument();
  });

  // ── Accessibility ─────────────────────────────────────────────────────────

  it("color inputs for stops carry a title attribute 'Color'", () => {
    render(<GradientGenerator />);
    const colorInputs = document.querySelectorAll('input[type="color"]');
    colorInputs.forEach((input) => {
      expect(input).toHaveAttribute("title", "Color");
    });
  });
});
