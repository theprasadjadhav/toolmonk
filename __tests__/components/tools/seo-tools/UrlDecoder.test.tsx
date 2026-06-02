import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";
import { UrlDecoder } from "@/components/tools/shared/text/UrlDecoder";

describe("UrlDecoder", () => {
  beforeEach(() => {
    // clearMocks: true in vitest.config handles this
  });

  it("renders input and output textareas", () => {
    render(<UrlDecoder />);
    expect(screen.getAllByRole("textbox").length).toBeGreaterThanOrEqual(2);
  });

  it("decodes 'hello%20world' to 'hello world'", async () => {
    const user = userEvent.setup();
    render(<UrlDecoder />);

    const textareas = screen.getAllByRole("textbox");
    await user.type(textareas[0], "hello%20world");

    expect(textareas[1]).toHaveValue("hello world");
  });

  it("decodes '%3D' to '='", async () => {
    const user = userEvent.setup();
    render(<UrlDecoder />);

    const textareas = screen.getAllByRole("textbox");
    await user.type(textareas[0], "a%3D1");

    expect(textareas[1]).toHaveValue("a=1");
  });

  it("shows error for invalid percent-encoded string", async () => {
    const user = userEvent.setup();
    render(<UrlDecoder />);

    const textareas = screen.getAllByRole("textbox");
    await user.type(textareas[0], "%zz");

    expect(screen.getByText(/invalid percent-encoded/i)).toBeInTheDocument();
  });

  it("shows empty output for empty input", () => {
    render(<UrlDecoder />);
    const textareas = screen.getAllByRole("textbox");
    expect(textareas[1]).toHaveValue("");
  });

  it("output textarea is read-only", () => {
    render(<UrlDecoder />);
    const textareas = screen.getAllByRole("textbox");
    expect(textareas[1]).toHaveAttribute("readonly");
  });

  it("copy button appears after valid decode", async () => {
    const user = userEvent.setup();
    render(<UrlDecoder />);

    const textareas = screen.getAllByRole("textbox");
    await user.type(textareas[0], "hello%20world");

    expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
  });

  it("shows character count after decode", async () => {
    const user = userEvent.setup();
    render(<UrlDecoder />);

    const textareas = screen.getAllByRole("textbox");
    await user.type(textareas[0], "hello%20world");

    // "13 → 11 characters"
    expect(screen.getByText(/characters/i)).toBeInTheDocument();
  });
});
