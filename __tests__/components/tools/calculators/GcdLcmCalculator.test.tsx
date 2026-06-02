import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GcdLcmCalculator } from "@/components/tools/calculators/GcdLcmCalculator";

describe("GcdLcmCalculator — GCD mode", () => {
  describe("business logic", () => {
    it("computes GCD(12, 18) = 6", async () => {
      const user = userEvent.setup({ delay: null });
      render(<GcdLcmCalculator mode="gcd" />);
      await user.type(screen.getByRole("textbox"), "12, 18");
      await waitFor(() => {
        // The result span contains "6"; textarea contains "12, 18" — no ambiguity
        expect(screen.getByText("6")).toBeInTheDocument();
      });
    });

    it("computes GCD(7, 13) = 1 (coprimes)", async () => {
      const user = userEvent.setup({ delay: null });
      render(<GcdLcmCalculator mode="gcd" />);
      await user.type(screen.getByRole("textbox"), "7 13");
      await waitFor(() => {
        expect(screen.getByText("1")).toBeInTheDocument();
      });
    });

    it("computes GCD for three numbers: GCD(12, 18, 24) = 6", async () => {
      const user = userEvent.setup({ delay: null });
      render(<GcdLcmCalculator mode="gcd" />);
      await user.type(screen.getByRole("textbox"), "12 18 24");
      await waitFor(() => {
        // getByText("6") would match both textarea characters (unlikely since textarea has "12 18 24")
        // and the result span — result span will show 6
        expect(screen.getByText("6")).toBeInTheDocument();
      });
    });

    it("returns the single number when only one is entered", async () => {
      const user = userEvent.setup({ delay: null });
      render(<GcdLcmCalculator mode="gcd" />);
      await user.type(screen.getByRole("textbox"), "42");
      await waitFor(() => {
        // Both textarea and result span show "42"; pick the result span by role/class
        const matches = screen.getAllByText("42");
        // At least one match — the result span is present
        expect(matches.length).toBeGreaterThanOrEqual(1);
        // Confirm result span is among them
        const resultSpan = matches.find(
          (el) => el.tagName === "SPAN"
        );
        expect(resultSpan).toBeInTheDocument();
      });
    });

    it("shows step-by-step output", async () => {
      const user = userEvent.setup({ delay: null });
      render(<GcdLcmCalculator mode="gcd" />);
      await user.type(screen.getByRole("textbox"), "12, 18");
      await waitFor(() => {
        expect(screen.getByText(/GCD\(12, 18\) = 6/)).toBeInTheDocument();
      });
    });
  });

  describe("validation", () => {
    it("shows error message for non-integer input", async () => {
      const user = userEvent.setup({ delay: null });
      render(<GcdLcmCalculator mode="gcd" />);
      await user.type(screen.getByRole("textbox"), "abc xyz");
      await waitFor(() => {
        expect(screen.getByText(/No valid positive integers found/)).toBeInTheDocument();
      });
    });

    it("shows recognition count for valid input", async () => {
      const user = userEvent.setup({ delay: null });
      render(<GcdLcmCalculator mode="gcd" />);
      await user.type(screen.getByRole("textbox"), "12 18 24");
      await waitFor(() => {
        expect(screen.getByText(/3 numbers recognised/)).toBeInTheDocument();
      });
    });
  });

  describe("accessibility", () => {
    it("textarea has a label", () => {
      render(<GcdLcmCalculator mode="gcd" />);
      expect(screen.getByText(/numbers.*separated/i)).toBeInTheDocument();
    });
  });
});

describe("GcdLcmCalculator — LCM mode", () => {
  it("computes LCM(4, 6) = 12", async () => {
    const user = userEvent.setup({ delay: null });
    render(<GcdLcmCalculator mode="lcm" />);
    await user.type(screen.getByRole("textbox"), "4, 6");
    await waitFor(() => {
      expect(screen.getByText("12")).toBeInTheDocument();
    });
  });

  it("computes LCM(3, 5) = 15", async () => {
    const user = userEvent.setup({ delay: null });
    render(<GcdLcmCalculator mode="lcm" />);
    await user.type(screen.getByRole("textbox"), "3 5");
    await waitFor(() => {
      expect(screen.getByText("15")).toBeInTheDocument();
    });
  });

  it("computes LCM(2, 3, 4) = 12", async () => {
    const user = userEvent.setup({ delay: null });
    render(<GcdLcmCalculator mode="lcm" />);
    await user.type(screen.getByRole("textbox"), "2 3 4");
    await waitFor(() => {
      expect(screen.getByText("12")).toBeInTheDocument();
    });
  });

  it("shows LCM in heading when mode is lcm", () => {
    render(<GcdLcmCalculator mode="lcm" />);
    expect(screen.getByText(/Least Common Multiple/)).toBeInTheDocument();
  });
});
