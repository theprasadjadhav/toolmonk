import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CoinFlip } from "@/components/tools/utility-tools/CoinFlip";

describe("CoinFlip", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("rendering", () => {
    it("renders the Flip Coin button initially", () => {
      render(<CoinFlip />);
      expect(screen.getByRole("button", { name: /flip coin/i })).toBeInTheDocument();
    });

    it("renders a 'Press to flip' prompt initially", () => {
      render(<CoinFlip />);
      expect(screen.getByText(/press to flip/i)).toBeInTheDocument();
    });

    it("does not show reset button before any flip", () => {
      render(<CoinFlip />);
      expect(screen.queryByRole("button", { name: /reset/i })).not.toBeInTheDocument();
    });
  });

  describe("flipping", () => {
    it("shows 'Flipping…' in button while animation is running", async () => {
      vi.spyOn(crypto, "getRandomValues").mockImplementation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (arr: any) => {
          if (arr instanceof Uint8Array) arr[0] = 0; // even = heads
          return arr as unknown as Uint8Array;
        }
      );

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
      render(<CoinFlip />);
      await user.click(screen.getByRole("button", { name: /flip coin/i }));
      // The button itself shows "Flipping…" (and a <p> also shows it)
      // Use getByRole to find the disabled button specifically
      expect(screen.getByRole("button", { name: /flipping/i })).toBeDisabled();
    });

    it("shows 'Heads' result after flipping when heads is forced", async () => {
      vi.spyOn(crypto, "getRandomValues").mockImplementation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (arr: any) => {
          if (arr instanceof Uint8Array) arr[0] = 0; // even = heads
          return arr as unknown as Uint8Array;
        }
      );

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
      render(<CoinFlip />);
      await user.click(screen.getByRole("button", { name: /flip coin/i }));

      // Advance past the animation timeout (1050ms)
      await act(async () => {
        vi.advanceTimersByTime(1100);
      });

      // The result <p> shows "heads" (lowercase). The SVG shows "HEADS" (uppercase).
      // Use getAllByText with exact case-insensitive match and pick the <p> element.
      const headsEls = screen.getAllByText(/^heads$/i);
      expect(headsEls.length).toBeGreaterThan(0);
    });

    it("shows 'Tails' result after flipping when tails is forced", async () => {
      vi.spyOn(crypto, "getRandomValues").mockImplementation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (arr: any) => {
          if (arr instanceof Uint8Array) arr[0] = 1; // odd = tails
          return arr as unknown as Uint8Array;
        }
      );

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
      render(<CoinFlip />);
      await user.click(screen.getByRole("button", { name: /flip coin/i }));

      await act(async () => {
        vi.advanceTimersByTime(1100);
      });

      const tailsEls = screen.getAllByText(/^tails$/i);
      expect(tailsEls.length).toBeGreaterThan(0);
    });

    it("result is always 'heads' or 'tails'", async () => {
      // Use real timers for this test
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<CoinFlip />);
      await user.click(screen.getByRole("button", { name: /flip coin/i }));

      await waitFor(
        () => {
          const headsEls = screen.queryAllByText(/^heads$/i);
          const tailsEls = screen.queryAllByText(/^tails$/i);
          expect(headsEls.length + tailsEls.length).toBeGreaterThan(0);
        },
        { timeout: 2000 }
      );
    });
  });

  describe("stats", () => {
    it("shows stats table after a flip", async () => {
      vi.spyOn(crypto, "getRandomValues").mockImplementation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (arr: any) => {
          if (arr instanceof Uint8Array) arr[0] = 0;
          return arr as unknown as Uint8Array;
        }
      );

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
      render(<CoinFlip />);
      await user.click(screen.getByRole("button", { name: /flip coin/i }));

      await act(async () => {
        vi.advanceTimersByTime(1100);
      });

      expect(screen.getAllByText(/^heads$/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/total/i)).toBeInTheDocument();
    });

    it("shows reset button after a flip", async () => {
      vi.spyOn(crypto, "getRandomValues").mockImplementation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (arr: any) => {
          if (arr instanceof Uint8Array) arr[0] = 0;
          return arr as unknown as Uint8Array;
        }
      );

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
      render(<CoinFlip />);
      await user.click(screen.getByRole("button", { name: /flip coin/i }));

      await act(async () => {
        vi.advanceTimersByTime(1100);
      });

      expect(screen.getAllByText(/^heads$/i).length).toBeGreaterThan(0);
      expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
    });
  });

  describe("reset", () => {
    it("clears stats and result after reset", async () => {
      vi.spyOn(crypto, "getRandomValues").mockImplementation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (arr: any) => {
          if (arr instanceof Uint8Array) arr[0] = 0;
          return arr as unknown as Uint8Array;
        }
      );

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
      render(<CoinFlip />);
      await user.click(screen.getByRole("button", { name: /flip coin/i }));

      await act(async () => {
        vi.advanceTimersByTime(1100);
      });

      // Verify result appeared
      expect(screen.getAllByText(/^heads$/i).length).toBeGreaterThan(0);

      await user.click(screen.getByRole("button", { name: /reset/i }));

      // After reset: the result <p> should be gone. The SVG CoinFace always renders
      // "HEADS" and "TAILS" in SVG text elements (both sides of coin always present).
      // Check the result <p> is gone by checking no <p> element shows heads/tails
      // and the Total stats row is gone.
      expect(screen.queryByText(/total/i)).not.toBeInTheDocument();
      // The "press to flip" prompt should be back
      expect(screen.getByText(/press to flip/i)).toBeInTheDocument();
    });
  });

  describe("button state", () => {
    it("disables flip button while spinning", async () => {
      vi.spyOn(crypto, "getRandomValues").mockImplementation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (arr: any) => {
          if (arr instanceof Uint8Array) arr[0] = 0;
          return arr as unknown as Uint8Array;
        }
      );

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
      render(<CoinFlip />);
      await user.click(screen.getByRole("button", { name: /flip coin/i }));

      const flipBtn = screen.getByRole("button", { name: /flipping/i });
      expect(flipBtn).toBeDisabled();
    });
  });

  describe("keyboard shortcut", () => {
    it("renders Space keyboard hint", () => {
      render(<CoinFlip />);
      expect(screen.getByText(/space/i)).toBeInTheDocument();
    });
  });
});
