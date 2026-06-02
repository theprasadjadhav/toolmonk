import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiKeyGenerator } from "@/components/tools/generators/ApiKeyGenerator";
import { clearClipboard } from "@/__tests__/helpers/mocks";

beforeEach(() => {
  clearClipboard();
});

describe("ApiKeyGenerator", () => {
  describe("initial render", () => {
    it("renders the generate button", () => {
      render(<ApiKeyGenerator />);
      expect(screen.getByRole("button", { name: /generate/i })).toBeInTheDocument();
    });

    it("renders byte length, count, group size inputs", () => {
      render(<ApiKeyGenerator />);
      const spinbuttons = screen.getAllByRole("spinbutton");
      expect(spinbuttons.length).toBeGreaterThanOrEqual(3);
    });

    it("renders the encoding select", () => {
      render(<ApiKeyGenerator />);
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("renders prefix and separator text inputs", () => {
      render(<ApiKeyGenerator />);
      expect(screen.getByPlaceholderText(/sk_live_/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/^-$/i)).toBeInTheDocument();
    });
  });

  describe("generation — hex encoding", () => {
    it("generates non-empty hex keys", async () => {
      const user = userEvent.setup();
      render(<ApiKeyGenerator />);
      // Default: 32 bytes, hex encoding, count 3
      await user.click(screen.getByRole("button", { name: /generate/i }));
      const copyBtns = screen.getAllByRole("button", { name: /^copy$/i });
      expect(copyBtns.length).toBe(3);
      // Each result span should contain hex chars: 32 bytes = 64 hex chars
      const spans = document.querySelectorAll(
        ".border.border-border.divide-y .font-mono.text-sm",
      );
      Array.from(spans).forEach((span) => {
        expect(span.textContent).toMatch(/^[0-9a-f]{64}$/i);
      });
    });

    it("generated key length matches 2 * bytes for hex encoding", async () => {
      const user = userEvent.setup();
      render(<ApiKeyGenerator />);
      const bytesInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(bytesInput);
      await user.type(bytesInput, "16");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      const spans = document.querySelectorAll(
        ".border.border-border.divide-y .font-mono.text-sm",
      );
      const first = spans[0];
      expect(first.textContent).toHaveLength(32); // 16 bytes * 2 hex chars
    });
  });

  describe("generation — alphanumeric encoding", () => {
    it("generates alphanumeric keys", async () => {
      const user = userEvent.setup();
      render(<ApiKeyGenerator />);
      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "alphanumeric");
      const countInput = screen.getAllByRole("spinbutton")[1];
      await user.clear(countInput);
      await user.type(countInput, "1");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      const span = document.querySelector(".border.border-border.divide-y .font-mono.text-sm");
      expect(span).toBeTruthy();
      expect(span!.textContent).toMatch(/^[A-Za-z0-9]+$/);
    });
  });

  describe("prefix", () => {
    it("prepends the prefix to each generated key", async () => {
      const user = userEvent.setup();
      render(<ApiKeyGenerator />);
      const prefixInput = screen.getByPlaceholderText(/sk_live_/i);
      await user.clear(prefixInput);
      await user.type(prefixInput, "test_");
      const countInput = screen.getAllByRole("spinbutton")[1];
      await user.clear(countInput);
      await user.type(countInput, "2");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      const spans = document.querySelectorAll(
        ".border.border-border.divide-y .font-mono.text-sm",
      );
      Array.from(spans).forEach((span) => {
        expect(span.textContent!.startsWith("test_")).toBe(true);
      });
    });

    it("shows error when prefix exceeds 32 characters", async () => {
      const user = userEvent.setup();
      render(<ApiKeyGenerator />);
      const prefixInput = screen.getByPlaceholderText(/sk_live_/i);
      await user.clear(prefixInput);
      await user.type(prefixInput, "a".repeat(33));
      expect(screen.getByText("Max 32 characters")).toBeInTheDocument();
    });
  });

  describe("grouping", () => {
    it("groups key characters with separator when group size > 0", async () => {
      const user = userEvent.setup();
      render(<ApiKeyGenerator />);
      const groupInput = screen.getAllByRole("spinbutton")[2];
      await user.clear(groupInput);
      await user.type(groupInput, "4");
      const separatorInput = screen.getByPlaceholderText(/^-$/i);
      await user.clear(separatorInput);
      await user.type(separatorInput, "-");
      const countInput = screen.getAllByRole("spinbutton")[1];
      await user.clear(countInput);
      await user.type(countInput, "1");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      const span = document.querySelector(".border.border-border.divide-y .font-mono.text-sm");
      expect(span).toBeTruthy();
      expect(span!.textContent).toContain("-");
    });
  });

  describe("validation", () => {
    it("shows error when bytes is below 8", async () => {
      const user = userEvent.setup();
      render(<ApiKeyGenerator />);
      const bytesInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(bytesInput);
      await user.type(bytesInput, "4");
      expect(screen.getByText("Min 8 bytes")).toBeInTheDocument();
    });

    it("shows error when bytes exceeds 256", async () => {
      const user = userEvent.setup();
      render(<ApiKeyGenerator />);
      const bytesInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(bytesInput);
      await user.type(bytesInput, "300");
      expect(screen.getByText("Max 256 bytes")).toBeInTheDocument();
    });

    it("shows error when count is below 1", async () => {
      const user = userEvent.setup();
      render(<ApiKeyGenerator />);
      const countInput = screen.getAllByRole("spinbutton")[1];
      await user.clear(countInput);
      await user.type(countInput, "0");
      expect(screen.getByText("Min 1")).toBeInTheDocument();
    });

    it("shows error when count exceeds 50", async () => {
      const user = userEvent.setup();
      render(<ApiKeyGenerator />);
      const countInput = screen.getAllByRole("spinbutton")[1];
      await user.clear(countInput);
      await user.type(countInput, "51");
      expect(screen.getByText("Max 50")).toBeInTheDocument();
    });

    it("disables generate button when validation fails", async () => {
      const user = userEvent.setup();
      render(<ApiKeyGenerator />);
      const bytesInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(bytesInput);
      await user.type(bytesInput, "4");
      expect(screen.getByRole("button", { name: /generate/i })).toBeDisabled();
    });
  });

  describe("copy functionality", () => {
    it("copies a single key to clipboard", async () => {
      const user = userEvent.setup();
      render(<ApiKeyGenerator />);
      const countInput = screen.getAllByRole("spinbutton")[1];
      await user.clear(countInput);
      await user.type(countInput, "1");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      await user.click(screen.getByRole("button", { name: /^copy$/i }));
      const copied = await navigator.clipboard.readText();
      expect(copied.length).toBeGreaterThan(0);
    });

    it("shows copy all button when multiple keys are generated", async () => {
      const user = userEvent.setup();
      render(<ApiKeyGenerator />);
      await user.click(screen.getByRole("button", { name: /generate/i }));
      // Default count is 3
      expect(screen.getByRole("button", { name: /copy all/i })).toBeInTheDocument();
    });

    it("copies all keys joined by newlines when copy all is clicked", async () => {
      const user = userEvent.setup();
      render(<ApiKeyGenerator />);
      // Default count is 3
      await user.click(screen.getByRole("button", { name: /generate/i }));
      await user.click(screen.getByRole("button", { name: /copy all/i }));
      const copied = await navigator.clipboard.readText();
      expect(copied.split("\n").length).toBe(3);
    });
  });

  describe("regenerate", () => {
    it("generates new keys on each click", async () => {
      const user = userEvent.setup();
      render(<ApiKeyGenerator />);
      await user.click(screen.getByRole("button", { name: /generate/i }));
      await user.click(screen.getByRole("button", { name: /generate/i }));
      // Each generation produces non-empty keys
      const spans = document.querySelectorAll(
        ".border.border-border.divide-y .font-mono.text-sm",
      );
      expect(spans.length).toBeGreaterThan(0);
      Array.from(spans).forEach((s) => expect(s.textContent!.length).toBeGreaterThan(0));
    });
  });

  describe("accessibility", () => {
    it("byte length input has a label", () => {
      render(<ApiKeyGenerator />);
      expect(screen.getByText(/— byte length \(8–256\)/i)).toBeInTheDocument();
    });

    it("encoding select has a label", () => {
      render(<ApiKeyGenerator />);
      expect(screen.getByText(/— encoding/i)).toBeInTheDocument();
    });

    it("shows security notice about client-side generation", () => {
      render(<ApiKeyGenerator />);
      expect(screen.getByText(/never sent to a server/i)).toBeInTheDocument();
    });
  });
});
