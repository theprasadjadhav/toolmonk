import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SlugGenerator } from "@/components/tools/text-tools/SlugGenerator";
import { clearClipboard, expectCopied } from "@/__tests__/helpers/mocks";

beforeEach(() => {
  clearClipboard();
});

describe("SlugGenerator", () => {
  describe("rendering", () => {
    it("renders input and slug output fields", () => {
      render(<SlugGenerator />);
      const inputs = screen.getAllByRole("textbox");
      expect(inputs.length).toBeGreaterThanOrEqual(2);
    });

    it("renders separator buttons", () => {
      render(<SlugGenerator />);
      expect(screen.getByRole("button", { name: /hyphen/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /underscore/i })).toBeInTheDocument();
    });

    it("renders copy button (disabled by default)", () => {
      render(<SlugGenerator />);
      const copyBtn = screen.getByRole("button", { name: /copy/i });
      expect(copyBtn).toBeDisabled();
    });
  });

  describe("slug generation with hyphen separator (default)", () => {
    it("converts 'Hello World!' to 'hello-world'", async () => {
      const user = userEvent.setup();
      render(<SlugGenerator />);
      const inputs = screen.getAllByRole("textbox");
      const inputField = inputs[0];
      await user.type(inputField, "Hello World!");
      const outputs = screen.getAllByRole("textbox");
      expect(outputs[1]).toHaveValue("hello-world");
    });

    it("collapses multiple spaces: 'Foo  Bar' → 'foo-bar'", async () => {
      const user = userEvent.setup();
      render(<SlugGenerator />);
      const inputs = screen.getAllByRole("textbox");
      await user.type(inputs[0], "Foo  Bar");
      const outputs = screen.getAllByRole("textbox");
      expect(outputs[1]).toHaveValue("foo-bar");
    });

    it("strips special characters", async () => {
      const user = userEvent.setup();
      render(<SlugGenerator />);
      const inputs = screen.getAllByRole("textbox");
      await user.type(inputs[0], "My Blog Post — 2024");
      const outputs = screen.getAllByRole("textbox");
      // em-dash becomes separator, numbers kept
      expect(outputs[1]).toHaveValue("my-blog-post-2024");
    });
  });

  describe("slug generation with underscore separator", () => {
    it("uses underscore separator when selected", async () => {
      const user = userEvent.setup();
      render(<SlugGenerator />);
      await user.click(screen.getByRole("button", { name: /underscore/i }));
      const inputs = screen.getAllByRole("textbox");
      await user.type(inputs[0], "hello world");
      const outputs = screen.getAllByRole("textbox");
      expect(outputs[1]).toHaveValue("hello_world");
    });
  });

  describe("live update", () => {
    it("updates slug as user types", async () => {
      const user = userEvent.setup();
      render(<SlugGenerator />);
      const inputs = screen.getAllByRole("textbox");
      await user.type(inputs[0], "test");
      const outputs = screen.getAllByRole("textbox");
      expect(outputs[1]).toHaveValue("test");
    });

    it("shows empty slug when input is cleared", async () => {
      const user = userEvent.setup();
      render(<SlugGenerator />);
      const inputs = screen.getAllByRole("textbox");
      await user.type(inputs[0], "hello");
      await user.clear(inputs[0]);
      const outputs = screen.getAllByRole("textbox");
      expect(outputs[1]).toHaveValue("");
    });
  });

  describe("copy behavior", () => {
    it("copies slug to clipboard", async () => {
      const user = userEvent.setup();
      render(<SlugGenerator />);
      const inputs = screen.getAllByRole("textbox");
      await user.type(inputs[0], "Hello World!");
      const copyBtn = screen.getByRole("button", { name: /copy/i });
      await user.click(copyBtn);
      await expectCopied("hello-world");
    });
  });

  describe("accessibility", () => {
    it("has label for input field", () => {
      render(<SlugGenerator />);
      expect(screen.getByText(/title or phrase/i)).toBeInTheDocument();
    });

    it("has label for slug output", () => {
      render(<SlugGenerator />);
      expect(screen.getByText(/slug/i)).toBeInTheDocument();
    });
  });
});
