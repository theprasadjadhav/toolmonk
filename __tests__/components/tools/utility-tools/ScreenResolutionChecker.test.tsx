import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScreenResolutionChecker } from "@/components/tools/utility-tools/ScreenResolutionChecker";

// Mock screen dimensions
Object.defineProperty(window.screen, "width", { value: 1920, configurable: true });
Object.defineProperty(window.screen, "height", { value: 1080, configurable: true });
Object.defineProperty(window.screen, "availWidth", { value: 1920, configurable: true });
Object.defineProperty(window.screen, "availHeight", { value: 1040, configurable: true });
Object.defineProperty(window.screen, "colorDepth", { value: 24, configurable: true });
Object.defineProperty(window, "devicePixelRatio", { value: 2, configurable: true });
Object.defineProperty(window, "innerWidth", { value: 1280, configurable: true });
Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
Object.defineProperty(window, "outerWidth", { value: 1920, configurable: true });
Object.defineProperty(window, "outerHeight", { value: 1080, configurable: true });

// Mock requestAnimationFrame to resolve quickly for refresh rate measurement
const originalRAF = global.requestAnimationFrame;
beforeEach(() => {
  // Ensure clipboard.writeText is a vi.fn spy
  if (!vi.isMockFunction(navigator.clipboard?.writeText)) {
    Object.defineProperty(global.navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
        readText: vi.fn().mockResolvedValue(""),
      },
      writable: true,
      configurable: true,
    });
  }

  let frameTime = 0;
  global.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
    frameTime += 16.67; // simulate ~60fps
    setTimeout(() => cb(frameTime), 0);
    return frameTime;
  }) as unknown as typeof requestAnimationFrame;
});

afterEach(() => {
  global.requestAnimationFrame = originalRAF;
  vi.restoreAllMocks();
});

describe("ScreenResolutionChecker", () => {
  describe("initial load", () => {
    it("shows loading state before data is available", () => {
      // Freeze RAF to keep it in loading state
      global.requestAnimationFrame = vi.fn(() => 0) as unknown as typeof requestAnimationFrame;
      render(<ScreenResolutionChecker />);
      expect(screen.getByText(/reading display info/i)).toBeInTheDocument();
    });
  });

  describe("after data loads", () => {
    it("shows Screen Resolution row", async () => {
      render(<ScreenResolutionChecker />);
      await waitFor(() => {
        expect(screen.getByText(/screen resolution/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it("shows mocked screen width 1920 in resolution", async () => {
      render(<ScreenResolutionChecker />);
      await waitFor(() => {
        // Multiple elements may contain "1920" — just check at least one exists
        expect(screen.getAllByText(/1920/).length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    it("shows Physical Resolution row", async () => {
      render(<ScreenResolutionChecker />);
      await waitFor(() => {
        expect(screen.getByText(/physical resolution/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it("shows Viewport Size row", async () => {
      render(<ScreenResolutionChecker />);
      await waitFor(() => {
        expect(screen.getByText(/viewport size/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it("shows Device Pixel Ratio row label", async () => {
      render(<ScreenResolutionChecker />);
      await waitFor(() => {
        // "Device Pixel Ratio" is the exact row label text
        expect(screen.getByText("Device Pixel Ratio")).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it("shows Color Depth row", async () => {
      render(<ScreenResolutionChecker />);
      await waitFor(() => {
        expect(screen.getByText(/color depth/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it("shows 24-bit color depth from mocked value", async () => {
      render(<ScreenResolutionChecker />);
      await waitFor(() => {
        expect(screen.getByText(/24-bit/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it("shows Refresh Rate row", async () => {
      render(<ScreenResolutionChecker />);
      await waitFor(() => {
        expect(screen.getByText(/refresh rate/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it("shows Orientation row label", async () => {
      render(<ScreenResolutionChecker />);
      await waitFor(() => {
        // "Orientation" is the exact row label text
        expect(screen.getByText("Orientation")).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it("shows Available Screen row", async () => {
      render(<ScreenResolutionChecker />);
      await waitFor(() => {
        expect(screen.getByText(/available screen/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it("shows Browser Window row", async () => {
      render(<ScreenResolutionChecker />);
      await waitFor(() => {
        expect(screen.getByText(/browser window/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe("Refresh button", () => {
    it("renders Refresh button after data loads", async () => {
      render(<ScreenResolutionChecker />);
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /refresh/i })).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it("triggers a re-measurement when Refresh button is clicked", async () => {
      const user = userEvent.setup();
      render(<ScreenResolutionChecker />);
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /refresh/i })).toBeInTheDocument();
      }, { timeout: 3000 });

      const rafSpy = vi.spyOn(global, "requestAnimationFrame");
      await user.click(screen.getByRole("button", { name: /refresh/i }));
      // requestAnimationFrame is called during refresh rate measurement
      expect(rafSpy).toHaveBeenCalled();
    });
  });

  describe("copy behavior", () => {
    it("shows copy buttons for each row", async () => {
      render(<ScreenResolutionChecker />);
      await waitFor(() => {
        expect(screen.getByText(/screen resolution/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      const copyBtns = screen.getAllByTitle(/copy value/i);
      expect(copyBtns.length).toBeGreaterThan(0);
    });

    it("copies row value when copy button is clicked", async () => {
      // Replace clipboard.writeText with a fresh vi.fn() before the test
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(global.navigator, "clipboard", {
        value: { writeText: writeTextMock, readText: vi.fn().mockResolvedValue("") },
        writable: true,
        configurable: true,
      });

      render(<ScreenResolutionChecker />);
      await waitFor(() => {
        expect(screen.getByText(/screen resolution/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      const copyBtns = screen.getAllByTitle(/copy value/i);
      const { fireEvent } = await import("@testing-library/react");
      fireEvent.click(copyBtns[0]);
      expect(writeTextMock).toHaveBeenCalled();
    });
  });

  describe("auto-update hint", () => {
    it("shows auto-update hint text", async () => {
      render(<ScreenResolutionChecker />);
      await waitFor(() => {
        expect(
          screen.getByText(/auto-updates on resize or orientation change/i)
        ).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
});
