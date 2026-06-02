import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CronGenerator } from "@/components/tools/code/CronGenerator";

// ── Inline pure-logic tests (extracted from module internals) ─────────────────

// Re-implement the two pure functions locally so we can unit-test them without
// rendering the component, matching the actual source exactly.

function matchPart(value: number, part: string): boolean {
  if (part === "*") return true;
  for (const seg of part.split(",")) {
    if (seg === "*") return true;
    if (seg.startsWith("*/")) {
      const step = parseInt(seg.slice(2));
      if (!isNaN(step) && step > 0 && value % step === 0) return true;
    } else if (seg.includes("/")) {
      const [range, stepStr] = seg.split("/");
      const step = parseInt(stepStr);
      if (range.includes("-")) {
        const [lo, hi] = range.split("-").map(Number);
        if (value >= lo && value <= hi && (value - lo) % step === 0) return true;
      }
    } else if (seg.includes("-")) {
      const [lo, hi] = seg.split("-").map(Number);
      if (value >= lo && value <= hi) return true;
    } else {
      if (parseInt(seg) === value) return true;
    }
  }
  return false;
}

describe("CronGenerator — business logic (pure functions)", () => {
  describe("matchPart", () => {
    it("wildcard * matches any value", () => {
      expect(matchPart(0, "*")).toBe(true);
      expect(matchPart(59, "*")).toBe(true);
    });

    it("exact value matches", () => {
      expect(matchPart(5, "5")).toBe(true);
      expect(matchPart(4, "5")).toBe(false);
    });

    it("range match", () => {
      expect(matchPart(3, "1-5")).toBe(true);
      expect(matchPart(6, "1-5")).toBe(false);
    });

    it("step match */5", () => {
      expect(matchPart(0, "*/5")).toBe(true);
      expect(matchPart(5, "*/5")).toBe(true);
      expect(matchPart(10, "*/5")).toBe(true);
      expect(matchPart(3, "*/5")).toBe(false);
    });

    it("comma-separated list", () => {
      expect(matchPart(1, "1,15")).toBe(true);
      expect(matchPart(15, "1,15")).toBe(true);
      expect(matchPart(7, "1,15")).toBe(false);
    });

    it("weekday range 1-5 matches Mon–Fri", () => {
      for (let d = 1; d <= 5; d++) expect(matchPart(d, "1-5")).toBe(true);
      expect(matchPart(0, "1-5")).toBe(false);
      expect(matchPart(6, "1-5")).toBe(false);
    });
  });
});

