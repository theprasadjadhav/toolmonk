import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { DeviceInfoChecker } from "@/components/tools/utility-tools/DeviceInfoChecker";

// Mock ua-parser-js so the dynamic import resolves cleanly in jsdom
vi.mock("ua-parser-js", () => ({
  UAParser: vi.fn().mockImplementation(() => ({
    getResult: () => ({
      browser: { name: "Chrome", version: "120.0" },
      os: { name: "macOS", version: "14.0" },
      cpu: { architecture: "amd64" },
      device: { type: undefined },
      engine: { name: "Blink" },
    }),
  })),
}));

// Set up screen dimensions in jsdom
Object.defineProperty(window.screen, "width", { value: 1920, configurable: true });
Object.defineProperty(window.screen, "height", { value: 1080, configurable: true });
Object.defineProperty(window.screen, "availWidth", { value: 1920, configurable: true });
Object.defineProperty(window.screen, "availHeight", { value: 1040, configurable: true });
Object.defineProperty(window.screen, "colorDepth", { value: 24, configurable: true });
Object.defineProperty(window, "devicePixelRatio", { value: 2, configurable: true });

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
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("DeviceInfoChecker", () => {
  describe("loading state", () => {
    it("shows loading message initially", () => {
      render(<DeviceInfoChecker />);
      expect(screen.getByText(/gathering device info/i)).toBeInTheDocument();
    });
  });

  describe("after data loads", () => {
    it("shows Browser section", async () => {
      render(<DeviceInfoChecker />);
      await waitFor(() => {
        expect(screen.getByText(/— Browser/i)).toBeInTheDocument();
      });
    });

    it("shows Operating System section", async () => {
      render(<DeviceInfoChecker />);
      await waitFor(() => {
        expect(screen.getByText(/operating system/i)).toBeInTheDocument();
      });
    });

    it("shows Hardware & System section", async () => {
      render(<DeviceInfoChecker />);
      await waitFor(() => {
        expect(screen.getByText(/hardware/i)).toBeInTheDocument();
      });
    });

    it("shows Display section", async () => {
      render(<DeviceInfoChecker />);
      await waitFor(() => {
        expect(screen.getByText(/display/i)).toBeInTheDocument();
      });
    });

    it("shows screen resolution using mocked screen dimensions", async () => {
      render(<DeviceInfoChecker />);
      await waitFor(() => {
        expect(screen.getByText(/1920/)).toBeInTheDocument();
      });
    });

    it("shows device pixel ratio", async () => {
      render(<DeviceInfoChecker />);
      await waitFor(() => {
        expect(screen.getByText(/pixel ratio/i)).toBeInTheDocument();
      });
    });

    it("shows color depth row", async () => {
      render(<DeviceInfoChecker />);
      await waitFor(() => {
        expect(screen.getByText(/color depth/i)).toBeInTheDocument();
      });
    });

    it("shows network status row", async () => {
      render(<DeviceInfoChecker />);
      await waitFor(() => {
        expect(screen.getByText(/network status/i)).toBeInTheDocument();
      });
    });

    it("shows language row", async () => {
      render(<DeviceInfoChecker />);
      await waitFor(() => {
        expect(screen.getByText(/^language$/i)).toBeInTheDocument();
      });
    });
  });

  describe("copy behavior", () => {
    it("shows copy buttons for each row", async () => {
      render(<DeviceInfoChecker />);
      await waitFor(() => {
        expect(screen.getByText(/— Browser/i)).toBeInTheDocument();
      });
      const copyBtns = screen.getAllByTitle(/copy/i);
      expect(copyBtns.length).toBeGreaterThan(0);
    });

    it("copies row value to clipboard when copy button clicked", async () => {
      // Replace clipboard.writeText with a fresh vi.fn() before the test
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(global.navigator, "clipboard", {
        value: { writeText: writeTextMock, readText: vi.fn().mockResolvedValue("") },
        writable: true,
        configurable: true,
      });

      render(<DeviceInfoChecker />);
      await waitFor(() => {
        expect(screen.getByText(/— Browser/i)).toBeInTheDocument();
      });
      const copyBtns = screen.getAllByTitle(/copy/i);
      // Use fireEvent to avoid userEvent clipboard intercept
      const { fireEvent } = await import("@testing-library/react");
      fireEvent.click(copyBtns[0]);
      expect(writeTextMock).toHaveBeenCalled();
    });
  });

  describe("privacy disclaimer", () => {
    it("shows memory and CPU cores privacy note", async () => {
      render(<DeviceInfoChecker />);
      await waitFor(() => {
        expect(screen.getByText(/memory and cpu cores/i)).toBeInTheDocument();
      });
    });
  });
});
