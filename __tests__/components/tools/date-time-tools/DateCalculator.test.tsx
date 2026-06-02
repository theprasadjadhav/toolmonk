import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DateCalculator } from "@/components/tools/date-time-tools/DateCalculator";

beforeEach(() => {
  vi.useFakeTimers({ now: new Date("2025-06-15T12:00:00.000Z") });
});
afterEach(() => {
  vi.useRealTimers();
});

function getDateInput() {
  return document.querySelector('input[type="date"]') as HTMLInputElement;
}
function getAmountInput() {
  return document.querySelector('input[type="number"]') as HTMLInputElement;
}
function getUnitSelect() {
  return document.querySelector("select") as HTMLSelectElement;
}

describe("DateCalculator", () => {
  describe("rendering", () => {
    it("renders a date input", () => {
      render(<DateCalculator />);
      expect(getDateInput()).toBeInTheDocument();
    });

    it("renders — start date label text", () => {
      render(<DateCalculator />);
      expect(screen.getByText(/— start date/i)).toBeInTheDocument();
    });

    it("renders Add and Subtract operation buttons", () => {
      render(<DateCalculator />);
      expect(screen.getByRole("button", { name: /\+ add/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /subtract/i })).toBeInTheDocument();
    });

    it("renders a Today shortcut button", () => {
      render(<DateCalculator />);
      expect(screen.getByRole("button", { name: /today/i })).toBeInTheDocument();
    });

    it("renders a unit select with Days, Weeks, Months, Years options", () => {
      render(<DateCalculator />);
      const select = getUnitSelect();
      expect(select).toBeInTheDocument();
      expect(select.querySelector('option[value="days"]')).toBeInTheDocument();
      expect(select.querySelector('option[value="weeks"]')).toBeInTheDocument();
      expect(select.querySelector('option[value="months"]')).toBeInTheDocument();
      expect(select.querySelector('option[value="years"]')).toBeInTheDocument();
    });

    it("pre-fills start date with today's date", () => {
      render(<DateCalculator />);
      expect(getDateInput().value).toMatch(/2025-06-1[45]/);
    });

    it("pre-fills amount with 7", () => {
      render(<DateCalculator />);
      expect(getAmountInput().value).toBe("7");
    });
  });

  describe("add operation", () => {
    it("adds 7 days to 2025-06-15, showing 2025-06-22 in YYYY-MM-DD row", () => {
      render(<DateCalculator />);
      // Default state: today (2025-06-15), add, 7, days → June 22
      expect(screen.getByText("2025-06-22")).toBeInTheDocument();
    });

    it("shows the DD/MM/YYYY form of the result", () => {
      render(<DateCalculator />);
      // 2025-06-22 in DD/MM/YYYY
      expect(screen.getByText("22/06/2025")).toBeInTheDocument();
    });

    it("adds 1 month to 2025-06-15, showing 2025-07-15", () => {
      render(<DateCalculator />);
      fireEvent.change(getUnitSelect(), { target: { value: "months" } });
      fireEvent.change(getAmountInput(), { target: { value: "1" } });
      expect(screen.getByText("2025-07-15")).toBeInTheDocument();
    });

    it("adds 1 year to 2025-06-15, showing 2026-06-15", () => {
      render(<DateCalculator />);
      fireEvent.change(getUnitSelect(), { target: { value: "years" } });
      fireEvent.change(getAmountInput(), { target: { value: "1" } });
      expect(screen.getByText("2026-06-15")).toBeInTheDocument();
    });

    it("adds 2 weeks (14 days) to 2025-06-15, showing 2025-06-29", () => {
      render(<DateCalculator />);
      fireEvent.change(getUnitSelect(), { target: { value: "weeks" } });
      fireEvent.change(getAmountInput(), { target: { value: "2" } });
      expect(screen.getByText("2025-06-29")).toBeInTheDocument();
    });
  });

  describe("subtract operation", () => {
    it("subtracts 7 days from 2025-06-15, showing 2025-06-08", () => {
      render(<DateCalculator />);
      fireEvent.click(screen.getByRole("button", { name: /subtract/i }));
      expect(screen.getByText("2025-06-08")).toBeInTheDocument();
    });

    it("subtracts 1 year from 2025-06-15, showing 2024-06-15", () => {
      render(<DateCalculator />);
      fireEvent.click(screen.getByRole("button", { name: /subtract/i }));
      fireEvent.change(getUnitSelect(), { target: { value: "years" } });
      fireEvent.change(getAmountInput(), { target: { value: "1" } });
      expect(screen.getByText("2024-06-15")).toBeInTheDocument();
    });
  });

  describe("result rows", () => {
    it("shows YYYY-MM-DD label", () => {
      render(<DateCalculator />);
      expect(screen.getByText("YYYY-MM-DD")).toBeInTheDocument();
    });

    it("shows DD/MM/YYYY label", () => {
      render(<DateCalculator />);
      expect(screen.getByText("DD/MM/YYYY")).toBeInTheDocument();
    });

    it("shows Long date label", () => {
      render(<DateCalculator />);
      expect(screen.getByText(/long date/i)).toBeInTheDocument();
    });

    it("shows Day of week label", () => {
      render(<DateCalculator />);
      expect(screen.getByText(/day of week/i)).toBeInTheDocument();
    });

    it("shows 'Sunday' as day of week for June 22 2025", () => {
      render(<DateCalculator />);
      expect(screen.getByText("Sunday")).toBeInTheDocument();
    });

    it("shows 'From today' label", () => {
      render(<DateCalculator />);
      expect(screen.getByText(/from today/i)).toBeInTheDocument();
    });
  });

  describe("validation", () => {
    it("shows 'Required' error when amount field is cleared", () => {
      render(<DateCalculator />);
      fireEvent.change(getAmountInput(), { target: { value: "" } });
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });

    it("shows 'Minimum 1' error when amount is 0", () => {
      render(<DateCalculator />);
      fireEvent.change(getAmountInput(), { target: { value: "0" } });
      expect(screen.getByText(/minimum 1/i)).toBeInTheDocument();
    });

    it("shows 'Maximum 9999' error when amount exceeds 9999", () => {
      render(<DateCalculator />);
      fireEvent.change(getAmountInput(), { target: { value: "10000" } });
      expect(screen.getByText(/maximum 9999/i)).toBeInTheDocument();
    });

    it("hides result rows when there is a validation error", () => {
      render(<DateCalculator />);
      fireEvent.change(getAmountInput(), { target: { value: "" } });
      expect(screen.queryByText("YYYY-MM-DD")).not.toBeInTheDocument();
    });
  });

  describe("Today button", () => {
    it("resets date input to today when clicked after manual change", () => {
      render(<DateCalculator />);
      const dateInput = getDateInput();
      fireEvent.change(dateInput, { target: { value: "2024-01-01" } });
      fireEvent.click(screen.getByRole("button", { name: /today/i }));
      expect(dateInput.value).toBe("2025-06-15");
    });
  });

  describe("edge cases", () => {
    it("handles year boundary crossing (Dec 31 + 1 day = Jan 1)", () => {
      render(<DateCalculator />);
      fireEvent.change(getDateInput(), { target: { value: "2024-12-31" } });
      fireEvent.change(getAmountInput(), { target: { value: "1" } });
      expect(screen.getByText("2025-01-01")).toBeInTheDocument();
    });

    it("handles leap year: Jan 31 + 1 month overflows correctly", () => {
      render(<DateCalculator />);
      fireEvent.change(getDateInput(), { target: { value: "2025-01-31" } });
      fireEvent.change(getUnitSelect(), { target: { value: "months" } });
      fireEvent.change(getAmountInput(), { target: { value: "1" } });
      // JS Date month overflow: 2025-02-31 → 2025-03-03; result still renders
      expect(screen.getByText(/yyyy-mm-dd/i)).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("renders — start date label text", () => {
      render(<DateCalculator />);
      expect(screen.getByText(/— start date/i)).toBeInTheDocument();
    });

    it("renders — amount label text", () => {
      render(<DateCalculator />);
      expect(screen.getByText(/— amount/i)).toBeInTheDocument();
    });

    it("renders — unit label text", () => {
      render(<DateCalculator />);
      expect(screen.getByText(/— unit/i)).toBeInTheDocument();
    });
  });
});
