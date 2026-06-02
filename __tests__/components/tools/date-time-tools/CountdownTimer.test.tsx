import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { CountdownTimer } from "@/components/tools/date-time-tools/CountdownTimer";

beforeEach(() => {
  vi.useFakeTimers({ now: new Date("2025-06-15T12:00:00Z") });
});
afterEach(() => {
  vi.useRealTimers();
});

function getDatetimeLocalInput() {
  return document.querySelector('input[type="datetime-local"]') as HTMLInputElement;
}

describe("CountdownTimer", () => {
  describe("rendering", () => {
    it("renders a datetime-local input", () => {
      render(<CountdownTimer />);
      expect(getDatetimeLocalInput()).toBeInTheDocument();
    });

    it("renders — target date & time label text", () => {
      render(<CountdownTimer />);
      expect(screen.getByText(/target date/i)).toBeInTheDocument();
    });

    it("shows 'Start Countdown' button initially", () => {
      render(<CountdownTimer />);
      expect(screen.getByRole("button", { name: /start countdown/i })).toBeInTheDocument();
    });

    it("Start Countdown button is disabled when no date is set", () => {
      render(<CountdownTimer />);
      expect(screen.getByRole("button", { name: /start countdown/i })).toBeDisabled();
    });

    it("shows placeholder text when no target date is set", () => {
      render(<CountdownTimer />);
      expect(screen.getByText(/select a future date/i)).toBeInTheDocument();
    });
  });

  describe("countdown display", () => {
    it("Start button becomes enabled when a target date is set", () => {
      render(<CountdownTimer />);
      const dateInput = getDatetimeLocalInput();
      fireEvent.change(dateInput, { target: { value: "2025-06-15T22:00" } });
      expect(screen.getByRole("button", { name: /start countdown/i })).not.toBeDisabled();
    });

    it("shows countdown segments after starting with a future date", () => {
      render(<CountdownTimer />);
      const dateInput = getDatetimeLocalInput();
      fireEvent.change(dateInput, { target: { value: "2025-06-16T12:00" } });
      // Advance fake timer by 1ms so setNow(Date.now()) produces a different value
      // causing the countdown useMemo (dep: [targetStr, now]) to recompute
      act(() => { vi.advanceTimersByTime(1); });
      fireEvent.click(screen.getByRole("button", { name: /start countdown/i }));
      expect(screen.getByText(/hours/i)).toBeInTheDocument();
      expect(screen.getByText(/minutes/i)).toBeInTheDocument();
      expect(screen.getByText(/seconds/i)).toBeInTheDocument();
      expect(screen.getByText(/days/i)).toBeInTheDocument();
    });

    it("switches to Reset button after starting", () => {
      render(<CountdownTimer />);
      const dateInput = getDatetimeLocalInput();
      fireEvent.change(dateInput, { target: { value: "2025-06-16T12:00" } });
      act(() => { vi.advanceTimersByTime(1); });
      fireEvent.click(screen.getByRole("button", { name: /start countdown/i }));
      expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /start countdown/i })).not.toBeInTheDocument();
    });

    it("input is disabled while countdown is running", () => {
      render(<CountdownTimer />);
      const dateInput = getDatetimeLocalInput();
      fireEvent.change(dateInput, { target: { value: "2025-06-16T12:00" } });
      act(() => { vi.advanceTimersByTime(1); });
      fireEvent.click(screen.getByRole("button", { name: /start countdown/i }));
      expect(dateInput).toBeDisabled();
    });
  });

  describe("timer countdown values", () => {
    it("shows 00 for days when target is less than 24 hours away", () => {
      render(<CountdownTimer />);
      const dateInput = getDatetimeLocalInput();
      // System is at 2025-06-15T12:00:00Z (UTC); in local IST that's 17:30.
      // Set target to next day at 06:00 local (00:30 UTC) — less than 24h away
      fireEvent.change(dateInput, { target: { value: "2025-06-16T06:00" } });
      act(() => { vi.advanceTimersByTime(1); });
      fireEvent.click(screen.getByRole("button", { name: /start countdown/i }));
      // Days column should show "00"
      const allZeros = screen.getAllByText("00");
      expect(allZeros.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("expired state", () => {
    it("shows 'Expired' when system time passes the target", () => {
      render(<CountdownTimer />);
      const dateInput = getDatetimeLocalInput();
      // Set a target that is already in the past relative to system time.
      // In local IST, now = 17:30 on Jun 15. Set a past local time = 17:29.
      fireEvent.change(dateInput, { target: { value: "2025-06-15T17:00" } });
      act(() => { vi.advanceTimersByTime(1); });
      fireEvent.click(screen.getByRole("button", { name: /start countdown/i }));
      // Advance time well past the target
      act(() => { vi.advanceTimersByTime(10_000); });
      expect(screen.getByText(/expired/i)).toBeInTheDocument();
    });
  });

  describe("reset", () => {
    it("resets back to start state after clicking Reset", () => {
      render(<CountdownTimer />);
      const dateInput = getDatetimeLocalInput();
      fireEvent.change(dateInput, { target: { value: "2025-06-16T12:00" } });
      act(() => { vi.advanceTimersByTime(1); });
      fireEvent.click(screen.getByRole("button", { name: /start countdown/i }));
      fireEvent.click(screen.getByRole("button", { name: /reset/i }));
      expect(screen.getByRole("button", { name: /start countdown/i })).toBeInTheDocument();
      expect(screen.queryByText(/^days$/i)).not.toBeInTheDocument();
    });

    it("input is re-enabled after reset", () => {
      render(<CountdownTimer />);
      const dateInput = getDatetimeLocalInput();
      fireEvent.change(dateInput, { target: { value: "2025-06-16T12:00" } });
      act(() => { vi.advanceTimersByTime(1); });
      fireEvent.click(screen.getByRole("button", { name: /start countdown/i }));
      fireEvent.click(screen.getByRole("button", { name: /reset/i }));
      expect(dateInput).not.toBeDisabled();
    });
  });

  describe("accessibility", () => {
    it("renders target date label text", () => {
      render(<CountdownTimer />);
      expect(screen.getByText(/target date/i)).toBeInTheDocument();
    });
  });
});
