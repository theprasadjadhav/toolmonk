import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DateDifferenceCalculator } from "@/components/tools/date-time-tools/DateDifferenceCalculator";

beforeEach(() => {
  vi.useFakeTimers({ now: new Date("2025-06-15T12:00:00Z") });
});
afterEach(() => {
  vi.useRealTimers();
});

function getDateInputs() {
  return Array.from(document.querySelectorAll('input[type="date"]')) as HTMLInputElement[];
}

describe("DateDifferenceCalculator", () => {
  describe("rendering", () => {
    it("renders two date inputs", () => {
      render(<DateDifferenceCalculator />);
      expect(getDateInputs()).toHaveLength(2);
    });

    it("renders — start date label text", () => {
      render(<DateDifferenceCalculator />);
      expect(screen.getByText(/— start date/i)).toBeInTheDocument();
    });

    it("renders — end date label text", () => {
      render(<DateDifferenceCalculator />);
      expect(screen.getByText(/— end date/i)).toBeInTheDocument();
    });

    it("shows placeholder text when no dates are entered", () => {
      render(<DateDifferenceCalculator />);
      expect(screen.getByText(/select both dates/i)).toBeInTheDocument();
    });
  });

  describe("date difference — happy path", () => {
    it("calculates 0d summary for identical dates", () => {
      render(<DateDifferenceCalculator />);
      const [startInput, endInput] = getDateInputs();
      fireEvent.change(startInput, { target: { value: "2025-01-01" } });
      fireEvent.change(endInput, { target: { value: "2025-01-01" } });
      // summary = "0d"
      expect(screen.getByText("0d")).toBeInTheDocument();
    });

    it("calculates 365 days between 2024-01-01 and 2024-12-31", () => {
      render(<DateDifferenceCalculator />);
      const [startInput, endInput] = getDateInputs();
      fireEvent.change(startInput, { target: { value: "2024-01-01" } });
      fireEvent.change(endInput, { target: { value: "2024-12-31" } });
      expect(screen.getByText("365")).toBeInTheDocument();
    });

    it("calculates 1 year difference between 2024-01-01 and 2025-01-01", () => {
      render(<DateDifferenceCalculator />);
      const [startInput, endInput] = getDateInputs();
      fireEvent.change(startInput, { target: { value: "2024-01-01" } });
      fireEvent.change(endInput, { target: { value: "2025-01-01" } });
      // Summary row should show "1y"
      expect(screen.getByText(/1y/)).toBeInTheDocument();
    });

    it("shows 24 total hours for a 1-day difference", () => {
      render(<DateDifferenceCalculator />);
      const [startInput, endInput] = getDateInputs();
      fireEvent.change(startInput, { target: { value: "2025-06-14" } });
      fireEvent.change(endInput, { target: { value: "2025-06-15" } });
      expect(screen.getByText("24")).toBeInTheDocument();
    });

    it("shows 2.00 total weeks for a 14-day difference", () => {
      render(<DateDifferenceCalculator />);
      const [startInput, endInput] = getDateInputs();
      fireEvent.change(startInput, { target: { value: "2025-06-01" } });
      fireEvent.change(endInput, { target: { value: "2025-06-15" } });
      expect(screen.getByText("2.00")).toBeInTheDocument();
    });
  });

  describe("reversed date range", () => {
    it("shows warning when end is before start", () => {
      render(<DateDifferenceCalculator />);
      const [startInput, endInput] = getDateInputs();
      fireEvent.change(startInput, { target: { value: "2025-06-15" } });
      fireEvent.change(endInput, { target: { value: "2025-06-01" } });
      expect(screen.getByText(/end date is before start date/i)).toBeInTheDocument();
    });

    it("still shows the absolute difference (14 days) when dates are reversed", () => {
      render(<DateDifferenceCalculator />);
      const [startInput, endInput] = getDateInputs();
      fireEvent.change(startInput, { target: { value: "2025-06-15" } });
      fireEvent.change(endInput, { target: { value: "2025-06-01" } });
      expect(screen.getByText("14")).toBeInTheDocument();
    });
  });

  describe("result row labels", () => {
    it("shows Difference, Days only, Weeks, Hours, Minutes, Seconds labels", () => {
      render(<DateDifferenceCalculator />);
      const [startInput, endInput] = getDateInputs();
      fireEvent.change(startInput, { target: { value: "2025-06-01" } });
      fireEvent.change(endInput, { target: { value: "2025-06-15" } });
      expect(screen.getByText(/^difference$/i)).toBeInTheDocument();
      expect(screen.getByText(/days only/i)).toBeInTheDocument();
      expect(screen.getByText(/^weeks$/i)).toBeInTheDocument();
      expect(screen.getByText(/^hours$/i)).toBeInTheDocument();
      expect(screen.getByText(/^minutes$/i)).toBeInTheDocument();
      expect(screen.getByText(/^seconds$/i)).toBeInTheDocument();
    });

    it("each result row has a copy button", () => {
      render(<DateDifferenceCalculator />);
      const [startInput, endInput] = getDateInputs();
      fireEvent.change(startInput, { target: { value: "2025-06-01" } });
      fireEvent.change(endInput, { target: { value: "2025-06-15" } });
      const copyBtns = screen.getAllByRole("button", { name: /copy/i });
      expect(copyBtns.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe("edge cases", () => {
    it("handles leap year Feb 29 boundary (2024-02-28 to 2024-03-01 = 2 days)", () => {
      render(<DateDifferenceCalculator />);
      const [startInput, endInput] = getDateInputs();
      fireEvent.change(startInput, { target: { value: "2024-02-28" } });
      fireEvent.change(endInput, { target: { value: "2024-03-01" } });
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("handles a large date range (100 years)", () => {
      render(<DateDifferenceCalculator />);
      const [startInput, endInput] = getDateInputs();
      fireEvent.change(startInput, { target: { value: "1925-01-01" } });
      fireEvent.change(endInput, { target: { value: "2025-01-01" } });
      // Should show 100y in summary
      expect(screen.getByText(/100y/)).toBeInTheDocument();
    });

    it("handles year-boundary crossing (Dec 31 to Jan 1 = 1 day)", () => {
      render(<DateDifferenceCalculator />);
      const [startInput, endInput] = getDateInputs();
      fireEvent.change(startInput, { target: { value: "2024-12-31" } });
      fireEvent.change(endInput, { target: { value: "2025-01-01" } });
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("start date label text is present", () => {
      render(<DateDifferenceCalculator />);
      expect(screen.getByText(/— start date/i)).toBeInTheDocument();
    });

    it("end date label text is present", () => {
      render(<DateDifferenceCalculator />);
      expect(screen.getByText(/— end date/i)).toBeInTheDocument();
    });
  });
});
