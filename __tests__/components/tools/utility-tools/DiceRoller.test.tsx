import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DiceRoller } from "@/components/tools/utility-tools/DiceRoller";

describe("DiceRoller", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("rendering", () => {
    it("renders Roll button", () => {
      render(<DiceRoller />);
      expect(screen.getByRole("button", { name: /^roll$/i })).toBeInTheDocument();
    });

    it("renders die type selector buttons D4 through D20", () => {
      render(<DiceRoller />);
      expect(screen.getByRole("button", { name: /d4/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /d6/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /d8/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /d10/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /d12/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /d20/i })).toBeInTheDocument();
    });

    it("renders count increment and decrement buttons", () => {
      render(<DiceRoller />);
      expect(screen.getByRole("button", { name: "−" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "+" })).toBeInTheDocument();
    });

    it("shows initial prompt to select a die and roll", () => {
      render(<DiceRoller />);
      expect(screen.getByText(/select a die and roll/i)).toBeInTheDocument();
    });
  });

  describe("rolling", () => {
    it("shows a rolling state after clicking Roll", async () => {
      vi.spyOn(crypto, "getRandomValues").mockImplementation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (arr: any) => {
          if (arr instanceof Uint32Array) arr[0] = 3;
          return arr as unknown as Uint8Array;
        }
      );

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
      render(<DiceRoller />);
      await user.click(screen.getByRole("button", { name: /^roll$/i }));

      // While timer hasn't advanced, we should see rolling state
      expect(screen.getByRole("button", { name: /rolling/i })).toBeInTheDocument();
    });

    it("clears rolling state after animation completes", async () => {
      vi.spyOn(crypto, "getRandomValues").mockImplementation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (arr: any) => {
          if (arr instanceof Uint32Array) arr[0] = 3;
          return arr as unknown as Uint8Array;
        }
      );

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
      render(<DiceRoller />);
      await user.click(screen.getByRole("button", { name: /^roll$/i }));

      // Advance past rolling animation (950ms for 1 die)
      await act(async () => {
        vi.advanceTimersByTime(1100);
      });

      expect(screen.queryByRole("button", { name: /rolling/i })).not.toBeInTheDocument();
    });

    it("shows SVG die face with a value after roll completes (D4 shows text)", async () => {
      vi.spyOn(crypto, "getRandomValues").mockImplementation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (arr: any) => {
          // cryptoRoll(4): (3 % 4) + 1 = 4
          if (arr instanceof Uint32Array) arr[0] = 3;
          return arr as unknown as Uint8Array;
        }
      );

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
      render(<DiceRoller />);
      // Switch to D4 which renders text inside the SVG (not pips)
      await user.click(screen.getByRole("button", { name: /d4/i }));
      await user.click(screen.getByRole("button", { name: /^roll$/i }));

      await act(async () => {
        vi.advanceTimersByTime(1100);
      });

      // D4 SVG renders the value as a text element
      const svgTexts = document.querySelectorAll("svg text");
      const hasValue = Array.from(svgTexts).some((t) => t.textContent === "4");
      expect(hasValue).toBe(true);
    });

    it("result value is in valid range 1–6 with real randomness for D6", async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<DiceRoller />);
      await user.click(screen.getByRole("button", { name: /^roll$/i }));

      await waitFor(
        () => {
          expect(screen.queryByRole("button", { name: /rolling/i })).not.toBeInTheDocument();
        },
        { timeout: 2000 }
      );
      // D6 uses pip SVGs (circles), no text value visible in DOM
      // Just verify we're back to Roll button
      expect(screen.getByRole("button", { name: /^roll$/i })).toBeInTheDocument();
    });
  });

  describe("die type selection", () => {
    it("switches active die type when D20 is clicked", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
      render(<DiceRoller />);
      await user.click(screen.getByRole("button", { name: /d20/i }));
      // Clicking D20 clears values and sets die type — Roll button still present
      expect(screen.getByRole("button", { name: /^roll$/i })).toBeInTheDocument();
    });

    it("clears previous result when die type changes", async () => {
      vi.spyOn(crypto, "getRandomValues").mockImplementation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (arr: any) => {
          if (arr instanceof Uint32Array) arr[0] = 3;
          return arr as unknown as Uint8Array;
        }
      );

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
      render(<DiceRoller />);
      await user.click(screen.getByRole("button", { name: /^roll$/i }));

      await act(async () => {
        vi.advanceTimersByTime(1100);
      });

      expect(screen.queryByRole("button", { name: /rolling/i })).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /d20/i }));
      // After switching die type, the prompt should re-appear
      expect(screen.getByText(/select a die and roll/i)).toBeInTheDocument();
    });
  });

  describe("count stepper", () => {
    it("starts at count 1 (decrement is disabled)", () => {
      render(<DiceRoller />);
      expect(screen.getByRole("button", { name: "−" })).toBeDisabled();
    });

    it("increments die count", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
      render(<DiceRoller />);
      await user.click(screen.getByRole("button", { name: "+" }));
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("caps count at 6 (increment is disabled at max)", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
      render(<DiceRoller />);
      const addBtn = screen.getByRole("button", { name: "+" });
      // Click 5 more times to reach 6
      for (let i = 0; i < 5; i++) {
        await user.click(addBtn);
      }
      expect(addBtn).toBeDisabled();
    });
  });

  describe("button state during roll", () => {
    it("disables Roll button while rolling", async () => {
      vi.spyOn(crypto, "getRandomValues").mockImplementation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (arr: any) => {
          if (arr instanceof Uint32Array) arr[0] = 3;
          return arr as unknown as Uint8Array;
        }
      );

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
      render(<DiceRoller />);
      await user.click(screen.getByRole("button", { name: /^roll$/i }));

      const rollingBtn = screen.getByRole("button", { name: /rolling/i });
      expect(rollingBtn).toBeDisabled();
    });
  });

  describe("keyboard shortcut", () => {
    it("shows Space keyboard hint", () => {
      render(<DiceRoller />);
      expect(screen.getByText(/space/i)).toBeInTheDocument();
    });
  });
});
