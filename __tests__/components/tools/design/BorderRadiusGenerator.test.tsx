import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BorderRadiusGenerator } from "@/components/tools/design/BorderRadiusGenerator";

describe("BorderRadiusGenerator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  it("renders four corner sliders", () => {
    render(<BorderRadiusGenerator />);
    const sliders = screen.getAllByRole("slider");
    expect(sliders).toHaveLength(4);
  });

  it("renders four corner number inputs", () => {
    render(<BorderRadiusGenerator />);
    const spinners = screen.getAllByRole("spinbutton");
    expect(spinners).toHaveLength(4);
  });

  it("renders corner labels: Top left, Top right, Bot right, Bot left", () => {
    render(<BorderRadiusGenerator />);
    expect(screen.getByText("Top left")).toBeInTheDocument();
    expect(screen.getByText("Top right")).toBeInTheDocument();
    expect(screen.getByText("Bot right")).toBeInTheDocument();
    expect(screen.getByText("Bot left")).toBeInTheDocument();
  });

  it("renders unit selector buttons px, %, rem", () => {
    render(<BorderRadiusGenerator />);
    expect(screen.getByRole("button", { name: "px" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "%" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "rem" })).toBeInTheDocument();
  });

  it("renders linked / unlinked toggle button", () => {
    render(<BorderRadiusGenerator />);
    expect(screen.getByRole("button", { name: /linked/i })).toBeInTheDocument();
  });

  it("renders preset buttons", () => {
    render(<BorderRadiusGenerator />);
    expect(screen.getByRole("button", { name: "None" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pill" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Leaf" })).toBeInTheDocument();
  });

  // ── CSS output ────────────────────────────────────────────────────────────

  it("shows border-radius in the CSS output by default", () => {
    render(<BorderRadiusGenerator />);
    expect(screen.getByText(/border-radius:/)).toBeInTheDocument();
  });

  it("default value produces border-radius: 12px", () => {
    render(<BorderRadiusGenerator />);
    expect(screen.getByText(/border-radius: 12px;/)).toBeInTheDocument();
  });

  it("updates CSS output when a slider is changed (linked mode)", () => {
    render(<BorderRadiusGenerator />);
    const sliders = screen.getAllByRole("slider");
    fireEvent.change(sliders[0], { target: { value: "20" } });
    expect(screen.getByText(/border-radius: 20px;/)).toBeInTheDocument();
  });

  it("updates only one corner when in unlinked mode", () => {
    render(<BorderRadiusGenerator />);
    // Switch to unlinked
    const toggleBtn = screen.getByRole("button", { name: /linked/i });
    fireEvent.click(toggleBtn);

    const sliders = screen.getAllByRole("slider");
    fireEvent.change(sliders[0], { target: { value: "30" } });

    // The CSS output should have 4 separate values (not all equal)
    const preEl = screen.getByText(/border-radius:/);
    expect(preEl.textContent).toMatch(/30px/);
    // Remaining corners should still be 12px
    expect(preEl.textContent).toMatch(/12px/);
  });

  // ── Presets ───────────────────────────────────────────────────────────────

  it("None preset sets border-radius to 0px", () => {
    render(<BorderRadiusGenerator />);
    fireEvent.click(screen.getByRole("button", { name: "None" }));
    expect(screen.getByText(/border-radius: 0px;/)).toBeInTheDocument();
  });

  it("Sm preset sets border-radius to 4px", () => {
    render(<BorderRadiusGenerator />);
    fireEvent.click(screen.getByRole("button", { name: "Sm" }));
    expect(screen.getByText(/border-radius: 4px;/)).toBeInTheDocument();
  });

  it("Pill preset sets border-radius to 100px (clamped at px max)", () => {
    render(<BorderRadiusGenerator />);
    fireEvent.click(screen.getByRole("button", { name: "Pill" }));
    expect(screen.getByText(/border-radius: 100px;/)).toBeInTheDocument();
  });

  // ── Unit switching ────────────────────────────────────────────────────────

  it("switches to % unit and shows % in CSS output", () => {
    render(<BorderRadiusGenerator />);
    fireEvent.click(screen.getByRole("button", { name: "%" }));
    expect(screen.getByText(/border-radius:.*%/)).toBeInTheDocument();
  });

  it("switches to rem unit and shows rem in CSS output", () => {
    render(<BorderRadiusGenerator />);
    fireEvent.click(screen.getByRole("button", { name: "rem" }));
    expect(screen.getByText(/border-radius:.*rem/)).toBeInTheDocument();
  });

  // ── Linked mode ───────────────────────────────────────────────────────────

  it("toggling linked changes button label to unlinked", () => {
    render(<BorderRadiusGenerator />);
    const toggleBtn = screen.getByRole("button", { name: "linked" });
    fireEvent.click(toggleBtn);
    expect(screen.getByRole("button", { name: "unlinked" })).toBeInTheDocument();
  });

  // ── Copy behavior ─────────────────────────────────────────────────────────

  it("copy button triggers clipboard.writeText with the CSS string", async () => {
    const user = userEvent.setup();
    const writeSpy = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    render(<BorderRadiusGenerator />);
    const copyBtn = screen.getByRole("button", { name: "copy" });
    await user.click(copyBtn);
    expect(writeSpy).toHaveBeenCalledWith(
      expect.stringMatching(/border-radius:/),
    );
  });

  it("copy button label changes to 'copied' after click", async () => {
    const user = userEvent.setup();
    render(<BorderRadiusGenerator />);
    const copyBtn = screen.getByRole("button", { name: "copy" });
    await user.click(copyBtn);
    expect(screen.getByRole("button", { name: "copied" })).toBeInTheDocument();
  });

  // ── Number input direct change ─────────────────────────────────────────

  it("typing in a number input updates all corners when linked", () => {
    render(<BorderRadiusGenerator />);
    const spinners = screen.getAllByRole("spinbutton");
    fireEvent.change(spinners[0], { target: { value: "50" } });
    expect(screen.getByText(/border-radius: 50px;/)).toBeInTheDocument();
  });

  // ── Edge cases ────────────────────────────────────────────────────────────

  it("does not exceed px unit max (100) when value is set to 200 via number input", () => {
    render(<BorderRadiusGenerator />);
    const spinners = screen.getAllByRole("spinbutton");
    fireEvent.change(spinners[0], { target: { value: "200" } });
    // Should clamp at 100px
    expect(screen.getByText(/border-radius: 100px;/)).toBeInTheDocument();
  });

  it("floors values below 0 to 0", () => {
    render(<BorderRadiusGenerator />);
    const spinners = screen.getAllByRole("spinbutton");
    fireEvent.change(spinners[0], { target: { value: "-10" } });
    expect(screen.getByText(/border-radius: 0px;/)).toBeInTheDocument();
  });
});
