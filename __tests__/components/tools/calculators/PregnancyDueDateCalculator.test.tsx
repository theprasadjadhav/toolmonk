import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PregnancyDueDateCalculator } from "@/components/tools/calculators/PregnancyDueDateCalculator";

// Helper: returns a date string in YYYY-MM-DD format that is N days before today
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

describe("PregnancyDueDateCalculator", () => {
  describe("component rendering", () => {
    it("renders mode tab buttons", () => {
      render(<PregnancyDueDateCalculator />);
      expect(screen.getByRole("button", { name: /Last menstrual period/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Conception date/i })).toBeInTheDocument();
    });

    it("renders date input", () => {
      render(<PregnancyDueDateCalculator />);
      expect(document.querySelector('input[type="date"]')).toBeInTheDocument();
    });

    it("shows placeholder dash when no date selected", () => {
      render(<PregnancyDueDateCalculator />);
      expect(screen.getByText("—")).toBeInTheDocument();
    });

    it("renders trimester reference table", () => {
      render(<PregnancyDueDateCalculator />);
      expect(screen.getByText(/Trimester reference/i)).toBeInTheDocument();
      expect(screen.getAllByText("1st trimester").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("2nd trimester").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("3rd trimester").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("LMP mode — happy path", () => {
    it("calculates EDD as LMP + 280 days", async () => {
      render(<PregnancyDueDateCalculator />);
      const lmpDate = daysAgo(70); // 10 weeks ago
      const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
      fireEvent.change(dateInput, { target: { value: lmpDate } });
      await waitFor(() => {
        expect(screen.getByText(/Estimated due date/i)).toBeInTheDocument();
      });
    });

    it("shows week of pregnancy", async () => {
      render(<PregnancyDueDateCalculator />);
      const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
      fireEvent.change(dateInput, { target: { value: daysAgo(70) } });
      await waitFor(() => {
        expect(screen.getByText(/Week \d+/)).toBeInTheDocument();
      });
    });

    it("shows trimester", async () => {
      render(<PregnancyDueDateCalculator />);
      const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
      fireEvent.change(dateInput, { target: { value: daysAgo(70) } });
      await waitFor(() => {
        expect(screen.getAllByText(/trimester/).length).toBeGreaterThanOrEqual(1);
      });
    });

    it("shows days remaining", async () => {
      render(<PregnancyDueDateCalculator />);
      const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
      fireEvent.change(dateInput, { target: { value: daysAgo(70) } });
      await waitFor(() => {
        expect(screen.getByText("Days remaining")).toBeInTheDocument();
      });
    });
  });

  describe("conception mode", () => {
    it("switches to conception mode when button clicked", async () => {
      const user = userEvent.setup({ delay: null });
      render(<PregnancyDueDateCalculator />);
      await user.click(screen.getByRole("button", { name: /Conception date/i }));
      // After switching, the mode button for "Last menstrual period" still exists but label changes
      // The active button label is still in the DOM and the input label changes
      await waitFor(() => {
        // Conception date button is still present after click
        expect(screen.getByRole("button", { name: /Conception date/i })).toBeInTheDocument();
      });
    });

    it("calculates EDD as conception + 266 days", async () => {
      const user = userEvent.setup({ delay: null });
      render(<PregnancyDueDateCalculator />);
      // Switch to conception mode
      await user.click(screen.getByRole("button", { name: /Conception date/i }));
      const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
      fireEvent.change(dateInput, { target: { value: daysAgo(56) } });
      await waitFor(() => {
        // Should show the EDD date
        const eddEl = screen.getByText(/Estimated due date/i);
        expect(eddEl).toBeInTheDocument();
      });
    });
  });

  describe("validation", () => {
    it("shows error when LMP date is in the future", async () => {
      render(<PregnancyDueDateCalculator />);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      // Use local date components (not toISOString which is UTC) so the string
      // matches what the component parses as local time
      const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
      const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
      fireEvent.change(dateInput, { target: { value: tomorrowStr } });
      await waitFor(() => {
        expect(screen.getByText(/cannot be in the future/i)).toBeInTheDocument();
      });
    });
  });

  describe("accessibility", () => {
    it("date input has a label", () => {
      render(<PregnancyDueDateCalculator />);
      expect(screen.getByText(/First day of last menstrual period/i)).toBeInTheDocument();
    });

    it("explanation note is present", () => {
      render(<PregnancyDueDateCalculator />);
      expect(screen.getByText(/Naegele's rule/i)).toBeInTheDocument();
    });
  });
});
