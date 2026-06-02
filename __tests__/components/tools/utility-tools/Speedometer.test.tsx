import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Speedometer } from "@/components/tools/utility-tools/Speedometer";

// Fix ResizeObserver mock — the global setup uses vi.fn().mockImplementation which
// produces a plain function, not a constructor. Override it here as a proper class.
global.ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_cb: ResizeObserverCallback) {}
};

// Mock geolocation
const mockGeolocation = {
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
  getCurrentPosition: vi.fn(),
};

beforeEach(() => {
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: mockGeolocation,
  });
  mockGeolocation.watchPosition.mockClear();
  mockGeolocation.clearWatch.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Speedometer", () => {
  describe("rendering", () => {
    it("renders Start GPS button", () => {
      render(<Speedometer />);
      const startBtns = screen.getAllByRole("button", { name: /start gps/i });
      expect(startBtns.length).toBeGreaterThan(0);
    });

    it("renders initial speed as 0.0", () => {
      render(<Speedometer />);
      expect(screen.getByText("0.0")).toBeInTheDocument();
    });

    it("renders km/h unit by default", () => {
      render(<Speedometer />);
      expect(screen.getAllByText(/km\/h/i).length).toBeGreaterThan(0);
    });

    it("renders unit toggle buttons", () => {
      render(<Speedometer />);
      const kmhBtns = screen.getAllByRole("button", { name: /km\/h/i });
      const mphBtns = screen.getAllByRole("button", { name: /mph/i });
      expect(kmhBtns.length + mphBtns.length).toBeGreaterThanOrEqual(2);
    });

    it("renders canvas element for dial", () => {
      render(<Speedometer />);
      expect(document.querySelector("canvas")).toBeInTheDocument();
    });

    it("shows prompt to allow location permission", () => {
      render(<Speedometer />);
      expect(screen.getByText(/start gps.*allow location/i)).toBeInTheDocument();
    });

    it("shows Max Speed stat box", () => {
      render(<Speedometer />);
      expect(screen.getByText(/max speed/i)).toBeInTheDocument();
    });

    it("shows GPS Accuracy stat box", () => {
      render(<Speedometer />);
      expect(screen.getByText(/gps accuracy/i)).toBeInTheDocument();
    });
  });

  describe("GPS not supported", () => {
    it("shows unsupported message when geolocation is absent", () => {
      // Delete the property so "geolocation" in navigator is false
      const nav = navigator as unknown as Record<string, unknown>;
      const original = nav.geolocation;
      delete nav.geolocation;

      render(<Speedometer />);
      expect(screen.getByText(/gps not available/i)).toBeInTheDocument();

      // Restore
      nav.geolocation = original;
    });
  });

  describe("starting GPS", () => {
    it("calls watchPosition when Start GPS is clicked", async () => {
      mockGeolocation.watchPosition.mockImplementation(() => 42);
      const user = userEvent.setup();
      render(<Speedometer />);
      const startBtns = screen.getAllByRole("button", { name: /start gps/i });
      await user.click(startBtns[0]);
      expect(mockGeolocation.watchPosition).toHaveBeenCalledTimes(1);
    });

    it("shows Stop GPS button after starting", async () => {
      mockGeolocation.watchPosition.mockImplementation(() => 42);
      const user = userEvent.setup();
      render(<Speedometer />);
      const startBtns = screen.getAllByRole("button", { name: /start gps/i });
      await user.click(startBtns[0]);
      await waitFor(() => {
        const stopBtns = screen.queryAllByRole("button", { name: /stop gps/i });
        expect(stopBtns.length).toBeGreaterThan(0);
      });
    });

    it("shows GPS Active indicator after starting", async () => {
      mockGeolocation.watchPosition.mockImplementation(() => 42);
      const user = userEvent.setup();
      render(<Speedometer />);
      const startBtns = screen.getAllByRole("button", { name: /start gps/i });
      await user.click(startBtns[0]);
      await waitFor(() => {
        // Component renders GPS Active in both desktop and mobile sections
        expect(screen.getAllByText(/gps active/i).length).toBeGreaterThan(0);
      });
    });
  });

  describe("stopping GPS", () => {
    it("calls clearWatch when Stop GPS is clicked", async () => {
      mockGeolocation.watchPosition.mockImplementation(() => 42);
      const user = userEvent.setup();
      render(<Speedometer />);
      const startBtns = screen.getAllByRole("button", { name: /start gps/i });
      await user.click(startBtns[0]);

      await waitFor(() => {
        const stopBtns = screen.queryAllByRole("button", { name: /stop gps/i });
        expect(stopBtns.length).toBeGreaterThan(0);
      });

      const stopBtns = screen.getAllByRole("button", { name: /stop gps/i });
      await user.click(stopBtns[0]);
      expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(42);
    });

    it("resets speed to 0.0 after stopping", async () => {
      mockGeolocation.watchPosition.mockImplementation(() => 42);
      const user = userEvent.setup();
      render(<Speedometer />);
      const startBtns = screen.getAllByRole("button", { name: /start gps/i });
      await user.click(startBtns[0]);

      await waitFor(() => {
        const stopBtns = screen.queryAllByRole("button", { name: /stop gps/i });
        expect(stopBtns.length).toBeGreaterThan(0);
      });

      const stopBtns = screen.getAllByRole("button", { name: /stop gps/i });
      await user.click(stopBtns[0]);

      expect(screen.getByText("0.0")).toBeInTheDocument();
    });
  });

  describe("GPS errors", () => {
    it("shows permission denied error message", async () => {
      mockGeolocation.watchPosition.mockImplementation((_success: unknown, error: (err: GeolocationPositionError) => void) => {
        const posErr = {
          code: 1,
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
          message: "User denied",
        } as GeolocationPositionError;
        error(posErr);
        return 1;
      });

      const user = userEvent.setup();
      render(<Speedometer />);
      const startBtns = screen.getAllByRole("button", { name: /start gps/i });
      await user.click(startBtns[0]);

      await waitFor(() => {
        expect(screen.getByText(/location access denied/i)).toBeInTheDocument();
      });
    });

    it("shows position unavailable error", async () => {
      mockGeolocation.watchPosition.mockImplementation((_success: unknown, error: (err: GeolocationPositionError) => void) => {
        const posErr = {
          code: 2,
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
          message: "Position unavailable",
        } as GeolocationPositionError;
        error(posErr);
        return 1;
      });

      const user = userEvent.setup();
      render(<Speedometer />);
      const startBtns = screen.getAllByRole("button", { name: /start gps/i });
      await user.click(startBtns[0]);

      await waitFor(() => {
        expect(screen.getByText(/location unavailable/i)).toBeInTheDocument();
      });
    });
  });

  describe("unit toggle", () => {
    it("switches to mph when mph button is clicked", async () => {
      const user = userEvent.setup();
      render(<Speedometer />);
      const mphBtns = screen.getAllByRole("button", { name: /mph/i });
      await user.click(mphBtns[0]);
      const mphLabels = screen.getAllByText(/mph/i);
      expect(mphLabels.length).toBeGreaterThan(0);
    });
  });
});
