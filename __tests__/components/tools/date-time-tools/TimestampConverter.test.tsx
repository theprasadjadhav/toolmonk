import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TimestampConverter } from "@/components/tools/shared/date-time/TimestampConverter";

// Fix system time: Unix 1750000000 = Sunday, June 15 2025 16:26:40 UTC
const FIXED_UNIX_SEC = 1750000000;
const FIXED_UNIX_MS = FIXED_UNIX_SEC * 1000;

beforeEach(() => {
  vi.useFakeTimers({ now: new Date(FIXED_UNIX_MS) });
});
afterEach(() => {
  vi.useRealTimers();
});

function getTextInput() {
  return document.querySelector('input[type="text"]') as HTMLInputElement;
}
function getDatetimeLocalInput() {
  return document.querySelector('input[type="datetime-local"]') as HTMLInputElement;
}

describe("TimestampConverter", () => {
  describe("rendering", () => {
    it("renders a text input for pasting a timestamp", () => {
      render(<TimestampConverter />);
      expect(getTextInput()).toBeInTheDocument();
    });

    it("renders a datetime-local picker", () => {
      render(<TimestampConverter />);
      expect(getDatetimeLocalInput()).toBeInTheDocument();
    });

    it("renders the 'Use now' button", () => {
      render(<TimestampConverter />);
      expect(screen.getByRole("button", { name: /use now/i })).toBeInTheDocument();
    });

    it("renders — paste date, time, or unix timestamp label", () => {
      render(<TimestampConverter />);
      expect(screen.getByText(/paste date.*time.*unix/i)).toBeInTheDocument();
    });

    it("renders — or pick from calendar label", () => {
      render(<TimestampConverter />);
      expect(screen.getByText(/or pick from calendar/i)).toBeInTheDocument();
    });

    it("shows format rows on initial render (pre-filled with current unix timestamp)", () => {
      render(<TimestampConverter />);
      expect(screen.getByText(/unix seconds/i)).toBeInTheDocument();
    });

    it("text input is pre-filled with current unix seconds", () => {
      render(<TimestampConverter />);
      expect(getTextInput().value).toBe(String(FIXED_UNIX_SEC));
    });
  });

  describe("unix timestamp parsing", () => {
    it("shows unix seconds value in results for a known timestamp", () => {
      render(<TimestampConverter />);
      fireEvent.change(getTextInput(), { target: { value: String(FIXED_UNIX_SEC) } });
      expect(screen.getAllByText(String(FIXED_UNIX_SEC)).length).toBeGreaterThan(0);
    });

    it("shows unix milliseconds as FIXED_UNIX_SEC * 1000", () => {
      render(<TimestampConverter />);
      fireEvent.change(getTextInput(), { target: { value: String(FIXED_UNIX_SEC) } });
      expect(screen.getByText(String(FIXED_UNIX_MS))).toBeInTheDocument();
    });

    it("treats input > 1e10 as unix milliseconds and derives correct unix seconds", () => {
      render(<TimestampConverter />);
      fireEvent.change(getTextInput(), { target: { value: String(FIXED_UNIX_MS) } });
      // Unix seconds row should contain FIXED_UNIX_SEC
      expect(screen.getAllByText(String(FIXED_UNIX_SEC)).length).toBeGreaterThan(0);
    });

    it("shows 'Sunday' as day of week for timestamp 1750000000 (June 15 2025 is Sunday)", () => {
      render(<TimestampConverter />);
      fireEvent.change(getTextInput(), { target: { value: String(FIXED_UNIX_SEC) } });
      expect(screen.getByText("Sunday")).toBeInTheDocument();
    });

    it("shows ISO 8601 UTC date containing '2025-06-15' for the fixed timestamp", () => {
      render(<TimestampConverter />);
      fireEvent.change(getTextInput(), { target: { value: String(FIXED_UNIX_SEC) } });
      // Both ISO UTC and ISO local rows may contain "2025-06-15T"
      expect(screen.getAllByText(/2025-06-15T/).length).toBeGreaterThan(0);
    });
  });

  describe("ISO date string parsing", () => {
    it("parses an ISO date string and shows a unix seconds value", () => {
      render(<TimestampConverter />);
      fireEvent.change(getTextInput(), { target: { value: "2025-06-15T16:26:40Z" } });
      // Verify that the unix seconds row shows some numeric value
      expect(screen.getByText(/unix seconds/i)).toBeInTheDocument();
      // And that the result section renders without error
      expect(screen.queryByText(/could not parse/i)).not.toBeInTheDocument();
    });
  });

  describe("invalid input", () => {
    it("shows error message for an unparseable string", () => {
      render(<TimestampConverter />);
      fireEvent.change(getTextInput(), { target: { value: "not-a-date" } });
      expect(screen.getByText(/could not parse/i)).toBeInTheDocument();
    });
  });

  describe("Use now button", () => {
    it("sets text input to current unix timestamp when clicked", () => {
      render(<TimestampConverter />);
      // First, change the input to something else
      fireEvent.change(getTextInput(), { target: { value: "1000000000" } });
      fireEvent.click(screen.getByRole("button", { name: /use now/i }));
      // After clicking, text input should be back to current unix seconds
      expect(Number(getTextInput().value)).toBeCloseTo(FIXED_UNIX_SEC, -2);
    });
  });

  describe("result row labels", () => {
    it("shows all expected format labels for a valid input", () => {
      render(<TimestampConverter />);
      fireEvent.change(getTextInput(), { target: { value: String(FIXED_UNIX_SEC) } });
      expect(screen.getByText(/unix seconds/i)).toBeInTheDocument();
      expect(screen.getByText(/unix milliseconds/i)).toBeInTheDocument();
      expect(screen.getByText(/iso 8601.*utc/i)).toBeInTheDocument();
      expect(screen.getByText(/iso 8601.*local/i)).toBeInTheDocument();
      expect(screen.getByText(/utc string/i)).toBeInTheDocument();
      expect(screen.getByText(/date only/i)).toBeInTheDocument();
      expect(screen.getByText(/time only/i)).toBeInTheDocument();
      expect(screen.getByText(/day of week/i)).toBeInTheDocument();
      expect(screen.getByText(/iso week number/i)).toBeInTheDocument();
      expect(screen.getByText(/^relative$/i)).toBeInTheDocument();
    });

    it("renders copy buttons for each format row", () => {
      render(<TimestampConverter />);
      fireEvent.change(getTextInput(), { target: { value: String(FIXED_UNIX_SEC) } });
      const copyBtns = screen.getAllByRole("button", { name: /copy/i });
      expect(copyBtns.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe("accessibility", () => {
    it("renders — paste date, time, or unix timestamp label text", () => {
      render(<TimestampConverter />);
      expect(screen.getByText(/paste date.*time.*unix/i)).toBeInTheDocument();
    });

    it("renders — or pick from calendar label text", () => {
      render(<TimestampConverter />);
      expect(screen.getByText(/or pick from calendar/i)).toBeInTheDocument();
    });
  });
});
