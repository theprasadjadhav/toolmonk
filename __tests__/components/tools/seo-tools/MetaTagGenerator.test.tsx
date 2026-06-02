import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";
import { MetaTagGenerator } from "@/components/tools/seo-tools/MetaTagGenerator";

describe("MetaTagGenerator", () => {
  beforeEach(() => {
    // clearMocks: true in vitest.config handles this
  });

  it("renders all input fields", () => {
    render(<MetaTagGenerator />);
    expect(screen.getByPlaceholderText(/my awesome page title/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/a concise summary/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/https:\/\/example\.com\/page/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/my website/i)).toBeInTheDocument();
  });

  it("does not show generated tags initially", () => {
    render(<MetaTagGenerator />);
    expect(screen.queryByText(/generated tags/i)).not.toBeInTheDocument();
  });

  it("generates title tag when title is entered", async () => {
    const user = userEvent.setup();
    render(<MetaTagGenerator />);

    const titleInput = screen.getByPlaceholderText(/my awesome page title/i);
    await user.type(titleInput, "My Page");

    expect(screen.getByText(/<title>My Page<\/title>/)).toBeInTheDocument();
  });

  it("generates meta description tag", async () => {
    const user = userEvent.setup();
    render(<MetaTagGenerator />);

    const descInput = screen.getByPlaceholderText(/a concise summary/i);
    await user.type(descInput, "A great description");

    expect(screen.getByText(/meta name="description"/)).toBeInTheDocument();
  });

  it("generates og:title and og:description tags", async () => {
    const user = userEvent.setup();
    render(<MetaTagGenerator />);

    const titleInput = screen.getByPlaceholderText(/my awesome page title/i);
    await user.type(titleInput, "OG Title");

    expect(screen.getByText(/og:title/)).toBeInTheDocument();
  });

  it("generates twitter card tags", async () => {
    const user = userEvent.setup();
    render(<MetaTagGenerator />);

    const titleInput = screen.getByPlaceholderText(/my awesome page title/i);
    await user.type(titleInput, "Twitter Title");

    expect(screen.getByText(/twitter:card/)).toBeInTheDocument();
  });

  it("shows 'copy all' button when tags are generated", async () => {
    const user = userEvent.setup();
    render(<MetaTagGenerator />);

    const titleInput = screen.getByPlaceholderText(/my awesome page title/i);
    await user.type(titleInput, "Some Title");

    expect(screen.getByText(/copy all/i)).toBeInTheDocument();
  });

  it("copy all button calls clipboard.writeText", async () => {
    const user = userEvent.setup();
    render(<MetaTagGenerator />);

    const titleInput = screen.getByPlaceholderText(/my awesome page title/i);
    await user.type(titleInput, "Test Title");

    await user.click(screen.getByText(/copy all/i));
    // userEvent has its own virtual clipboard; read back to verify
    const clipboardText = await navigator.clipboard.readText();
    expect(clipboardText).toBeTruthy();
  });

  it("shows character count warning for long title", async () => {
    const user = userEvent.setup();
    render(<MetaTagGenerator />);

    const titleInput = screen.getByPlaceholderText(/my awesome page title/i);
    await user.type(titleInput, "A".repeat(61));

    expect(screen.getByText(/title exceeds 60 characters/i)).toBeInTheDocument();
  });

  it("renders page type selector with options", () => {
    render(<MetaTagGenerator />);
    const select = screen.getByDisplayValue("website");
    expect(select).toBeInTheDocument();
  });
});
