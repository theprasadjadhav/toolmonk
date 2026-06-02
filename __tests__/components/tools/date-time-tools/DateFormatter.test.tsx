import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DateFormatter } from "@/components/tools/date-time-tools/DateFormatter";

beforeEach(() => {
  vi.useFakeTimers({ now: new Date("2025-06-15T12:00:00.000Z") });
});
afterEach(() => {
  vi.useRealTimers();
});

function getDatetimeLocalInput() {
  return document.querySelector('input[type="datetime-local"]') as HTMLInputElement;
}

describe("DateFormatter", () => {
  describe("rendering", () => {
    it("renders a datetime-local input", () => {
      render(<DateFormatter />);
      expect(getDatetimeLocalInput()).toBeInTheDocument();
    });

    it("renders — date & time label text", () => {
      render(<DateFormatter />);
      expect(screen.getByText(/— date.*time/i)).toBeInTheDocument();
    });

    it("renders a 'Use now' button", () => {
      render(<DateFormatter />);
      expect(screen.getByRole("button", { name: /use now/i })).toBeInTheDocument();
    });

    it("shows — formats section on initial render (input is pre-filled)", () => {
      render(<DateFormatter />);
      expect(screen.getByText(/— formats/i)).toBeInTheDocument();
    });
  });

  describe("format label rows", () => {
    it("shows YYYY-MM-DD label", () => {
      render(<DateFormatter />);
      expect(screen.getByText("YYYY-MM-DD")).toBeInTheDocument();
    });

    it("shows DD/MM/YYYY label", () => {
      render(<DateFormatter />);
      expect(screen.getByText("DD/MM/YYYY")).toBeInTheDocument();
    });

    it("shows MM/DD/YYYY label", () => {
      render(<DateFormatter />);
      expect(screen.getByText("MM/DD/YYYY")).toBeInTheDocument();
    });

    it("shows ISO 8601 label", () => {
      render(<DateFormatter />);
      expect(screen.getByText("ISO 8601")).toBeInTheDocument();
    });

    it("shows RFC 2822 label", () => {
      render(<DateFormatter />);
      expect(screen.getByText("RFC 2822")).toBeInTheDocument();
    });

    it("shows Unix (seconds) label", () => {
      render(<DateFormatter />);
      expect(screen.getByText("Unix (seconds)")).toBeInTheDocument();
    });

    it("shows Unix (ms) label", () => {
      render(<DateFormatter />);
      expect(screen.getByText("Unix (ms)")).toBeInTheDocument();
    });

    it("shows Quarter label", () => {
      render(<DateFormatter />);
      expect(screen.getByText("Quarter")).toBeInTheDocument();
    });

    it("shows Week of year label", () => {
      render(<DateFormatter />);
      expect(screen.getByText("Week of year")).toBeInTheDocument();
    });
  });

  describe("format value correctness", () => {
    it("formats 2024-01-15 as YYYY-MM-DD: 2024-01-15", () => {
      render(<DateFormatter />);
      fireEvent.change(getDatetimeLocalInput(), { target: { value: "2024-01-15T00:00" } });
      expect(screen.getByText("2024-01-15")).toBeInTheDocument();
    });

    it("formats 2024-01-15 as DD/MM/YYYY: 15/01/2024", () => {
      render(<DateFormatter />);
      fireEvent.change(getDatetimeLocalInput(), { target: { value: "2024-01-15T00:00" } });
      expect(screen.getByText("15/01/2024")).toBeInTheDocument();
    });

    it("formats 2024-01-15 as MM/DD/YYYY: 01/15/2024", () => {
      render(<DateFormatter />);
      fireEvent.change(getDatetimeLocalInput(), { target: { value: "2024-01-15T00:00" } });
      expect(screen.getByText("01/15/2024")).toBeInTheDocument();
    });

    it("shows Q1 for January", () => {
      render(<DateFormatter />);
      fireEvent.change(getDatetimeLocalInput(), { target: { value: "2025-01-01T00:00" } });
      expect(screen.getByText("Q1")).toBeInTheDocument();
    });

    it("shows Q4 for December", () => {
      render(<DateFormatter />);
      fireEvent.change(getDatetimeLocalInput(), { target: { value: "2025-12-01T00:00" } });
      expect(screen.getByText("Q4")).toBeInTheDocument();
    });

    it("shows Q2 for April", () => {
      render(<DateFormatter />);
      fireEvent.change(getDatetimeLocalInput(), { target: { value: "2025-04-01T00:00" } });
      expect(screen.getByText("Q2")).toBeInTheDocument();
    });

    it("shows Monday for 2025-06-09 (known Monday)", () => {
      render(<DateFormatter />);
      fireEvent.change(getDatetimeLocalInput(), { target: { value: "2025-06-09T00:00" } });
      expect(screen.getByText("Monday")).toBeInTheDocument();
    });
  });

  describe("leap year edge case", () => {
    it("shows Feb 29 correctly in a leap year", () => {
      render(<DateFormatter />);
      fireEvent.change(getDatetimeLocalInput(), { target: { value: "2024-02-29T00:00" } });
      expect(screen.getByText("2024-02-29")).toBeInTheDocument();
    });
  });

  describe("Use now button", () => {
    it("updates the input to the current date after clicking Use now", () => {
      render(<DateFormatter />);
      const input = getDatetimeLocalInput();
      fireEvent.change(input, { target: { value: "2020-01-01T00:00" } });
      fireEvent.click(screen.getByRole("button", { name: /use now/i }));
      // Input should now reflect current year
      expect(input.value).toMatch(/2025/);
    });
  });

  describe("copy buttons", () => {
    it("renders at least 10 copy buttons (one per format row)", () => {
      render(<DateFormatter />);
      const copyBtns = screen.getAllByRole("button", { name: /copy/i });
      expect(copyBtns.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe("accessibility", () => {
    it("renders — date & time label text in the DOM", () => {
      render(<DateFormatter />);
      expect(screen.getByText(/— date.*time/i)).toBeInTheDocument();
    });
  });
});
