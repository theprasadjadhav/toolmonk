import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { Stopwatch } from "@/components/tools/date-time-tools/Stopwatch";

// The Stopwatch uses Date.now() internally — freeze time so elapsed ms is predictable
beforeEach(() => {
  vi.useFakeTimers({ now: new Date("2025-06-15T12:00:00.000Z") });
});
afterEach(() => {
  vi.useRealTimers();
});

describe("Stopwatch", () => {
  describe("rendering", () => {
    it("renders with 00:00.00 display initially", () => {
      render(<Stopwatch />);
      expect(screen.getByText("00:00.00")).toBeInTheDocument();
    });

    it("renders Start button initially", () => {
      render(<Stopwatch />);
      expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();
    });

    it("renders Lap button initially", () => {
      render(<Stopwatch />);
      expect(screen.getByRole("button", { name: /lap/i })).toBeInTheDocument();
    });

    it("renders Reset button initially", () => {
      render(<Stopwatch />);
      expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
    });

    it("Lap button is disabled before starting", () => {
      render(<Stopwatch />);
      expect(screen.getByRole("button", { name: /lap/i })).toBeDisabled();
    });

    it("Reset button is not enabled (visually disabled) before starting — running is false so HTML disabled attr is absent", () => {
      render(<Stopwatch />);
      // The Reset button has disabled={running}, so initially running=false → not HTML-disabled.
      // It's only visually styled as disabled. This test verifies it exists in the DOM.
      expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
    });
  });

  describe("start / pause behavior", () => {
    it("shows Pause button after clicking Start", () => {
      render(<Stopwatch />);
      fireEvent.click(screen.getByRole("button", { name: /start/i }));
      expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /^start$/i })).not.toBeInTheDocument();
    });

    it("Lap button is enabled after starting", () => {
      render(<Stopwatch />);
      fireEvent.click(screen.getByRole("button", { name: /start/i }));
      expect(screen.getByRole("button", { name: /lap/i })).not.toBeDisabled();
    });

    it("shows Resume button after pausing", () => {
      render(<Stopwatch />);
      fireEvent.click(screen.getByRole("button", { name: /start/i }));
      // Advance time so displayMs > 0, otherwise pause leaves displayMs=0 and shows "Start"
      act(() => { vi.advanceTimersByTime(500); });
      fireEvent.click(screen.getByRole("button", { name: /pause/i }));
      expect(screen.getByRole("button", { name: /resume/i })).toBeInTheDocument();
    });

    it("timer display updates after advancing time", () => {
      render(<Stopwatch />);
      fireEvent.click(screen.getByRole("button", { name: /start/i }));

      // Advance 1 second
      act(() => { vi.advanceTimersByTime(1000); });

      // Display should no longer be 00:00.00 (it will show some elapsed time)
      const display = screen.queryByText("00:00.00");
      expect(display).not.toBeInTheDocument();
    });

    it("display shows ~1 second after advancing 1000ms", () => {
      render(<Stopwatch />);
      fireEvent.click(screen.getByRole("button", { name: /start/i }));
      act(() => { vi.advanceTimersByTime(1030); });
      // Should show 00:01.xx
      expect(screen.getByText(/^00:01\./)).toBeInTheDocument();
    });

    it("display shows ~1 minute after advancing 60000ms", () => {
      render(<Stopwatch />);
      fireEvent.click(screen.getByRole("button", { name: /start/i }));
      act(() => { vi.advanceTimersByTime(60_030); });
      // Should show 01:00.xx
      expect(screen.getByText(/^01:00\./)).toBeInTheDocument();
    });
  });

  describe("reset behavior", () => {
    it("resets display to 00:00.00 after start then reset", () => {
      render(<Stopwatch />);
      fireEvent.click(screen.getByRole("button", { name: /start/i }));
      act(() => { vi.advanceTimersByTime(2000); });
      fireEvent.click(screen.getByRole("button", { name: /pause/i }));
      fireEvent.click(screen.getByRole("button", { name: /reset/i }));
      expect(screen.getByText("00:00.00")).toBeInTheDocument();
    });

    it("clears laps after reset", () => {
      render(<Stopwatch />);
      fireEvent.click(screen.getByRole("button", { name: /start/i }));
      act(() => { vi.advanceTimersByTime(500); });
      fireEvent.click(screen.getByRole("button", { name: /lap/i }));
      fireEvent.click(screen.getByRole("button", { name: /pause/i }));
      fireEvent.click(screen.getByRole("button", { name: /reset/i }));
      expect(screen.queryByText(/lap times/i)).not.toBeInTheDocument();
    });

    it("shows Start button again after reset", () => {
      render(<Stopwatch />);
      fireEvent.click(screen.getByRole("button", { name: /start/i }));
      fireEvent.click(screen.getByRole("button", { name: /pause/i }));
      fireEvent.click(screen.getByRole("button", { name: /reset/i }));
      expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();
    });

    it("Reset is disabled while running", () => {
      render(<Stopwatch />);
      fireEvent.click(screen.getByRole("button", { name: /start/i }));
      expect(screen.getByRole("button", { name: /reset/i })).toBeDisabled();
    });
  });

  describe("lap functionality", () => {
    it("adds a lap row when Lap is clicked", () => {
      render(<Stopwatch />);
      fireEvent.click(screen.getByRole("button", { name: /start/i }));
      act(() => { vi.advanceTimersByTime(1000); });
      fireEvent.click(screen.getByRole("button", { name: /lap/i }));
      // Lap table header should appear
      expect(screen.getByText(/lap times/i)).toBeInTheDocument();
    });

    it("shows lap id 1 for first lap", () => {
      render(<Stopwatch />);
      fireEvent.click(screen.getByRole("button", { name: /start/i }));
      act(() => { vi.advanceTimersByTime(1000); });
      fireEvent.click(screen.getByRole("button", { name: /lap/i }));
      expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("shows fastest/slowest labels when there are 2+ laps", () => {
      render(<Stopwatch />);
      fireEvent.click(screen.getByRole("button", { name: /start/i }));

      // Lap 1 at 1s
      act(() => { vi.advanceTimersByTime(1000); });
      fireEvent.click(screen.getByRole("button", { name: /lap/i }));

      // Lap 2 at 2s
      act(() => { vi.advanceTimersByTime(2000); });
      fireEvent.click(screen.getByRole("button", { name: /lap/i }));

      expect(screen.getByText(/fastest/i)).toBeInTheDocument();
      expect(screen.getByText(/slowest/i)).toBeInTheDocument();
    });

    it("accumulates multiple laps", () => {
      render(<Stopwatch />);
      fireEvent.click(screen.getByRole("button", { name: /start/i }));
      act(() => { vi.advanceTimersByTime(500); });
      fireEvent.click(screen.getByRole("button", { name: /lap/i }));
      act(() => { vi.advanceTimersByTime(500); });
      fireEvent.click(screen.getByRole("button", { name: /lap/i }));
      act(() => { vi.advanceTimersByTime(500); });
      fireEvent.click(screen.getByRole("button", { name: /lap/i }));

      // Three laps: ids 1, 2, 3
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });

  describe("hours display", () => {
    it("shows HH:MM:SS.cs format after more than an hour", () => {
      render(<Stopwatch />);
      fireEvent.click(screen.getByRole("button", { name: /start/i }));
      // Advance 1 hour + 1 second
      act(() => { vi.advanceTimersByTime(3_601_030); });
      // Should show 01:00:01.xx format
      expect(screen.getByText(/^01:00:01\./)).toBeInTheDocument();
    });
  });
});
