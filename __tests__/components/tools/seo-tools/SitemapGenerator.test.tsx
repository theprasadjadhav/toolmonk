import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";
import { SitemapGenerator } from "@/components/tools/seo-tools/SitemapGenerator";

describe("SitemapGenerator", () => {
  beforeEach(() => {
    // clearMocks: true in vitest.config handles this
  });

  it("renders the URL textarea", () => {
    render(<SitemapGenerator />);
    expect(screen.getByPlaceholderText(/https:\/\/example\.com/i)).toBeInTheDocument();
  });

  it("does not show XML output when textarea is empty", () => {
    render(<SitemapGenerator />);
    expect(screen.queryByText(/sitemap\.xml preview/i)).not.toBeInTheDocument();
  });

  it("generates XML when a valid URL is entered", async () => {
    const user = userEvent.setup();
    render(<SitemapGenerator />);

    const textarea = screen.getByPlaceholderText(/https:\/\/example\.com/i);
    await user.type(textarea, "https://example.com");

    expect(screen.getByText(/sitemap\.xml preview/i)).toBeInTheDocument();
  });

  it("generated XML contains <?xml declaration", async () => {
    const user = userEvent.setup();
    render(<SitemapGenerator />);

    const textarea = screen.getByPlaceholderText(/https:\/\/example\.com/i);
    await user.type(textarea, "https://example.com");

    const previewEl = document.querySelector("pre");
    expect(previewEl?.textContent).toContain('<?xml version="1.0"');
  });

  it("generated XML contains <urlset> tag", async () => {
    const user = userEvent.setup();
    render(<SitemapGenerator />);

    const textarea = screen.getByPlaceholderText(/https:\/\/example\.com/i);
    await user.type(textarea, "https://example.com");

    const previewEl = document.querySelector("pre");
    expect(previewEl?.textContent).toContain("<urlset");
  });

  it("generated XML contains the entered URL in <loc>", async () => {
    const user = userEvent.setup();
    render(<SitemapGenerator />);

    const textarea = screen.getByPlaceholderText(/https:\/\/example\.com/i);
    await user.type(textarea, "https://example.com/about");

    const previewEl = document.querySelector("pre");
    expect(previewEl?.textContent).toContain("<loc>https://example.com/about</loc>");
  });

  it("skips invalid URLs and shows invalid count", async () => {
    const user = userEvent.setup();
    render(<SitemapGenerator />);

    const textarea = screen.getByPlaceholderText(/https:\/\/example\.com/i);
    await user.type(textarea, "https://valid.com{Enter}not-a-url");

    expect(screen.getByText(/1 invalid/i)).toBeInTheDocument();
  });

  it("shows valid URL count", async () => {
    const user = userEvent.setup();
    render(<SitemapGenerator />);

    const textarea = screen.getByPlaceholderText(/https:\/\/example\.com/i);
    await user.type(textarea, "https://example.com{Enter}https://example.com/about");

    expect(screen.getByText(/2 valid url/i)).toBeInTheDocument();
  });

  it("renders change frequency selector", () => {
    render(<SitemapGenerator />);
    expect(screen.getByDisplayValue("weekly")).toBeInTheDocument();
  });

  it("renders priority selector", () => {
    render(<SitemapGenerator />);
    expect(screen.getByDisplayValue("0.8")).toBeInTheDocument();
  });

  it("copy button calls clipboard.writeText after XML generated", async () => {
    const user = userEvent.setup();
    render(<SitemapGenerator />);

    const textarea = screen.getByPlaceholderText(/https:\/\/example\.com/i);
    await user.type(textarea, "https://example.com");

    await user.click(screen.getByRole("button", { name: /^copy$/i }));
    // userEvent has its own virtual clipboard; read back to verify
    const clipboardText = await navigator.clipboard.readText();
    expect(clipboardText).toBeTruthy();
  });

  it("download button appears after XML is generated", async () => {
    const user = userEvent.setup();
    render(<SitemapGenerator />);

    const textarea = screen.getByPlaceholderText(/https:\/\/example\.com/i);
    await user.type(textarea, "https://example.com");

    expect(screen.getByText(/download/i)).toBeInTheDocument();
  });

  it("includes <lastmod> tag when option is enabled (default)", async () => {
    const user = userEvent.setup();
    render(<SitemapGenerator />);

    const textarea = screen.getByPlaceholderText(/https:\/\/example\.com/i);
    await user.type(textarea, "https://example.com");

    const previewEl = document.querySelector("pre");
    expect(previewEl?.textContent).toContain("<lastmod>");
  });
});
