import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { RelativeTimeFormatter } from "@/components/tools/date-time-tools/RelativeTimeFormatter";

beforeEach(() => {
  vi.useFakeTimers({ now: new Date("2025-06-15T12:00:00Z") });
});
afterEach(() => {
  vi.useRealTimers();
});

function getDatetimeLocalInput() {
  return document.querySelector('input[type="datetime-local"]') as HTMLInputElement;
}

describe("RelativeTimeFormatter", () => {
  describe("rendering", () => {
    it("renders a datetime-local input", () => {
      render(<RelativeTimeFormatter />);
      expect(getDatetimeLocalInput()).toBeInTheDocument();
    });

    it("renders — date & time to convert label text", () => {
      render(<RelativeTimeFormatter />);
      expect(screen.getByText(/date.*time.*convert/i)).toBeInTheDocument();
    });

    it("renders 'Use now' button", () => {
      render(<RelativeTimeFormatter />);
      expect(screen.getByRole("button", { name: /use now/i })).toBeInTheDocument();
    });

    it("shows auto-update notice text", () => {
      render(<RelativeTimeFormatter />);
      expect(screen.getByText(/update automatically/i)).toBeInTheDocument();
    });

    it("shows result rows on initial render (input is pre-filled)", () => {
      render(<RelativeTimeFormatter />);
      expect(screen.getByText(/^relative$/i)).toBeInTheDocument();
    });
  });

  describe("relative time logic", () => {
    it("shows 'now' or 'this second' when target equals current time", () => {
      render(<RelativeTimeFormatter />);
      // Default input = now, so relative result should be "now" or "this second"
      // Use getAllByText since "Use now" button also contains "now"
      const nowElements = screen.getAllByText(/^now$|this second/i);
      expect(nowElements.length).toBeGreaterThanOrEqual(1);
    });

    it("shows '2 days ago' for a date 2 days in the past", () => {
      render(<RelativeTimeFormatter />);
      fireEvent.change(getDatetimeLocalInput(), { target: { value: "2025-06-13T12:00" } });
      expect(screen.getByText(/2 days ago/i)).toBeInTheDocument();
    });

    it("shows 'in 3 days' for a date 3 days in the future", () => {
      render(<RelativeTimeFormatter />);
      fireEvent.change(getDatetimeLocalInput(), { target: { value: "2025-06-18T12:00" } });
      expect(screen.getByText(/in 3 days/i)).toBeInTheDocument();
    });

    it("shows result rows for a date ~60 days in the past", () => {
      render(<RelativeTimeFormatter />);
      // 60 days ago — verifies result rows still show
      fireEvent.change(getDatetimeLocalInput(), { target: { value: "2025-04-15T12:00" } });
      // Check the exact label text "Relative" in the results section
      expect(screen.getByText(/^relative$/i)).toBeInTheDocument();
    });

    it("shows result rows for a date ~2 years in the past", () => {
      render(<RelativeTimeFormatter />);
      // 2 years ago — verifies result rows still show
      fireEvent.change(getDatetimeLocalInput(), { target: { value: "2023-06-15T12:00" } });
      expect(screen.getByText(/^relative$/i)).toBeInTheDocument();
    });

    it("shows 'from now' in the exact breakdown for a future date", () => {
      render(<RelativeTimeFormatter />);
      fireEvent.change(getDatetimeLocalInput(), { target: { value: "2025-06-16T12:00" } });
      expect(screen.getByText(/from now/i)).toBeInTheDocument();
    });

    it("shows 'ago' in the exact breakdown for a past date", () => {
      render(<RelativeTimeFormatter />);
      fireEvent.change(getDatetimeLocalInput(), { target: { value: "2025-06-14T12:00" } });
      expect(screen.getByText(/ ago$/i)).toBeInTheDocument();
    });
  });

  describe("result row labels", () => {
    it("shows Relative, Exact breakdown, Input date, Reference (now), Total seconds", () => {
      render(<RelativeTimeFormatter />);
      expect(screen.getByText(/^relative$/i)).toBeInTheDocument();
      expect(screen.getByText(/exact breakdown/i)).toBeInTheDocument();
      expect(screen.getByText(/input date/i)).toBeInTheDocument();
      expect(screen.getByText(/reference.*now/i)).toBeInTheDocument();
      expect(screen.getByText(/total seconds/i)).toBeInTheDocument();
    });
  });

  describe("auto-update behavior", () => {
    it("still shows result rows after system time advances 1 second", () => {
      render(<RelativeTimeFormatter />);
      act(() => { vi.advanceTimersByTime(1000); });
      expect(screen.getByText(/total seconds/i)).toBeInTheDocument();
    });
  });

  describe("Use now button", () => {
    it("resets relative output to 'now' after changing the input", () => {
      render(<RelativeTimeFormatter />);
      fireEvent.change(getDatetimeLocalInput(), { target: { value: "2020-01-01T00:00" } });
      fireEvent.click(screen.getByRole("button", { name: /use now/i }));
      // "now" appears in the Relative row value; "Use now" button also has "now"
      const nowElements = screen.getAllByText(/^now$|this second/i);
      expect(nowElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("copy buttons", () => {
    it("renders at least 5 copy buttons (one per result row)", () => {
      render(<RelativeTimeFormatter />);
      const copyBtns = screen.getAllByRole("button", { name: /copy/i });
      expect(copyBtns.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe("accessibility", () => {
    it("renders — date & time to convert label text", () => {
      render(<RelativeTimeFormatter />);
      expect(screen.getByText(/date.*time.*convert/i)).toBeInTheDocument();
    });
  });
});
