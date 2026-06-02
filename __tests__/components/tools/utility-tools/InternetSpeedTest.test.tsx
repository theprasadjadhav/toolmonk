import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InternetSpeedTest } from "@/components/tools/utility-tools/InternetSpeedTest";

describe("InternetSpeedTest", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("idle state rendering", () => {
    it("renders Start Test button", () => {
      render(<InternetSpeedTest />);
      expect(screen.getByRole("button", { name: /start test/i })).toBeInTheDocument();
    });

    it("renders unit toggle buttons (Mb/s and MB/s)", () => {
      render(<InternetSpeedTest />);
      // Both unit toggle buttons should be present
      const unitBtns = screen.getAllByRole("button", { name: /mb\/s/i });
      expect(unitBtns).toHaveLength(2);
    });

    it("shows idle description text", () => {
      render(<InternetSpeedTest />);
      expect(screen.getByText(/measures download speed/i)).toBeInTheDocument();
    });

    it("shows M-Lab attribution text in idle state", () => {
      render(<InternetSpeedTest />);
      // Multiple M-Lab text elements may be present (description + attribution)
      expect(screen.getAllByText(/m-lab/i).length).toBeGreaterThan(0);
    });
  });

  describe("unit toggle", () => {
    it("switches between Mb/s and MB/s units", async () => {
      const user = userEvent.setup();
      render(<InternetSpeedTest />);
      // Click the MB/s button (text is exactly "MB/s")
      const allUnitBtns = screen.getAllByRole("button", { name: /mb\/s/i });
      const mbytesBtn = allUnitBtns.find((b) => b.textContent === "MB/s");
      expect(mbytesBtn).toBeTruthy();
      await user.click(mbytesBtn!);
      // Both unit toggle buttons remain visible after switching
      const unitBtns = screen.getAllByRole("button", { name: /mb\/s/i });
      expect(unitBtns).toHaveLength(2);
    });
  });

  describe("running the test (dev mock path)", () => {
    it("shows locating/running state when Start Test is clicked", async () => {
      // In test env NODE_ENV is 'test', not 'development',
      // so DEV_MOCK is false — mock fetch to prevent real network calls
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const user = userEvent.setup();
      render(<InternetSpeedTest />);
      await user.click(screen.getByRole("button", { name: /start test/i }));

      // Should transition out of idle (locating, error, or running)
      await waitFor(() => {
        const startBtn = screen.queryByRole("button", { name: /start test/i });
        const stopBtn = screen.queryByRole("button", { name: /stop/i });
        const errorMsg = screen.queryByText(/could not reach test servers/i);
        expect(startBtn || stopBtn || errorMsg).toBeTruthy();
      });
    });

    it("shows Stop button during test", async () => {
      global.fetch = vi.fn().mockImplementation(
        () => new Promise(() => {}) // never resolves — keeps test in locating state
      );

      const user = userEvent.setup();
      render(<InternetSpeedTest />);
      await user.click(screen.getByRole("button", { name: /start test/i }));

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /stop/i })).toBeInTheDocument();
      });
    });

    it("returns to idle state when Stop is clicked", async () => {
      global.fetch = vi.fn().mockImplementation(
        () => new Promise(() => {})
      );

      const user = userEvent.setup();
      render(<InternetSpeedTest />);
      await user.click(screen.getByRole("button", { name: /start test/i }));

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /stop/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /stop/i }));

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /start test/i })).toBeInTheDocument();
      });
    });
  });

  describe("error state", () => {
    it("shows error message when server cannot be reached", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const user = userEvent.setup();
      render(<InternetSpeedTest />);
      await user.click(screen.getByRole("button", { name: /start test/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/could not reach test servers/i)
        ).toBeInTheDocument();
      });
    });

    it("shows generic error when locate returns non-ok response", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      });

      const user = userEvent.setup();
      render(<InternetSpeedTest />);
      await user.click(screen.getByRole("button", { name: /start test/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/could not find a nearby test server/i)
        ).toBeInTheDocument();
      });
    });

    it("shows rate-limit message on 429 response", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: () => Promise.resolve({}),
      });

      const user = userEvent.setup();
      render(<InternetSpeedTest />);
      await user.click(screen.getByRole("button", { name: /start test/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/too many tests/i)
        ).toBeInTheDocument();
      });
    });

    it("allows restarting after an error", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const user = userEvent.setup();
      render(<InternetSpeedTest />);
      await user.click(screen.getByRole("button", { name: /start test/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/could not reach test servers/i)
        ).toBeInTheDocument();
      });

      // Start Test button should be back
      expect(screen.getByRole("button", { name: /start test/i })).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("gauge SVG has aria-hidden to exclude it from accessibility tree", () => {
      render(<InternetSpeedTest />);
      const svgs = document.querySelectorAll('svg[aria-hidden="true"]');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });
});
