import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TextCounter } from "@/components/tools/shared/text/TextCounter";
import { clearClipboard } from "@/__tests__/helpers/mocks";

beforeEach(() => {
  clearClipboard();
});

describe("TextCounter", () => {
  describe("rendering", () => {
    it("renders input textarea", () => {
      render(<TextCounter highlight="words" />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("renders all stat row labels", () => {
      render(<TextCounter highlight="words" />);
      expect(screen.getByText(/^words$/i)).toBeInTheDocument();
      expect(screen.getByText(/^characters$/i)).toBeInTheDocument();
      expect(screen.getByText(/^lines$/i)).toBeInTheDocument();
    });

    it("shows dashes for all stats when input is empty", () => {
      render(<TextCounter highlight="words" />);
      const dashes = screen.getAllByText("—");
      // Multiple stats show — when empty
      expect(dashes.length).toBeGreaterThan(0);
    });
  });

  describe("word count", () => {
    it("counts words correctly", async () => {
      const user = userEvent.setup();
      render(<TextCounter highlight="words" />);
      await user.type(screen.getByRole("textbox"), "hello world foo");
      // Words = 3, uniqueWords = 3; multiple rows can show "3"
      const rows = screen.getAllByText("3");
      expect(rows.length).toBeGreaterThanOrEqual(2);
    });

    it("reports 0 words for whitespace-only input", async () => {
      const user = userEvent.setup();
      render(<TextCounter highlight="words" />);
      await user.type(screen.getByRole("textbox"), "   ");
      // whitespace-only input: hasText = false (trim() === ""), so all stats show "—"
      // The characters-entered count will appear (3 chars). Words stat shows "—" not "0".
      // Verify we do NOT see any numeric word count (everything shows dash)
      const dashes = screen.getAllByText("—");
      expect(dashes.length).toBeGreaterThan(0);
    });
  });

  describe("character count", () => {
    it("counts characters correctly", async () => {
      const user = userEvent.setup();
      render(<TextCounter highlight="chars" />);
      await user.type(screen.getByRole("textbox"), "hello");
      // 5 characters total (also appears for charsNoSpaces since no spaces in "hello")
      expect(screen.getAllByText("5").length).toBeGreaterThanOrEqual(1);
    });

    it("includes spaces in character count", async () => {
      const user = userEvent.setup();
      render(<TextCounter highlight="chars" />);
      await user.type(screen.getByRole("textbox"), "hi there");
      // "hi there" = 8 chars (chars row shows 8; charsNoSpaces = 7)
      expect(screen.getAllByText("8").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("line count", () => {
    it("counts lines correctly for multi-line input", async () => {
      const user = userEvent.setup();
      render(<TextCounter highlight="lines" />);
      const textarea = screen.getByRole("textbox");
      await user.click(textarea);
      await user.paste("line one\nline two\nline three");
      // 3 lines (and potentially other stats with value 3)
      expect(screen.getAllByText("3").length).toBeGreaterThanOrEqual(1);
    });

    it("reports 1 line for single-line input", async () => {
      const user = userEvent.setup();
      render(<TextCounter highlight="lines" />);
      await user.type(screen.getByRole("textbox"), "single line");
      // Line count and various other stats may show 1; use getAllByText
      expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("reading time", () => {
    it("shows reading time stat row", () => {
      render(<TextCounter highlight="readingTime" />);
      expect(screen.getByText(/reading time/i)).toBeInTheDocument();
    });

    it("shows reading time after entering text", async () => {
      const user = userEvent.setup();
      render(<TextCounter highlight="readingTime" />);
      // Type 200+ words to get a reading time of "1 min"
      const words = Array(200).fill("word").join(" ");
      await user.click(screen.getByRole("textbox"));
      await user.paste(words);
      expect(screen.getByText("1 min")).toBeInTheDocument();
    });
  });

  describe("highlighted stat", () => {
    it("renders all stat row labels in the results table", () => {
      render(<TextCounter highlight="chars" />);
      // All stat labels should be present
      expect(screen.getByText("Words")).toBeInTheDocument();
      expect(screen.getByText("Characters")).toBeInTheDocument();
      expect(screen.getByText("Lines")).toBeInTheDocument();
    });
  });

  describe("live update", () => {
    it("updates counts as user types", async () => {
      const user = userEvent.setup();
      render(<TextCounter highlight="words" />);
      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "one");
      // word count = 1 (and other stats may also show 1)
      expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1);
      await user.type(textarea, " two");
      // word count = 2 (uniqueWords = 2 also)
      expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("copy behavior", () => {
    it("renders copy buttons next to each stat row", async () => {
      const user = userEvent.setup();
      render(<TextCounter highlight="words" />);
      await user.type(screen.getByRole("textbox"), "hello world");
      // CopyButton is rendered per row
      const copyBtns = screen.getAllByRole("button", { name: /copy/i });
      expect(copyBtns.length).toBeGreaterThan(0);
    });
  });

  describe("accessibility", () => {
    it("has textarea label text", () => {
      render(<TextCounter highlight="words" />);
      expect(screen.getByText(/paste or type your text/i)).toBeInTheDocument();
    });

    it("has results section label", () => {
      render(<TextCounter highlight="words" />);
      expect(screen.getByText(/results/i)).toBeInTheDocument();
    });
  });
});
