import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";
import { UrlEncoder } from "@/components/tools/shared/text/UrlEncoder";

describe("UrlEncoder", () => {
  beforeEach(() => {
    // clearMocks: true in vitest.config handles this
  });

  it("renders input and output textareas", () => {
    render(<UrlEncoder />);
    expect(screen.getAllByRole("textbox").length).toBeGreaterThanOrEqual(2);
  });

  it("encodes 'hello world' to 'hello%20world' in component mode", async () => {
    const user = userEvent.setup();
    render(<UrlEncoder />);

    const textareas = screen.getAllByRole("textbox");
    const input = textareas[0];
    await user.type(input, "hello world");

    const output = textareas[1];
    expect(output).toHaveValue("hello%20world");
  });

  it("encodes special characters 'a=1&b=2'", async () => {
    const user = userEvent.setup();
    render(<UrlEncoder />);

    const textareas = screen.getAllByRole("textbox");
    await user.type(textareas[0], "a=1&b=2");

    expect(textareas[1]).toHaveValue("a%3D1%26b%3D2");
  });

  it("shows empty output for empty input", () => {
    render(<UrlEncoder />);
    const textareas = screen.getAllByRole("textbox");
    expect(textareas[1]).toHaveValue("");
  });

  it("updates output live as the user types", async () => {
    const user = userEvent.setup();
    render(<UrlEncoder />);

    const textareas = screen.getAllByRole("textbox");
    const input = textareas[0];
    await user.type(input, "a");
    expect(textareas[1]).toHaveValue("a");
    await user.type(input, " ");
    expect(textareas[1]).toHaveValue("a%20");
  });

  it("renders encoding mode buttons", () => {
    render(<UrlEncoder />);
    expect(screen.getByText("Component")).toBeInTheDocument();
    expect(screen.getByText("Full URL")).toBeInTheDocument();
  });

  it("output textarea is read-only", () => {
    render(<UrlEncoder />);
    const textareas = screen.getAllByRole("textbox");
    expect(textareas[1]).toHaveAttribute("readonly");
  });

  it("copy button appears after entering text", async () => {
    const user = userEvent.setup();
    render(<UrlEncoder />);

    const textareas = screen.getAllByRole("textbox");
    await user.type(textareas[0], "test");

    expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
  });
});
