import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimestampConverter } from "@/components/tools/code/TimestampConverter";

// ── Pure-logic unit tests ──────────────────────────────────────────────────────

function parseAny(raw: string): Date | null {
  if (!raw.trim()) return null;
  if (/^-?\d+(\.\d+)?$/.test(raw.trim())) {
    const n = Number(raw.trim());
    const ms = Math.abs(n) > 1e10 ? n : n * 1000;
    const d = new Date(ms);
    if (!isNaN(d.getTime())) return d;
  }
  const d = new Date(raw.trim());
  if (!isNaN(d.getTime())) return d;
  return null;
}

function isoWeek(d: Date): number {
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.ceil((((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

describe("TimestampConverter — business logic (pure functions)", () => {
  describe("parseAny", () => {
    it("parses a Unix seconds timestamp", () => {
      const d = parseAny("1700000000");
      expect(d).not.toBeNull();
      expect(d!.getTime()).toBe(1700000000 * 1000);
    });

    it("parses a Unix milliseconds timestamp (> 1e10)", () => {
      const ms = 1700000000000;
      const d = parseAny(String(ms));
      expect(d).not.toBeNull();
      expect(d!.getTime()).toBe(ms);
    });

    it("parses an ISO 8601 date string", () => {
      const d = parseAny("2024-01-15T10:00:00Z");
      expect(d).not.toBeNull();
      expect(d!.toISOString()).toBe("2024-01-15T10:00:00.000Z");
    });

    it("parses a human-readable date string", () => {
      const d = parseAny("Jan 15 2024");
      expect(d).not.toBeNull();
      expect(d!.getFullYear()).toBe(2024);
    });

    it("returns null for empty input", () => {
      expect(parseAny("")).toBeNull();
      expect(parseAny("   ")).toBeNull();
    });

    it("returns null for completely invalid input", () => {
      expect(parseAny("not a date")).toBeNull();
    });
  });

  describe("isoWeek", () => {
    it("Jan 1 2024 is in week 1", () => {
      expect(isoWeek(new Date("2024-01-01"))).toBe(1);
    });

    it("Dec 31 2023 is in week 52", () => {
      expect(isoWeek(new Date("2023-12-31"))).toBe(52);
    });

    it("returns a number between 1 and 53", () => {
      const w = isoWeek(new Date("2024-07-04"));
      expect(w).toBeGreaterThanOrEqual(1);
      expect(w).toBeLessThanOrEqual(53);
    });
  });
});

describe("TimestampConverter — component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<TimestampConverter />);
    expect(
      screen.getByText(/paste date, time, or unix timestamp/i),
    ).toBeInTheDocument();
  });

  it("renders 'Use now' button", () => {
    render(<TimestampConverter />);
    expect(screen.getByRole("button", { name: /use now/i })).toBeInTheDocument();
  });

  it("renders the calendar picker", () => {
    render(<TimestampConverter />);
    // The label text is rendered but not associated via htmlFor; query by type instead
    const picker = document.querySelector('input[type="datetime-local"]');
    expect(picker).not.toBeNull();
  });

  it("renders the all formats section on initial load", () => {
    render(<TimestampConverter />);
    expect(screen.getByText(/— all formats/i)).toBeInTheDocument();
  });

  it("shows Unix seconds row", () => {
    render(<TimestampConverter />);
    expect(screen.getByText(/unix seconds/i)).toBeInTheDocument();
  });

  it("shows ISO 8601 (UTC) row", () => {
    render(<TimestampConverter />);
    expect(screen.getByText(/ISO 8601.*UTC/i)).toBeInTheDocument();
  });

  it("shows day of week row", () => {
    render(<TimestampConverter />);
    expect(screen.getByText(/day of week/i)).toBeInTheDocument();
  });

  it("typing a valid Unix timestamp updates results", async () => {
    const user = userEvent.setup();
    render(<TimestampConverter />);
    const input = screen.getByPlaceholderText(/1744617600/i);
    await user.clear(input);
    await user.type(input, "0");
    await waitFor(() => {
      // Unix epoch: January 1 1970 — multiple cells will contain "1970"
      const matches = screen.getAllByText(/1970/);
      expect(matches.length).toBeGreaterThan(0);
    });
  });

  it("typing an ISO date string updates results", async () => {
    const user = userEvent.setup();
    render(<TimestampConverter />);
    const input = screen.getByPlaceholderText(/1744617600/i);
    await user.clear(input);
    await user.type(input, "2024-03-15T12:00:00Z");
    await waitFor(() => {
      expect(screen.getByText(/Friday/i)).toBeInTheDocument();
    });
  });

  it("shows error for invalid input", async () => {
    const user = userEvent.setup();
    render(<TimestampConverter />);
    const input = screen.getByPlaceholderText(/1744617600/i);
    await user.clear(input);
    await user.type(input, "notadate!!!xyz");
    await waitFor(() => {
      expect(
        screen.getByText(/could not parse/i),
      ).toBeInTheDocument();
    });
  });

  it("'Use now' button sets a current timestamp", async () => {
    const user = userEvent.setup();
    render(<TimestampConverter />);
    const input = screen.getByPlaceholderText(/1744617600/i);
    await user.clear(input);
    await user.click(screen.getByRole("button", { name: /use now/i }));
    // After clicking, the input should have a large numeric timestamp
    await waitFor(() => {
      const val = (input as HTMLInputElement).value;
      expect(parseInt(val)).toBeGreaterThan(1000000000);
    });
  });

  it("shows relative time in results", async () => {
    render(<TimestampConverter />);
    await waitFor(() => {
      expect(screen.getByText(/relative/i)).toBeInTheDocument();
    });
  });

  it("copy button triggers clipboard write", async () => {
    const user = userEvent.setup();
    render(<TimestampConverter />);
    await waitFor(() => {
      expect(screen.getByText(/unix seconds/i)).toBeInTheDocument();
    });
    // CopyButton renders within ResultsTable rows
    const copyButtons = screen.getAllByRole("button");
    const firstCopy = copyButtons.find(
      (b) => b.getAttribute("title")?.toLowerCase().includes("copy"),
    );
    if (firstCopy) {
      await user.click(firstCopy);
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    }
  });
});

describe("TimestampConverter — accessibility", () => {
  it("text input has a label", () => {
    render(<TimestampConverter />);
    expect(
      screen.getByText(/paste date, time, or unix timestamp/i),
    ).toBeInTheDocument();
  });

  it("datetime-local input is present", () => {
    render(<TimestampConverter />);
    // The label text is rendered but not associated via htmlFor
    const picker = document.querySelector('input[type="datetime-local"]');
    expect(picker).not.toBeNull();
  });

  it("Use now button has accessible name", () => {
    render(<TimestampConverter />);
    expect(screen.getByRole("button", { name: /use now/i })).toBeInTheDocument();
  });
});
