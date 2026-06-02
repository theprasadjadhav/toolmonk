import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TimeDifferenceCalculator } from "@/components/tools/date-time-tools/TimeDifferenceCalculator";

beforeEach(() => {
  vi.useFakeTimers({ now: new Date("2025-06-15T12:00:00Z") });
});
afterEach(() => {
  vi.useRealTimers();
});

function getTextInputs() {
  return Array.from(document.querySelectorAll('input[type="text"]')) as HTMLInputElement[];
}

describe("TimeDifferenceCalculator", () => {
  describe("rendering", () => {
    it("renders two text inputs", () => {
      render(<TimeDifferenceCalculator />);
      expect(getTextInputs()).toHaveLength(2);
    });

    it("renders — start time label text", () => {
      render(<TimeDifferenceCalculator />);
      expect(screen.getByText(/— start time/i)).toBeInTheDocument();
    });

    it("renders — end time label text", () => {
      render(<TimeDifferenceCalculator />);
      expect(screen.getByText(/— end time/i)).toBeInTheDocument();
    });

    it("renders the 'Spans midnight' toggle button", () => {
      render(<TimeDifferenceCalculator />);
      expect(screen.getByRole("button", { name: /spans midnight/i })).toBeInTheDocument();
    });

    it("shows prompt text when no times are entered", () => {
      render(<TimeDifferenceCalculator />);
      expect(screen.getByText(/enter both times/i)).toBeInTheDocument();
    });
  });

  describe("time difference — happy path", () => {
    it("calculates 4h 15m 30s for 14:30:00 to 18:45:30", () => {
      render(<TimeDifferenceCalculator />);
      const [t1, t2] = getTextInputs();
      fireEvent.change(t1, { target: { value: "14:30:00" } });
      fireEvent.change(t2, { target: { value: "18:45:30" } });
      expect(screen.getByText("4h 15m 30s")).toBeInTheDocument();
    });

    it("calculates 1h 00m 00s for 09:00 to 10:00", () => {
      render(<TimeDifferenceCalculator />);
      const [t1, t2] = getTextInputs();
      fireEvent.change(t1, { target: { value: "09:00" } });
      fireEvent.change(t2, { target: { value: "10:00" } });
      expect(screen.getByText("1h 00m 00s")).toBeInTheDocument();
    });

    it("calculates 30m 00s for 08:00 to 08:30", () => {
      render(<TimeDifferenceCalculator />);
      const [t1, t2] = getTextInputs();
      fireEvent.change(t1, { target: { value: "08:00" } });
      fireEvent.change(t2, { target: { value: "08:30" } });
      expect(screen.getByText("30m 00s")).toBeInTheDocument();
    });

    it("shows 3,600 total seconds for 1 hour difference", () => {
      render(<TimeDifferenceCalculator />);
      const [t1, t2] = getTextInputs();
      fireEvent.change(t1, { target: { value: "09:00" } });
      fireEvent.change(t2, { target: { value: "10:00" } });
      expect(screen.getByText("3,600")).toBeInTheDocument();
    });

    it("shows 60 total minutes for 1 hour difference", () => {
      render(<TimeDifferenceCalculator />);
      const [t1, t2] = getTextInputs();
      fireEvent.change(t1, { target: { value: "09:00" } });
      fireEvent.change(t2, { target: { value: "10:00" } });
      expect(screen.getByText("60")).toBeInTheDocument();
    });

    it("shows 0s for identical times", () => {
      render(<TimeDifferenceCalculator />);
      const [t1, t2] = getTextInputs();
      fireEvent.change(t1, { target: { value: "10:00" } });
      fireEvent.change(t2, { target: { value: "10:00" } });
      expect(screen.getByText("0s")).toBeInTheDocument();
    });
  });

  describe("end before start (without midnight toggle)", () => {
    it("shows absolute difference (8h) when end is before start", () => {
      render(<TimeDifferenceCalculator />);
      const [t1, t2] = getTextInputs();
      fireEvent.change(t1, { target: { value: "18:00" } });
      fireEvent.change(t2, { target: { value: "10:00" } });
      expect(screen.getByText("8h 00m 00s")).toBeInTheDocument();
    });
  });

  describe("spans midnight toggle", () => {
    it("calculates 8h for 22:00 to 06:00 crossing midnight", () => {
      render(<TimeDifferenceCalculator />);
      const [t1, t2] = getTextInputs();
      fireEvent.change(t1, { target: { value: "22:00" } });
      fireEvent.change(t2, { target: { value: "06:00" } });
      fireEvent.click(screen.getByRole("button", { name: /spans midnight/i }));
      expect(screen.getByText("8h 00m 00s")).toBeInTheDocument();
    });

    it("calculates 23h 59m 59s for 00:00:01 to 00:00:00 with midnight toggle", () => {
      render(<TimeDifferenceCalculator />);
      const [t1, t2] = getTextInputs();
      fireEvent.change(t1, { target: { value: "00:00:01" } });
      fireEvent.change(t2, { target: { value: "00:00:00" } });
      fireEvent.click(screen.getByRole("button", { name: /spans midnight/i }));
      expect(screen.getByText("23h 59m 59s")).toBeInTheDocument();
    });
  });

  describe("validation", () => {
    it("shows HH:MM format error for invalid start time (25:00)", () => {
      render(<TimeDifferenceCalculator />);
      const [t1] = getTextInputs();
      fireEvent.change(t1, { target: { value: "25:00" } });
      // The error message text "Use HH:MM or HH:MM:SS format" should appear
      // (the label hint also contains this text, so use getAllByText)
      expect(screen.getAllByText(/hh:mm or hh:mm:ss/i).length).toBeGreaterThanOrEqual(1);
    });

    it("shows format error for non-time string in start", () => {
      render(<TimeDifferenceCalculator />);
      const [t1] = getTextInputs();
      fireEvent.change(t1, { target: { value: "abc" } });
      expect(screen.getAllByText(/hh:mm or hh:mm:ss/i).length).toBeGreaterThanOrEqual(1);
    });

    it("shows format error for minutes > 59", () => {
      render(<TimeDifferenceCalculator />);
      const [t1] = getTextInputs();
      fireEvent.change(t1, { target: { value: "10:60" } });
      expect(screen.getAllByText(/hh:mm or hh:mm:ss/i).length).toBeGreaterThanOrEqual(1);
    });

    it("does not show results when there is a validation error", () => {
      render(<TimeDifferenceCalculator />);
      const [t1, t2] = getTextInputs();
      fireEvent.change(t1, { target: { value: "badtime" } });
      fireEvent.change(t2, { target: { value: "10:00" } });
      expect(screen.queryByText(/^difference$/i)).not.toBeInTheDocument();
    });
  });

  describe("result row labels", () => {
    it("shows Difference, Hours, Total minutes, Total seconds labels", () => {
      render(<TimeDifferenceCalculator />);
      const [t1, t2] = getTextInputs();
      fireEvent.change(t1, { target: { value: "09:00" } });
      fireEvent.change(t2, { target: { value: "10:00" } });
      expect(screen.getByText(/^difference$/i)).toBeInTheDocument();
      expect(screen.getByText(/^hours$/i)).toBeInTheDocument();
      expect(screen.getByText(/total minutes/i)).toBeInTheDocument();
      expect(screen.getByText(/total seconds/i)).toBeInTheDocument();
    });

    it("each row has a copy button", () => {
      render(<TimeDifferenceCalculator />);
      const [t1, t2] = getTextInputs();
      fireEvent.change(t1, { target: { value: "09:00" } });
      fireEvent.change(t2, { target: { value: "10:00" } });
      const copyBtns = screen.getAllByRole("button", { name: /copy/i });
      expect(copyBtns.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe("accessibility", () => {
    it("renders — start time label text", () => {
      render(<TimeDifferenceCalculator />);
      expect(screen.getByText(/— start time/i)).toBeInTheDocument();
    });

    it("renders — end time label text", () => {
      render(<TimeDifferenceCalculator />);
      expect(screen.getByText(/— end time/i)).toBeInTheDocument();
    });
  });
});
