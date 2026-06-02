import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AgeCalculator } from "@/components/tools/shared/date-time/AgeCalculator";

// Fix system time to 2025-06-15 for all tests
beforeEach(() => {
  vi.useFakeTimers({ now: new Date("2025-06-15T12:00:00Z") });
});
afterEach(() => {
  vi.useRealTimers();
});

function getDateInputs() {
  return Array.from(document.querySelectorAll('input[type="date"]')) as HTMLInputElement[];
}

describe("AgeCalculator", () => {
  describe("rendering", () => {
    it("renders two date inputs", () => {
      render(<AgeCalculator />);
      const inputs = getDateInputs();
      expect(inputs).toHaveLength(2);
    });

    it("renders — date of birth label text", () => {
      render(<AgeCalculator />);
      expect(screen.getAllByText(/date of birth/i).length).toBeGreaterThanOrEqual(1);
    });

    it("renders — reference date label text", () => {
      render(<AgeCalculator />);
      expect(screen.getByText(/reference date/i)).toBeInTheDocument();
    });

    it("shows placeholder prompt when no birth date is entered", () => {
      render(<AgeCalculator />);
      expect(screen.getByText(/enter a date of birth/i)).toBeInTheDocument();
    });

    it("pre-fills reference date with today (2025-06-15)", () => {
      render(<AgeCalculator />);
      const [, refInput] = getDateInputs();
      expect(refInput.value).toBe("2025-06-15");
    });

    it("birth date input starts empty", () => {
      render(<AgeCalculator />);
      const [birthInput] = getDateInputs();
      expect(birthInput.value).toBe("");
    });
  });

  describe("age calculation — happy path", () => {
    it("calculates age of ~35 years for birth date 1990-01-01", () => {
      render(<AgeCalculator />);
      const [birthInput] = getDateInputs();
      fireEvent.change(birthInput, { target: { value: "1990-01-01" } });
      expect(screen.getByText(/35 years/i)).toBeInTheDocument();
    });

    it("shows '35' in the Years only row", () => {
      render(<AgeCalculator />);
      const [birthInput] = getDateInputs();
      fireEvent.change(birthInput, { target: { value: "1990-01-01" } });
      expect(screen.getByText("35")).toBeInTheDocument();
    });

    it("shows next birthday countdown for a past birth date", () => {
      render(<AgeCalculator />);
      const [birthInput] = getDateInputs();
      fireEvent.change(birthInput, { target: { value: "1990-01-01" } });
      // Next birthday is Jan 1 2026 — shows "in X days"
      expect(screen.getByText(/in \d+ days/i)).toBeInTheDocument();
    });

    it("shows next birthday countdown for birthday on same month/day as reference date", () => {
      render(<AgeCalculator />);
      const [birthInput] = getDateInputs();
      // June 15 = same month/day as reference (today).
      // The component's daysUntilNextBirthday advances to next year when next <= ref,
      // so this shows "in N days" (next year's birthday)
      fireEvent.change(birthInput, { target: { value: "1990-06-15" } });
      expect(screen.getByText(/in \d+ days/i)).toBeInTheDocument();
    });

    it("shows Age, Total months, Total weeks, Total days, Next birthday rows", () => {
      render(<AgeCalculator />);
      const [birthInput] = getDateInputs();
      fireEvent.change(birthInput, { target: { value: "1990-01-01" } });
      expect(screen.getByText(/^age$/i)).toBeInTheDocument();
      expect(screen.getByText(/total months/i)).toBeInTheDocument();
      expect(screen.getByText(/total weeks/i)).toBeInTheDocument();
      expect(screen.getByText(/total days/i)).toBeInTheDocument();
      expect(screen.getByText(/next birthday/i)).toBeInTheDocument();
    });
  });

  describe("custom reference date", () => {
    it("recalculates age when reference date changes to 2020-01-01", () => {
      render(<AgeCalculator />);
      const [birthInput, refInput] = getDateInputs();
      fireEvent.change(birthInput, { target: { value: "2000-01-01" } });
      fireEvent.change(refInput, { target: { value: "2020-01-01" } });
      // Age should be exactly 20 years
      expect(screen.getByText(/20 years/i)).toBeInTheDocument();
    });
  });

  describe("validation", () => {
    it("shows error when birth date is after reference date", () => {
      render(<AgeCalculator />);
      const [birthInput] = getDateInputs();
      fireEvent.change(birthInput, { target: { value: "2030-01-01" } });
      expect(screen.getByText(/birthdate must be before/i)).toBeInTheDocument();
    });

    it("does not show results when birth date is in the future", () => {
      render(<AgeCalculator />);
      const [birthInput] = getDateInputs();
      fireEvent.change(birthInput, { target: { value: "2030-01-01" } });
      expect(screen.queryByText(/years only/i)).not.toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("handles leap year birthday (Feb 29 2000)", () => {
      render(<AgeCalculator />);
      const [birthInput] = getDateInputs();
      fireEvent.change(birthInput, { target: { value: "2000-02-29" } });
      // Should not crash and should show result rows
      expect(screen.getByText(/years only/i)).toBeInTheDocument();
    });

    it("handles same birth and reference date (age 0)", () => {
      render(<AgeCalculator />);
      const [birthInput] = getDateInputs();
      fireEvent.change(birthInput, { target: { value: "2025-06-15" } });
      expect(screen.getByText(/0 years/i)).toBeInTheDocument();
    });
  });

  describe("copy buttons", () => {
    it("renders copy buttons for each result row after calculation", () => {
      render(<AgeCalculator />);
      const [birthInput] = getDateInputs();
      fireEvent.change(birthInput, { target: { value: "1990-01-01" } });
      const copyBtns = screen.getAllByRole("button", { name: /copy/i });
      expect(copyBtns.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe("accessibility", () => {
    it("renders label text for date of birth", () => {
      render(<AgeCalculator />);
      expect(screen.getAllByText(/date of birth/i).length).toBeGreaterThanOrEqual(1);
    });

    it("renders label text for reference date", () => {
      render(<AgeCalculator />);
      expect(screen.getByText(/reference date/i)).toBeInTheDocument();
    });
  });
});