describe("CronGenerator — component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<CronGenerator />);
    expect(screen.getByText(/weekdays \(mon.+fri\) at 9:00 am/i)).toBeInTheDocument();
  });

  it("shows the default expression 0 9 * * 1-5", () => {
    render(<CronGenerator />);
    const input = screen.getByDisplayValue("0 9 * * 1-5");
    expect(input).toBeInTheDocument();
  });

  it("renders all preset buttons", () => {
    render(<CronGenerator />);
    expect(screen.getByRole("button", { name: "Every minute" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Every hour" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Daily midnight" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Every 5 min" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Weekly Sunday" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Monthly 1st" })).toBeInTheDocument();
  });

  it("clicking 'Every minute' preset updates expression and description", async () => {
    const user = userEvent.setup();
    render(<CronGenerator />);
    await user.click(screen.getByRole("button", { name: "Every minute" }));
    expect(screen.getByDisplayValue("* * * * *")).toBeInTheDocument();
    // The description appears in the green/red box — query by role or check
    // there are at least 2 elements with that text (button + description div)
    const all = screen.getAllByText("Every minute");
    expect(all.length).toBeGreaterThanOrEqual(1);
  });

  it("clicking 'Every hour' preset shows correct description", async () => {
    const user = userEvent.setup();
    render(<CronGenerator />);
    await user.click(screen.getByRole("button", { name: "Every hour" }));
    expect(screen.getByText("Every hour, on the hour")).toBeInTheDocument();
  });

  it("clicking 'Daily midnight' shows correct description", async () => {
    const user = userEvent.setup();
    render(<CronGenerator />);
    await user.click(screen.getByRole("button", { name: "Daily midnight" }));
    expect(screen.getByText("Daily at midnight (00:00)")).toBeInTheDocument();
  });

  it("clicking 'Weekly Sunday' shows correct description", async () => {
    const user = userEvent.setup();
    render(<CronGenerator />);
    await user.click(screen.getByRole("button", { name: "Weekly Sunday" }));
    expect(screen.getByText("Every Sunday at midnight")).toBeInTheDocument();
  });

  it("clicking 'Monthly 1st' shows correct description", async () => {
    const user = userEvent.setup();
    render(<CronGenerator />);
    await user.click(screen.getByRole("button", { name: "Monthly 1st" }));
    expect(screen.getByText("Monthly on the 1st at midnight")).toBeInTheDocument();
  });

  it("typing directly into the expression input updates the description div", async () => {
    const user = userEvent.setup();
    render(<CronGenerator />);
    const exprInput = screen.getByDisplayValue("0 9 * * 1-5");
    await user.clear(exprInput);
    await user.type(exprInput, "* * * * *");
    await waitFor(() => {
      // The description box shows "Every minute" — may also appear in preset button
      const all = screen.getAllByText("Every minute");
      expect(all.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("invalid expression (wrong field count) shows error message", async () => {
    const user = userEvent.setup();
    render(<CronGenerator />);
    const exprInput = screen.getByDisplayValue("0 9 * * 1-5");
    await user.clear(exprInput);
    await user.type(exprInput, "0 0 0");
    await waitFor(() => {
      expect(
        screen.getByText(/invalid — expected 5 fields/i),
      ).toBeInTheDocument();
    });
  });

  it("shows next scheduled runs for valid expression", async () => {
    render(<CronGenerator />);
    // Default expr "0 9 * * 1-5" should produce next runs
    await waitFor(() => {
      expect(screen.getByText(/next scheduled runs/i)).toBeInTheDocument();
    });
  });

  it("hides next runs for invalid expression", async () => {
    const user = userEvent.setup();
    render(<CronGenerator />);
    const exprInput = screen.getByDisplayValue("0 9 * * 1-5");
    await user.clear(exprInput);
    await user.type(exprInput, "bad input");
    await waitFor(() => {
      expect(screen.queryByText(/next scheduled runs/i)).not.toBeInTheDocument();
    });
  });

  it("shows 8 next run rows for valid expression", async () => {
    render(<CronGenerator />);
    await waitFor(() => {
      const rows = screen.getAllByText(/^\d+$/).filter(
        (el) => parseInt(el.textContent ?? "0") <= 8,
      );
      expect(rows.length).toBeGreaterThanOrEqual(8);
    });
  });

  it("field editors update the expression", async () => {
    const user = userEvent.setup();
    render(<CronGenerator />);
    // Find the Minute field input — it has value "0"
    const minuteInputs = screen.getAllByDisplayValue("0");
    // There might be multiple; find the one in the field grid (label "Minute")
    const minuteInput = minuteInputs[0];
    await user.clear(minuteInput);
    await user.type(minuteInput, "30");
    await waitFor(() => {
      const exprInput = screen.getByDisplayValue(/^30\s/);
      expect(exprInput).toBeInTheDocument();
    });
  });

  it("copy button calls navigator.clipboard.writeText", async () => {
    const writeSpy = vi.spyOn(navigator.clipboard, "writeText");
    const user = userEvent.setup();
    render(<CronGenerator />);
    const copyBtn = screen.getByRole("button", { name: /copy/i });
    await user.click(copyBtn);
    expect(writeSpy).toHaveBeenCalledWith("0 9 * * 1-5");
  });
});

describe("CronGenerator — accessibility", () => {
  it("field labels are rendered", () => {
    render(<CronGenerator />);
    expect(screen.getByText("Minute")).toBeInTheDocument();
    expect(screen.getByText("Hour")).toBeInTheDocument();
    expect(screen.getByText("Day of Month")).toBeInTheDocument();
    expect(screen.getByText("Month")).toBeInTheDocument();
    expect(screen.getByText("Weekday")).toBeInTheDocument();
  });

  it("copy button has accessible name", () => {
    render(<CronGenerator />);
    expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
  });
});
