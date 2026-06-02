import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DateGenerator } from "@/components/tools/date-time-tools/DateGenerator";

beforeEach(() => {
  vi.useFakeTimers({ now: new Date("2025-06-15T12:00:00Z") });
});
afterEach(() => {
  vi.useRealTimers();
});

function getDateInputs() {
  return Array.from(document.querySelectorAll('input[type="date"]')) as HTMLInputElement[];
}
function getCountInput() {
  return document.querySelector('input[type="number"]') as HTMLInputElement;
}
function getFmtSelect() {
  return document.querySelector("select") as HTMLSelectElement;
}

describe("DateGenerator", () => {
  describe("rendering", () => {
    it("renders two date inputs (start and end)", () => {
      render(<DateGenerator />);
      expect(getDateInputs()).toHaveLength(2);
    });

    it("renders — start date and — end date label texts", () => {
      render(<DateGenerator />);
      expect(screen.getByText(/— start date/i)).toBeInTheDocument();
      expect(screen.getByText(/— end date/i)).toBeInTheDocument();
    });

    it("renders count number input", () => {
      render(<DateGenerator />);
      expect(getCountInput()).toBeInTheDocument();
    });

    it("renders Random and Sequential mode buttons", () => {
      render(<DateGenerator />);
      expect(screen.getByRole("button", { name: /random/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /sequential/i })).toBeInTheDocument();
    });

    it("renders output format select", () => {
      render(<DateGenerator />);
      expect(getFmtSelect()).toBeInTheDocument();
    });

    it("renders Generate dates button", () => {
      render(<DateGenerator />);
      expect(screen.getByRole("button", { name: /generate dates/i })).toBeInTheDocument();
    });

    it("renders Weekdays only toggle button", () => {
      render(<DateGenerator />);
      expect(screen.getByRole("button", { name: /weekdays only/i })).toBeInTheDocument();
    });

    it("count input defaults to 10", () => {
      render(<DateGenerator />);
      expect(getCountInput().value).toBe("10");
    });
  });

  describe("sequential mode", () => {
    it("generates exactly 5 sequential dates when count is 5", () => {
      render(<DateGenerator />);
      const [startInput, endInput] = getDateInputs();
      fireEvent.change(startInput, { target: { value: "2025-01-01" } });
      fireEvent.change(endInput, { target: { value: "2025-12-31" } });
      fireEvent.change(getCountInput(), { target: { value: "5" } });
      fireEvent.click(screen.getByRole("button", { name: /sequential/i }));
      fireEvent.click(screen.getByRole("button", { name: /generate dates/i }));
      expect(screen.getByText(/5 dates generated/i)).toBeInTheDocument();
    });

    it("generates first 3 sequential dates starting from start date", () => {
      render(<DateGenerator />);
      const [startInput, endInput] = getDateInputs();
      fireEvent.change(startInput, { target: { value: "2025-03-01" } });
      fireEvent.change(endInput, { target: { value: "2025-03-31" } });
      fireEvent.change(getCountInput(), { target: { value: "3" } });
      fireEvent.click(screen.getByRole("button", { name: /sequential/i }));
      fireEvent.click(screen.getByRole("button", { name: /generate dates/i }));
      expect(screen.getByText("2025-03-01")).toBeInTheDocument();
      expect(screen.getByText("2025-03-02")).toBeInTheDocument();
      expect(screen.getByText("2025-03-03")).toBeInTheDocument();
    });

    it("shows '1 date generated' when count is 1", () => {
      render(<DateGenerator />);
      const [startInput, endInput] = getDateInputs();
      fireEvent.change(startInput, { target: { value: "2025-03-01" } });
      fireEvent.change(endInput, { target: { value: "2025-03-31" } });
      fireEvent.change(getCountInput(), { target: { value: "1" } });
      fireEvent.click(screen.getByRole("button", { name: /sequential/i }));
      fireEvent.click(screen.getByRole("button", { name: /generate dates/i }));
      expect(screen.getByText(/1 date generated/i)).toBeInTheDocument();
    });
  });

  describe("weekdays only", () => {
    it("excludes Saturday and Sunday when Weekdays only is toggled", () => {
      render(<DateGenerator />);
      const [startInput, endInput] = getDateInputs();
      // Mon Jun 16 to Sun Jun 22 = 5 weekdays + 2 weekend days
      fireEvent.change(startInput, { target: { value: "2025-06-16" } });
      fireEvent.change(endInput, { target: { value: "2025-06-22" } });
      fireEvent.change(getCountInput(), { target: { value: "10" } });
      fireEvent.click(screen.getByRole("button", { name: /weekdays only/i }));
      fireEvent.click(screen.getByRole("button", { name: /sequential/i }));
      fireEvent.click(screen.getByRole("button", { name: /generate dates/i }));
      // Sat Jun 21 and Sun Jun 22 must not appear
      expect(screen.queryByText("2025-06-21")).not.toBeInTheDocument();
      expect(screen.queryByText("2025-06-22")).not.toBeInTheDocument();
    });

    it("shows 'No dates match' when only weekends exist and weekdays-only is on", () => {
      render(<DateGenerator />);
      const [startInput, endInput] = getDateInputs();
      // Sat 2025-06-21 to Sun 2025-06-22 — only weekend days
      fireEvent.change(startInput, { target: { value: "2025-06-21" } });
      fireEvent.change(endInput, { target: { value: "2025-06-22" } });
      fireEvent.change(getCountInput(), { target: { value: "5" } });
      fireEvent.click(screen.getByRole("button", { name: /weekdays only/i }));
      fireEvent.click(screen.getByRole("button", { name: /sequential/i }));
      fireEvent.click(screen.getByRole("button", { name: /generate dates/i }));
      expect(screen.getByText(/no dates match/i)).toBeInTheDocument();
    });
  });

  describe("output formats", () => {
    it("generates dates in DD/MM/YYYY when selected", () => {
      render(<DateGenerator />);
      const [startInput, endInput] = getDateInputs();
      fireEvent.change(startInput, { target: { value: "2025-03-01" } });
      fireEvent.change(endInput, { target: { value: "2025-03-31" } });
      fireEvent.change(getCountInput(), { target: { value: "1" } });
      fireEvent.change(getFmtSelect(), { target: { value: "DD/MM/YYYY" } });
      fireEvent.click(screen.getByRole("button", { name: /sequential/i }));
      fireEvent.click(screen.getByRole("button", { name: /generate dates/i }));
      expect(screen.getByText("01/03/2025")).toBeInTheDocument();
    });

    it("generates dates in MM/DD/YYYY when selected", () => {
      render(<DateGenerator />);
      const [startInput, endInput] = getDateInputs();
      fireEvent.change(startInput, { target: { value: "2025-03-01" } });
      fireEvent.change(endInput, { target: { value: "2025-03-31" } });
      fireEvent.change(getCountInput(), { target: { value: "1" } });
      fireEvent.change(getFmtSelect(), { target: { value: "MM/DD/YYYY" } });
      fireEvent.click(screen.getByRole("button", { name: /sequential/i }));
      fireEvent.click(screen.getByRole("button", { name: /generate dates/i }));
      expect(screen.getByText("03/01/2025")).toBeInTheDocument();
    });
  });

  describe("validation", () => {
    it("shows error and disables Generate when start is after end", () => {
      render(<DateGenerator />);
      const [startInput, endInput] = getDateInputs();
      fireEvent.change(startInput, { target: { value: "2025-12-01" } });
      fireEvent.change(endInput, { target: { value: "2025-01-01" } });
      expect(screen.getByText(/start must be before end/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /generate dates/i })).toBeDisabled();
    });

    it("shows 'Minimum 1' error when count is 0", () => {
      render(<DateGenerator />);
      fireEvent.change(getCountInput(), { target: { value: "0" } });
      expect(screen.getByText(/minimum 1/i)).toBeInTheDocument();
    });

    it("shows 'Maximum 100' error when count exceeds 100", () => {
      render(<DateGenerator />);
      fireEvent.change(getCountInput(), { target: { value: "101" } });
      expect(screen.getByText(/maximum 100/i)).toBeInTheDocument();
    });
  });

  describe("copy all", () => {
    it("shows copy all button after generating dates", () => {
      render(<DateGenerator />);
      const [startInput, endInput] = getDateInputs();
      fireEvent.change(startInput, { target: { value: "2025-03-01" } });
      fireEvent.change(endInput, { target: { value: "2025-03-31" } });
      fireEvent.change(getCountInput(), { target: { value: "3" } });
      fireEvent.click(screen.getByRole("button", { name: /sequential/i }));
      fireEvent.click(screen.getByRole("button", { name: /generate dates/i }));
      expect(screen.getByRole("button", { name: /copy all/i })).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("caps generated count at pool size for small range in sequential mode", () => {
      render(<DateGenerator />);
      const [startInput, endInput] = getDateInputs();
      // 3-day range, request 100
      fireEvent.change(startInput, { target: { value: "2025-03-01" } });
      fireEvent.change(endInput, { target: { value: "2025-03-03" } });
      fireEvent.change(getCountInput(), { target: { value: "100" } });
      fireEvent.click(screen.getByRole("button", { name: /sequential/i }));
      fireEvent.click(screen.getByRole("button", { name: /generate dates/i }));
      // Only 3 dates available in range
      expect(screen.getByText(/3 dates generated/i)).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("renders — start date, — end date, — count label texts", () => {
      render(<DateGenerator />);
      expect(screen.getByText(/— start date/i)).toBeInTheDocument();
      expect(screen.getByText(/— end date/i)).toBeInTheDocument();
      expect(screen.getByText(/— count/i)).toBeInTheDocument();
    });
  });
});
