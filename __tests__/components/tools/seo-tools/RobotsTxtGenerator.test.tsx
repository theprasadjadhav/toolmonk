import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";
import { RobotsTxtGenerator } from "@/components/tools/seo-tools/RobotsTxtGenerator";

describe("RobotsTxtGenerator", () => {
  beforeEach(() => {
    // clearMocks: true in vitest.config handles this
  });

  it("renders with a default rule block", () => {
    render(<RobotsTxtGenerator />);
    expect(screen.getByText(/rule 1/i)).toBeInTheDocument();
  });

  it("renders user-agent selector", () => {
    render(<RobotsTxtGenerator />);
    expect(screen.getByDisplayValue(/all robots/i)).toBeInTheDocument();
  });

  it("renders disallow and allow path textareas", () => {
    render(<RobotsTxtGenerator />);
    expect(screen.getAllByPlaceholderText(/admin/i).length).toBeGreaterThanOrEqual(1);
  });

  it("generates 'User-agent: *' in preview by default", () => {
    render(<RobotsTxtGenerator />);
    const previewEl = document.querySelector("pre");
    expect(previewEl?.textContent).toContain("User-agent: *");
  });

  it("generates Disallow entries from disallow paths textarea", () => {
    render(<RobotsTxtGenerator />);
    const previewEl = document.querySelector("pre");
    // Default value has /admin/ and /private/
    expect(previewEl?.textContent).toContain("Disallow: /admin/");
  });

  it("adds a new rule block when '+ add rule block' is clicked", async () => {
    const user = userEvent.setup();
    render(<RobotsTxtGenerator />);

    await user.click(screen.getByText(/add rule block/i));

    expect(screen.getByText(/rule 2/i)).toBeInTheDocument();
  });

  it("removes a rule block when remove is clicked (with 2+ rules)", async () => {
    const user = userEvent.setup();
    render(<RobotsTxtGenerator />);

    await user.click(screen.getByText(/add rule block/i));
    expect(screen.getByText(/rule 2/i)).toBeInTheDocument();

    // Click first remove button
    const removeButtons = screen.getAllByText(/✕ remove/);
    await user.click(removeButtons[0]);

    expect(screen.queryByText(/rule 2/i)).not.toBeInTheDocument();
  });

  it("shows custom user-agent input when 'Custom' is selected", async () => {
    const user = userEvent.setup();
    render(<RobotsTxtGenerator />);

    const select = screen.getByDisplayValue(/all robots/i);
    await user.selectOptions(select, "Custom");

    expect(screen.getByPlaceholderText("MyBot")).toBeInTheDocument();
  });

  it("includes Sitemap in preview when sitemap URL is entered", async () => {
    const user = userEvent.setup();
    render(<RobotsTxtGenerator />);

    const sitemapInput = screen.getByPlaceholderText(/sitemap\.xml/i);
    await user.type(sitemapInput, "https://example.com/sitemap.xml");

    const previewEl = document.querySelector("pre");
    expect(previewEl?.textContent).toContain("Sitemap: https://example.com/sitemap.xml");
  });

  it("copy button calls clipboard.writeText", async () => {
    const user = userEvent.setup();
    render(<RobotsTxtGenerator />);

    await user.click(screen.getByRole("button", { name: /copy$/i }));
    // userEvent has its own virtual clipboard; read back to verify
    const clipboardText = await navigator.clipboard.readText();
    expect(clipboardText).toBeTruthy();
  });

  it("download button is present", () => {
    render(<RobotsTxtGenerator />);
    expect(screen.getByText(/download/i)).toBeInTheDocument();
  });

  it("crawl delay input is rendered", () => {
    render(<RobotsTxtGenerator />);
    expect(screen.getByPlaceholderText("—")).toBeInTheDocument();
  });
});
