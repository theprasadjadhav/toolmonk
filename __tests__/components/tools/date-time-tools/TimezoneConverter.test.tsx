import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TimezoneConverter } from "@/components/tools/shared/date-time/TimezoneConverter";

beforeEach(() => {
  vi.useFakeTimers({ now: new Date("2025-06-15T12:00:00Z") });
});
afterEach(() => {
  vi.useRealTimers();
});

function getDatetimeLocalInput() {
  return document.querySelector('input[type="datetime-local"]') as HTMLInputElement;
}
function getSearchInput() {
  return document.querySelector('input[type="text"]') as HTMLInputElement;
}

describe("TimezoneConverter", () => {
  describe("rendering", () => {
    it("renders a datetime-local input", () => {
      render(<TimezoneConverter />);
      expect(getDatetimeLocalInput()).toBeInTheDocument();
    });

    it("renders — date & time (local input) label text", () => {
      render(<TimezoneConverter />);
      expect(screen.getByText(/date.*time.*local input/i)).toBeInTheDocument();
    });

    it("renders a filter timezones text input", () => {
      render(<TimezoneConverter />);
      expect(getSearchInput()).toBeInTheDocument();
    });

    it("renders — filter timezones label text", () => {
      render(<TimezoneConverter />);
      expect(screen.getByText(/filter timezones/i)).toBeInTheDocument();
    });

    it("renders 'Use now' button", () => {
      render(<TimezoneConverter />);
      expect(screen.getByRole("button", { name: /use now/i })).toBeInTheDocument();
    });

    it("shows UTC, New York, and Tokyo rows on initial render", () => {
      render(<TimezoneConverter />);
      // Use getAllByText since each timezone has both a label and IANA name span
      expect(screen.getAllByText(/UTC/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/new york/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/tokyo/i).length).toBeGreaterThanOrEqual(1);
    });

    it("shows — converted times heading", () => {
      render(<TimezoneConverter />);
      expect(screen.getByText(/converted times/i)).toBeInTheDocument();
    });
  });

  describe("timezone conversion correctness", () => {
    it("UTC row shows GMT offset in January", () => {
      render(<TimezoneConverter />);
      fireEvent.change(getDatetimeLocalInput(), { target: { value: "2025-01-15T12:00" } });
      // UTC uses "GMT" (or "GMT+0") — verify at least one converted time is shown
      // The component renders Intl.DateTimeFormat with shortOffset (e.g. GMT, GMT-5, GMT+9)
      const allGMT = screen.getAllByText(/GMT/);
      expect(allGMT.length).toBeGreaterThan(0);
    });

    it("New York row shows negative GMT offset in January (EST = GMT-5)", () => {
      render(<TimezoneConverter />);
      fireEvent.change(getDatetimeLocalInput(), { target: { value: "2025-01-15T12:00" } });
      // New York in January (EST) shows GMT-5
      const allNeg5 = screen.getAllByText(/GMT-5/);
      expect(allNeg5.length).toBeGreaterThan(0);
    });

    it("Tokyo row shows GMT+9 offset (JST — no DST)", () => {
      render(<TimezoneConverter />);
      fireEvent.change(getDatetimeLocalInput(), { target: { value: "2025-01-15T12:00" } });
      const allPlus9 = screen.getAllByText(/GMT\+9/);
      expect(allPlus9.length).toBeGreaterThan(0);
    });

    it("India row shows GMT+5:30 offset (IST — no DST)", () => {
      render(<TimezoneConverter />);
      fireEvent.change(getDatetimeLocalInput(), { target: { value: "2025-01-15T12:00" } });
      const allIST = screen.getAllByText(/GMT\+5:30/);
      expect(allIST.length).toBeGreaterThan(0);
    });

    it("conversion updates when datetime input changes", () => {
      render(<TimezoneConverter />);
      fireEvent.change(getDatetimeLocalInput(), { target: { value: "2025-01-15T00:00" } });
      // Rows should still be visible
      expect(screen.getAllByText(/UTC/i).length).toBeGreaterThanOrEqual(1);
      // Change to a different time
      fireEvent.change(getDatetimeLocalInput(), { target: { value: "2025-01-15T23:00" } });
      expect(screen.getAllByText(/UTC/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("filter functionality", () => {
    it("filters timezone rows by city name (london)", () => {
      render(<TimezoneConverter />);
      fireEvent.change(getSearchInput(), { target: { value: "london" } });
      // Both the label "London (GMT/BST)" and IANA "Europe/London" will match /london/i
      expect(screen.getAllByText(/london/i).length).toBeGreaterThanOrEqual(1);
      // Tokyo should not appear
      expect(screen.queryByText(/^Tokyo$/i)).not.toBeInTheDocument();
    });

    it("filters by timezone IANA identifier (Sydney)", () => {
      render(<TimezoneConverter />);
      fireEvent.change(getSearchInput(), { target: { value: "sydney" } });
      expect(screen.getAllByText(/sydney/i).length).toBeGreaterThanOrEqual(1);
    });

    it("shows all zones again when filter is cleared", () => {
      render(<TimezoneConverter />);
      fireEvent.change(getSearchInput(), { target: { value: "tokyo" } });
      fireEvent.change(getSearchInput(), { target: { value: "" } });
      expect(screen.getAllByText(/UTC/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/tokyo/i).length).toBeGreaterThanOrEqual(1);
    });

    it("shows no rows for a filter that matches nothing", () => {
      render(<TimezoneConverter />);
      fireEvent.change(getSearchInput(), { target: { value: "zzznomatch" } });
      expect(screen.queryByText(/^UTC$/)).not.toBeInTheDocument();
    });

    it("filter is case-insensitive (LONDON matches London)", () => {
      render(<TimezoneConverter />);
      fireEvent.change(getSearchInput(), { target: { value: "LONDON" } });
      // Both the label and IANA name will be present; use getAllByText
      expect(screen.getAllByText(/london/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Use now button", () => {
    it("restores timezone rows after clicking Use now", () => {
      render(<TimezoneConverter />);
      fireEvent.change(getDatetimeLocalInput(), { target: { value: "2020-01-01T00:00" } });
      fireEvent.click(screen.getByRole("button", { name: /use now/i }));
      expect(screen.getByText(/converted times/i)).toBeInTheDocument();
    });
  });

  describe("copy buttons", () => {
    it("renders one copy button per timezone row (at least 33)", () => {
      render(<TimezoneConverter />);
      const copyBtns = screen.getAllByRole("button", { name: /copy/i });
      // 33 timezones in the list
      expect(copyBtns.length).toBeGreaterThanOrEqual(33);
    });

    it("shows only one copy button after filtering to a single timezone", () => {
      render(<TimezoneConverter />);
      fireEvent.change(getSearchInput(), { target: { value: "Tokyo" } });
      const copyBtns = screen.getAllByRole("button", { name: /copy/i });
      expect(copyBtns).toHaveLength(1);
    });
  });

  describe("accessibility", () => {
    it("renders — date & time (local input) label text", () => {
      render(<TimezoneConverter />);
      expect(screen.getByText(/date.*time.*local input/i)).toBeInTheDocument();
    });

    it("renders — filter timezones label text", () => {
      render(<TimezoneConverter />);
      expect(screen.getByText(/filter timezones/i)).toBeInTheDocument();
    });
  });
});
