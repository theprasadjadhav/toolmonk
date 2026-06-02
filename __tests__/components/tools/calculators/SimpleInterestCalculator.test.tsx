import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SimpleInterestCalculator } from "@/components/tools/calculators/SimpleInterestCalculator";

describe("SimpleInterestCalculator", () => {
  describe("business logic", () => {
    it("computes I = P*R*T/100 correctly", async () => {
      // P=1000, R=10%, T=2yrs → I=200
      const user = userEvent.setup({ delay: null });
      render(<SimpleInterestCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "1000");
      await user.type(inputs[1], "10");
      await user.type(inputs[2], "2");
      await waitFor(() => {
        expect(screen.getAllByText("200").length).toBeGreaterThanOrEqual(1);
      });
    });

    it("computes total amount A = P + I", async () => {
      // P=1000, R=10%, T=2yrs → A=1200
      const user = userEvent.setup({ delay: null });
      render(<SimpleInterestCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "1000");
      await user.type(inputs[1], "10");
      await user.type(inputs[2], "2");
      await waitFor(() => {
        expect(screen.getByText("1,200")).toBeInTheDocument();
      });
    });

    it("shows formula string", async () => {
      const user = userEvent.setup({ delay: null });
      render(<SimpleInterestCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "1000");
      await user.type(inputs[1], "10");
      await user.type(inputs[2], "2");
      await waitFor(() => {
        expect(screen.getByText(/I = P × R × T \/ 100/)).toBeInTheDocument();
      });
    });

    it("handles fractional rates: P=500, R=5.5%, T=3yrs → I=82.5", async () => {
      const user = userEvent.setup({ delay: null });
      render(<SimpleInterestCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "500");
      await user.type(inputs[1], "5.5");
      await user.type(inputs[2], "3");
      await waitFor(() => {
        expect(screen.getAllByText(/82\.5/).length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe("validation", () => {
    it("shows error for principal <= 0", async () => {
      const user = userEvent.setup({ delay: null });
      render(<SimpleInterestCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "0");
      await waitFor(() => {
        expect(screen.getByText("Must be > 0")).toBeInTheDocument();
      });
    });

    it("shows error for rate > 100%", async () => {
      const user = userEvent.setup({ delay: null });
      render(<SimpleInterestCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[1], "150");
      await waitFor(() => {
        expect(screen.getByText("Max 100%")).toBeInTheDocument();
      });
    });

    it("shows error for time > 100 years", async () => {
      const user = userEvent.setup({ delay: null });
      render(<SimpleInterestCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[2], "200");
      await waitFor(() => {
        expect(screen.getByText("Max 100 years")).toBeInTheDocument();
      });
    });

    it("shows dash when empty", () => {
      render(<SimpleInterestCalculator />);
      // Multiple dashes appear in the empty state result rows
      expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("copy button", () => {
    it("copies interest amount to clipboard", async () => {
      const user = userEvent.setup({ delay: null });
      render(<SimpleInterestCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "1000");
      await user.type(inputs[1], "10");
      await user.type(inputs[2], "1");
      await waitFor(() => screen.getAllByText("100"));
      await user.click(screen.getByRole("button", { name: /copy/i }));
      // Verify the clipboard received the value
      const clipText = await navigator.clipboard.readText();
      expect(clipText).toBe("100");
    });
  });

  describe("accessibility", () => {
    it("all inputs have labels", () => {
      render(<SimpleInterestCalculator />);
      // Labels include "— principal (P)", "— annual rate (R %) — ...", "— time (T years) — ..."
      expect(screen.getAllByText(/principal/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/annual rate/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/time.*years/i).length).toBeGreaterThanOrEqual(1);
    });

    it("result rows are labeled", async () => {
      const user = userEvent.setup({ delay: null });
      render(<SimpleInterestCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "1000");
      await user.type(inputs[1], "10");
      await user.type(inputs[2], "1");
      await waitFor(() => {
        expect(screen.getByText("Principal (P)")).toBeInTheDocument();
        expect(screen.getByText("Interest (I)")).toBeInTheDocument();
        expect(screen.getByText("Total Amount (A)")).toBeInTheDocument();
      });
    });
  });
});
