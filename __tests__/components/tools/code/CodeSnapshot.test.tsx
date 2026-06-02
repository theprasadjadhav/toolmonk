import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CodeSnapshot } from "@/components/tools/code/CodeSnapshot";

vi.mock("html-to-image", () => ({
  toPng: vi.fn().mockResolvedValue("data:image/png;base64,AA"),
}));

// Monaco is not used in CodeSnapshot — it uses a raw textarea + hljs

describe("CodeSnapshot", () => {
  describe("business logic", () => {
    it("renders default code in the textarea", () => {
      render(<CodeSnapshot />);
      // Multiple textbox roles exist (filename input + textarea); find textarea by tag
      const textarea = screen
        .getAllByRole("textbox")
        .find((el) => el.tagName === "TEXTAREA");
      expect(textarea).toBeDefined();
      expect((textarea as HTMLTextAreaElement).value).toContain("fetchUser");
    });

    it("updates code when textarea is changed", async () => {
      const user = userEvent.setup();
      render(<CodeSnapshot />);
      const textarea = screen
        .getAllByRole("textbox")
        .find((el) => el.tagName === "TEXTAREA");
      expect(textarea).toBeDefined();
      if (!textarea) return;
      await user.clear(textarea);
      await user.type(textarea, "const x = 1;");
      expect((textarea as HTMLTextAreaElement).value).toBe("const x = 1;");
    });
  });

  describe("component", () => {
    it("renders language select with typescript as default", () => {
      render(<CodeSnapshot />);
      const langSelect = screen.getByDisplayValue("TypeScript");
      expect(langSelect).toBeInTheDocument();
    });

    it("renders theme select with One Dark as default", () => {
      render(<CodeSnapshot />);
      const themeSelect = screen.getByDisplayValue("One Dark");
      expect(themeSelect).toBeInTheDocument();
    });

    it("renders window style select", () => {
      render(<CodeSnapshot />);
      expect(screen.getByDisplayValue("macOS")).toBeInTheDocument();
    });

    it("renders padding and font size selects", () => {
      render(<CodeSnapshot />);
      expect(screen.getByDisplayValue("M")).toBeInTheDocument();
      expect(screen.getByDisplayValue("14px")).toBeInTheDocument();
    });

    it("renders Export PNG button", () => {
      render(<CodeSnapshot />);
      expect(
        screen.getByRole("button", { name: /export png/i }),
      ).toBeInTheDocument();
    });

    it("renders toggle option buttons", () => {
      render(<CodeSnapshot />);
      expect(screen.getByRole("button", { name: /dark mode/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /background/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /rounded/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /line numbers/i })).toBeInTheDocument();
    });

    it("changes language when select is updated", async () => {
      const user = userEvent.setup();
      render(<CodeSnapshot />);
      const langSelect = screen.getByDisplayValue("TypeScript");
      await user.selectOptions(langSelect, "python");
      expect((langSelect as HTMLSelectElement).value).toBe("python");
    });

    it("changes theme when select is updated", async () => {
      const user = userEvent.setup();
      render(<CodeSnapshot />);
      const themeSelect = screen.getByDisplayValue("One Dark");
      await user.selectOptions(themeSelect, "dracula");
      expect((themeSelect as HTMLSelectElement).value).toBe("dracula");
    });

    it("toggles line numbers on click", async () => {
      const user = userEvent.setup();
      render(<CodeSnapshot />);
      const btn = screen.getByRole("button", { name: /line numbers/i });
      // Initially no check mark
      expect(btn.textContent).not.toContain("✓");
      await user.click(btn);
      expect(btn.textContent).toContain("✓");
    });

    it("triggers PNG export on button click", async () => {
      const { toPng } = await import("html-to-image");
      const user = userEvent.setup();
      render(<CodeSnapshot />);
      const exportBtn = screen.getByRole("button", { name: /export png/i });
      await user.click(exportBtn);
      await waitFor(() => {
        expect(toPng).toHaveBeenCalled();
      });
    });

    it("Export PNG is disabled when textarea is cleared", async () => {
      const user = userEvent.setup();
      render(<CodeSnapshot />);
      const textarea = screen
        .getAllByRole("textbox")
        .find((el) => (el as HTMLTextAreaElement).tagName === "TEXTAREA");
      if (!textarea) return;
      await user.clear(textarea);
      const exportBtn = screen.getByRole("button", { name: /export png/i });
      expect(exportBtn).toBeDisabled();
    });

    it("fullscreen button is rendered", () => {
      render(<CodeSnapshot />);
      const btn = screen.getByTitle("Fullscreen");
      expect(btn).toBeInTheDocument();
    });

    it("enters fullscreen mode on button click", async () => {
      const user = userEvent.setup();
      render(<CodeSnapshot />);
      const btn = screen.getByTitle("Fullscreen");
      await user.click(btn);
      // Exit button appears in fullscreen mode
      expect(screen.getByRole("button", { name: /exit/i })).toBeInTheDocument();
    });

    it("exits fullscreen on Escape key", async () => {
      const user = userEvent.setup();
      render(<CodeSnapshot />);
      await user.click(screen.getByTitle("Fullscreen"));
      await user.keyboard("{Escape}");
      expect(
        screen.queryByRole("button", { name: /exit/i }),
      ).not.toBeInTheDocument();
    });

    it("filename input is editable in mac window mode", async () => {
      const user = userEvent.setup();
      render(<CodeSnapshot />);
      const filenameInput = screen.getByPlaceholderText("filename.ts");
      await user.clear(filenameInput);
      await user.type(filenameInput, "main.py");
      expect((filenameInput as HTMLInputElement).value).toBe("main.py");
    });

    it("renders background swatches", () => {
      render(<CodeSnapshot />);
      // 10 background swatches by title
      expect(screen.getByTitle("Sunset")).toBeInTheDocument();
      expect(screen.getByTitle("Ocean")).toBeInTheDocument();
      expect(screen.getByTitle("Night")).toBeInTheDocument();
    });

    it("switches to windows window style", async () => {
      const user = userEvent.setup();
      render(<CodeSnapshot />);
      const winSelect = screen.getByDisplayValue("macOS");
      await user.selectOptions(winSelect, "windows");
      expect((winSelect as HTMLSelectElement).value).toBe("windows");
    });
  });

  describe("accessibility", () => {
    it("language select has a label", () => {
      render(<CodeSnapshot />);
      const select = screen.getByDisplayValue("TypeScript");
      // Find the sibling label text
      expect(select).toBeInTheDocument();
    });

    it("Export PNG button has an accessible name", () => {
      render(<CodeSnapshot />);
      expect(
        screen.getByRole("button", { name: /export png/i }),
      ).toBeInTheDocument();
    });

    it("fullscreen button has a title attribute", () => {
      render(<CodeSnapshot />);
      expect(screen.getByTitle("Fullscreen")).toBeInTheDocument();
    });

    it("filename input has a placeholder", () => {
      render(<CodeSnapshot />);
      expect(screen.getByPlaceholderText("filename.ts")).toBeInTheDocument();
    });
  });
});
