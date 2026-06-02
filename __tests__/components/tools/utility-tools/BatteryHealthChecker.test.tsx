import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BatteryHealthChecker } from "@/components/tools/utility-tools/BatteryHealthChecker";

// Default mock battery manager
function makeBatteryManager(overrides = {}) {
  return {
    level: 0.75,
    charging: true,
    chargingTime: 3600,
    dischargingTime: Infinity,
    onchargingchange: null,
    onlevelchange: null,
    onchargingtimechange: null,
    ondischargingtimechange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    ...overrides,
  };
}

describe("BatteryHealthChecker", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("when Battery API is supported", () => {
    beforeEach(() => {
      Object.defineProperty(navigator, "getBattery", {
        configurable: true,
        value: vi.fn().mockResolvedValue(makeBatteryManager()),
      });
    });

    it("shows loading state initially", () => {
      render(<BatteryHealthChecker />);
      // Either "Checking battery status…" or "Reading battery…" while loading
      const loadingText =
        screen.queryByText(/checking battery/i) ||
        screen.queryByText(/reading battery/i);
      expect(loadingText).toBeInTheDocument();
    });

    it("shows battery level percentage after loading", async () => {
      render(<BatteryHealthChecker />);
      await waitFor(() => {
        expect(screen.getByText("75")).toBeInTheDocument();
      });
      // The component renders "%" as a separate span — check it appears somewhere
      expect(screen.getAllByText(/%/).length).toBeGreaterThan(0);
    });

    it("shows charging status when battery is charging", async () => {
      render(<BatteryHealthChecker />);
      await waitFor(() => {
        // Component renders "Charging" text in multiple places (icon + status row)
        expect(screen.getAllByText(/charging/i).length).toBeGreaterThan(0);
      });
    });

    it("shows battery level row in stats table", async () => {
      render(<BatteryHealthChecker />);
      await waitFor(() => {
        expect(screen.getByText(/battery level/i)).toBeInTheDocument();
      });
      expect(screen.getByText("75%")).toBeInTheDocument();
    });

    it("shows status row in stats table", async () => {
      render(<BatteryHealthChecker />);
      await waitFor(() => {
        expect(screen.getByText(/^status$/i)).toBeInTheDocument();
      });
    });

    it("shows time to full charge row when charging", async () => {
      render(<BatteryHealthChecker />);
      await waitFor(() => {
        expect(screen.getByText(/time to full charge/i)).toBeInTheDocument();
      });
      // 3600 seconds = 1h 0m
      expect(screen.getByText("1h 0m")).toBeInTheDocument();
    });

    it("shows time remaining row", async () => {
      render(<BatteryHealthChecker />);
      await waitFor(() => {
        expect(screen.getByText(/time remaining/i)).toBeInTheDocument();
      });
    });
  });

  describe("when battery is discharging", () => {
    beforeEach(() => {
      Object.defineProperty(navigator, "getBattery", {
        configurable: true,
        value: vi.fn().mockResolvedValue(
          makeBatteryManager({
            level: 0.5,
            charging: false,
            chargingTime: Infinity,
            dischargingTime: 7200,
          })
        ),
      });
    });

    it("shows discharging status", async () => {
      render(<BatteryHealthChecker />);
      await waitFor(() => {
        // "Discharging" appears in both the battery icon AND the status row value
        expect(screen.getAllByText(/discharging/i).length).toBeGreaterThan(0);
      });
    });

    it("shows discharge time remaining", async () => {
      render(<BatteryHealthChecker />);
      await waitFor(() => {
        // 7200 seconds = 2h 0m
        expect(screen.getByText("2h 0m")).toBeInTheDocument();
      });
    });
  });

  describe("when battery is low and discharging", () => {
    beforeEach(() => {
      Object.defineProperty(navigator, "getBattery", {
        configurable: true,
        value: vi.fn().mockResolvedValue(
          makeBatteryManager({
            level: 0.15,
            charging: false,
            chargingTime: Infinity,
            dischargingTime: 1800,
          })
        ),
      });
    });

    it("shows low battery warning", async () => {
      render(<BatteryHealthChecker />);
      await waitFor(() => {
        expect(screen.getByText(/battery low/i)).toBeInTheDocument();
      });
    });
  });

  describe("when Battery API is not supported", () => {
    beforeEach(() => {
      Object.defineProperty(navigator, "getBattery", {
        configurable: true,
        value: undefined,
      });
    });

    it("shows not supported message", async () => {
      render(<BatteryHealthChecker />);
      await waitFor(() => {
        expect(
          screen.getByText(/battery health check not supported/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("when Battery API rejects", () => {
    beforeEach(() => {
      Object.defineProperty(navigator, "getBattery", {
        configurable: true,
        value: vi.fn().mockRejectedValue(new Error("denied")),
      });
    });

    it("shows not supported message on rejection", async () => {
      render(<BatteryHealthChecker />);
      await waitFor(() => {
        expect(
          screen.getByText(/battery health check not supported/i)
        ).toBeInTheDocument();
      });
    });
  });
});
