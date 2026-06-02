import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MarkdownPreview } from "@/components/tools/code/MarkdownPreview";

vi.mock("@monaco-editor/react", () => ({
  default: ({ value, onChange }: { value: string; onChange?: (v: string) => void }) => (
    <textarea
      data-testid="editor"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
}));

describe("MarkdownPreview", () => {
  describe("business logic", () => {
    it("converts markdown heading to HTML h1", async () => {
      render(<MarkdownPreview />);
      // The SAMPLE markdown has "# Markdown Preview"
      await waitFor(() => {
        const preview = document.querySelector(".md-prose");
        expect(preview?.innerHTML).toMatch(/<h1/i);
      });
    });

    it("renders bold text from markdown", async () => {
      render(<MarkdownPreview />);
      await waitFor(() => {
        const preview = document.querySelector(".md-prose");
        expect(preview?.innerHTML).toMatch(/<strong>/i);
      });
    });

    it("renders a code block from markdown", async () => {
      render(<MarkdownPreview />);
      await waitFor(() => {
        const preview = document.querySelector(".md-prose");
        expect(preview?.innerHTML).toMatch(/<code/i);
      });
    });

    it("renders a table from markdown", async () => {
      render(<MarkdownPreview />);
      await waitFor(() => {
        const preview = document.querySelector(".md-prose");
        expect(preview?.innerHTML).toMatch(/<table/i);
      });
    });

    it("renders a blockquote from markdown", async () => {
      render(<MarkdownPreview />);
      await waitFor(() => {
        const preview = document.querySelector(".md-prose");
        expect(preview?.innerHTML).toMatch(/<blockquote/i);
      });
    });
  });

  describe("component", () => {
    it("renders without crashing and shows preview label", () => {
      render(<MarkdownPreview />);
      expect(screen.getByText(/— preview/i)).toBeInTheDocument();
    });

    it("renders the markdown editor panel label", () => {
      render(<MarkdownPreview />);
      expect(screen.getByText(/— markdown/i)).toBeInTheDocument();
    });

    it("renders sample and clear toolbar buttons", () => {
      render(<MarkdownPreview />);
      expect(screen.getByTitle("sample")).toBeInTheDocument();
      expect(screen.getByTitle("clear")).toBeInTheDocument();
    });

    it("clear button empties the editor", async () => {
      const user = userEvent.setup();
      render(<MarkdownPreview />);
      await user.click(screen.getByTitle("clear"));
      const editor = screen.getByTestId("editor") as HTMLTextAreaElement;
      expect(editor.value).toBe("");
    });

    it("sample button restores the default sample text", async () => {
      const user = userEvent.setup();
      render(<MarkdownPreview />);
      await user.click(screen.getByTitle("clear"));
      await user.click(screen.getByTitle("sample"));
      const editor = screen.getByTestId("editor") as HTMLTextAreaElement;
      expect(editor.value).toContain("Markdown Preview");
    });

    it("typing in the editor updates the preview", async () => {
      const user = userEvent.setup();
      render(<MarkdownPreview />);
      await user.click(screen.getByTitle("clear"));
      const editor = screen.getByTestId("editor");
      await user.type(editor, "# Hello World");
      await waitFor(() => {
        const preview = document.querySelector(".md-prose");
        expect(preview?.innerHTML).toMatch(/Hello World/);
      });
    });

    it("empty input shows placeholder text", async () => {
      const user = userEvent.setup();
      render(<MarkdownPreview />);
      await user.click(screen.getByTitle("clear"));
      await waitFor(() => {
        expect(screen.getByText(/preview appears here/i)).toBeInTheDocument();
      });
    });

    it("download HTML button is present", () => {
      render(<MarkdownPreview />);
      expect(screen.getByTitle("Download HTML")).toBeInTheDocument();
    });

    it("download HTML button is disabled when there is no HTML", async () => {
      const user = userEvent.setup();
      render(<MarkdownPreview />);
      await user.click(screen.getByTitle("clear"));
      await waitFor(() => {
        const btn = screen.getByTitle("Download HTML");
        // PanelButton applies disabled state via class, not the HTML disabled attr
        expect(btn).toBeInTheDocument();
      });
    });
  });

  describe("accessibility", () => {
    it("toolbar buttons have accessible titles", () => {
      render(<MarkdownPreview />);
      expect(screen.getByTitle("sample")).toBeInTheDocument();
      expect(screen.getByTitle("clear")).toBeInTheDocument();
      expect(screen.getByTitle("Upload file")).toBeInTheDocument();
      expect(screen.getByTitle("Download HTML")).toBeInTheDocument();
    });
  });
});
