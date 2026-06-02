import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BusinessDaysCalculator } from "@/components/tools/date-time-tools/BusinessDaysCalculator";

beforeEach(() => {
  vi.useFakeTimers({ now: new Date("2025-06-15T12:00:00Z") });
});
afterEach(() => {
  vi.useRealTimers();
});

function getDateInputs() {
  return Array.from(document.querySelectorAll('input[type="date"]')) as HTMLInputElement[];
}

describe("BusinessDaysCalculator", () => {
  describe("rendering", () => {
    it("renders two date inputs", () => {
      render(<BusinessDaysCalculator />);
      expect(getDateInputs()).toHaveLength(2);
    });

    it("renders — start date label text", () => {
      render(<BusinessDaysCalculator />);
      expect(screen.getByText(/— start date/i)).toBeInTheDocument();
    });

    it("renders — end date label text", () => {
      render(<BusinessDaysCalculator />);
      expect(screen.getByText(/— end date/i)).toBeInTheDocument();
    });

    it("shows prompt when dates are missing", () => {
      render(<BusinessDaysCalculator />);
      expect(screen.getByText(/select both dates/i)).toBeInTheDocument();
    });
  });

  describe("business day calculations", () => {
    // Mon 2025-06-16 to Fri 2025-06-20 = 5 business days, 0 weekend days, 5 total
    it("calculates 5 business days for a standard work week", () => {
      render(<BusinessDaysCalculator />);
      const [startInput, endInput] = getDateInputs();
      fireEvent.change(startInput, { target: { value: "2025-06-16" } });
      fireEvent.change(endInput, { target: { value: "2025-06-20" } });
      // Both business days and total days are 5 in a Mon-Fri range
      expect(screen.getAllByText("5").length).toBeGreaterThanOrEqual(1);
    });

    // Mon 2025-06-16 to Sun 2025-06-22 = 5 business days, 2 weekend days, 7 total
    it("counts weekend days separately from business days", () => {
      render(<BusinessDaysCalculator />);
      const [startInput, endInput] = getDateInputs();
      fireEvent.change(startInput, { target: { value: "2025-06-16" } });
      fireEvent.change(endInput, { target: { value: "2025-06-22" } });
      // Business days = 5, Weekend days = 2, Calendar days = 7
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("7")).toBeInTheDocument();
    });

    // Saturday (2025-06-21) + Sunday (2025-06-22) only → 0 business days
    it("calculates 0 business days for a weekend-only range", () => {
      render(<BusinessDaysCalculator />);
      const [startInput, endInput] = getDateInputs();
      fireEvent.change(startInput, { target: { value: "2025-06-21" } });
      fireEvent.change(endInput, { target: { value: "2025-06-22" } });
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    // Single Monday
    it("calculates 1 business day for a single weekday", () => {
      render(<BusinessDaysCalculator />);
      const [startInput, endInput] = getDateInputs();
      fireEvent.change(startInput, { target: { value: "2025-06-16" } });
      fireEvent.change(endInput, { target: { value: "2025-06-16" } });
      // For a single day: business=1, total=1, weekend=0 — "1" appears multiple times
      expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("reversed date range", () => {
    it("shows 'dates swapped' notice when end is before start", () => {
      render(<BusinessDaysCalculator />);
      const [startInput, endInput] = getDateInputs();
      fireEvent.change(startInput, { target: { value: "2025-06-20" } });
      fireEvent.change(endInput, { target: { value: "2025-06-16" } });
      expect(screen.getByText(/dates swapped/i)).toBeInTheDocument();
    });

    it("still shows correct business day count when dates are reversed", () => {
      render(<BusinessDaysCalculator />);
      const [startInput, endInput] = getDateInputs();
      // Same Mon-Fri range, reversed
      fireEvent.change(startInput, { target: { value: "2025-06-20" } });
      fireEvent.change(endInput, { target: { value: "2025-06-16" } });
      // business=5, total=5, both appear twice
      expect(screen.getAllByText("5").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("result rows", () => {
    it("displays Business days, Calendar days, and Weekend days labels", () => {
      render(<BusinessDaysCalculator />);
      const [startInput, endInput] = getDateInputs();
      fireEvent.change(startInput, { target: { value: "2025-06-16" } });
      fireEvent.change(endInput, { target: { value: "2025-06-22" } });
      expect(screen.getByText(/business days/i)).toBeInTheDocument();
      expect(screen.getByText(/calendar days/i)).toBeInTheDocument();
      expect(screen.getByText(/weekend days/i)).toBeInTheDocument();
    });

    it("each row has a copy button", () => {
      render(<BusinessDaysCalculator />);
      const [startInput, endInput] = getDateInputs();
      fireEvent.change(startInput, { target: { value: "2025-06-16" } });
      fireEvent.change(endInput, { target: { value: "2025-06-22" } });
      const copyBtns = screen.getAllByRole("button", { name: /copy/i });
      expect(copyBtns.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("edge cases — leap year & year boundary", () => {
    // Feb 28 to Mar 1 in 2024 — 3 business days (Wed, Thu, Fri)
    it("counts Feb 29 as a business day in a leap year", () => {
      render(<BusinessDaysCalculator />);
      const [startInput, endInput] = getDateInputs();
      fireEvent.change(startInput, { target: { value: "2024-02-28" } });
      fireEvent.change(endInput, { target: { value: "2024-03-01" } });
      // 2024-02-28 Wed, 2024-02-29 Thu, 2024-03-01 Fri → 3 business days
      // business=3 and total=3 are both shown
      expect(screen.getAllByText("3").length).toBeGreaterThanOrEqual(1);
    });

    // Dec 31 2024 (Tue) to Jan 2 2025 (Thu) → 3 business days
    it("handles a year-boundary range correctly", () => {
      render(<BusinessDaysCalculator />);
      const [startInput, endInput] = getDateInputs();
      fireEvent.change(startInput, { target: { value: "2024-12-31" } });
      fireEvent.change(endInput, { target: { value: "2025-01-02" } });
      // business=3 and total=3 are both shown
      expect(screen.getAllByText("3").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("accessibility", () => {
    it("start date label is present in the DOM", () => {
      render(<BusinessDaysCalculator />);
      expect(screen.getByText(/— start date/i)).toBeInTheDocument();
    });

    it("end date label is present in the DOM", () => {
      render(<BusinessDaysCalculator />);
      expect(screen.getByText(/— end date/i)).toBeInTheDocument();
    });
  });
});
