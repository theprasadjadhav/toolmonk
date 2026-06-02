import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";
import { DomainAgeChecker } from "@/components/tools/seo-tools/DomainAgeChecker";

describe("DomainAgeChecker", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          domain: "example.com",
          registrationDate: "2010-01-15",
          expirationDate: "2030-01-15",
          lastChangedDate: "2023-06-01",
          registrar: "Example Registrar",
        }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the domain input field", () => {
    render(<DomainAgeChecker />);
    expect(screen.getByPlaceholderText("example.com")).toBeInTheDocument();
  });

  it("renders the Check domain age button", () => {
    render(<DomainAgeChecker />);
    expect(screen.getByRole("button", { name: /check domain age/i })).toBeInTheDocument();
  });

  it("button is disabled when input is empty", () => {
    render(<DomainAgeChecker />);
    const button = screen.getByRole("button", { name: /check domain age/i });
    expect(button).toBeDisabled();
  });

  it("button is enabled when a valid domain is entered", async () => {
    const user = userEvent.setup();
    render(<DomainAgeChecker />);

    await user.type(screen.getByPlaceholderText("example.com"), "example.com");

    const button = screen.getByRole("button", { name: /check domain age/i });
    expect(button).not.toBeDisabled();
  });

  it("shows validation error for invalid domain", async () => {
    const user = userEvent.setup();
    render(<DomainAgeChecker />);

    await user.type(screen.getByPlaceholderText("example.com"), "not-valid");

    expect(screen.getByText(/enter a valid domain/i)).toBeInTheDocument();
  });

  it("shows loading state when check is submitted", async () => {
    const user = userEvent.setup();
    // Delay resolution so we can catch loading state
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));

    render(<DomainAgeChecker />);

    await user.type(screen.getByPlaceholderText("example.com"), "example.com");
    await user.click(screen.getByRole("button", { name: /check domain age/i }));

    expect(screen.getByText(/looking up/i)).toBeInTheDocument();
  });

  it("displays result after successful API call", async () => {
    const user = userEvent.setup();
    render(<DomainAgeChecker />);

    await user.type(screen.getByPlaceholderText("example.com"), "example.com");
    await user.click(screen.getByRole("button", { name: /check domain age/i }));

    await waitFor(() => {
      expect(screen.getByText("example.com")).toBeInTheDocument();
    });
  });

  it("shows Registration date in results", async () => {
    const user = userEvent.setup();
    render(<DomainAgeChecker />);

    await user.type(screen.getByPlaceholderText("example.com"), "example.com");
    await user.click(screen.getByRole("button", { name: /check domain age/i }));

    await waitFor(() => {
      expect(screen.getByText(/registration date/i)).toBeInTheDocument();
    });
  });

  it("shows Registrar in results", async () => {
    const user = userEvent.setup();
    render(<DomainAgeChecker />);

    await user.type(screen.getByPlaceholderText("example.com"), "example.com");
    await user.click(screen.getByRole("button", { name: /check domain age/i }));

    await waitFor(() => {
      expect(screen.getByText("Example Registrar")).toBeInTheDocument();
    });
  });

  it("shows error message when API call fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Domain not found" }),
    });

    const user = userEvent.setup();
    render(<DomainAgeChecker />);

    await user.type(screen.getByPlaceholderText("example.com"), "example.com");
    await user.click(screen.getByRole("button", { name: /check domain age/i }));

    await waitFor(() => {
      expect(screen.getByText(/domain not found/i)).toBeInTheDocument();
    });
  });

  it("submits on Enter key press", async () => {
    const user = userEvent.setup();
    render(<DomainAgeChecker />);

    const input = screen.getByPlaceholderText("example.com");
    await user.type(input, "example.com{Enter}");

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
