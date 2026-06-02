import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";
import { KeywordDensityChecker } from "@/components/tools/shared/text/KeywordDensityChecker";

describe("KeywordDensityChecker", () => {
  it("renders the text input area", () => {
    render(<KeywordDensityChecker />);
    expect(screen.getByPlaceholderText(/paste your page content/i)).toBeInTheDocument();
  });

  it("shows no results when input is empty", () => {
    render(<KeywordDensityChecker />);
    expect(screen.queryByText(/keyword density/i)).not.toBeInTheDocument();
  });

  it("shows keyword results after entering text", async () => {
    const user = userEvent.setup();
    render(<KeywordDensityChecker />);

    const textarea = screen.getByPlaceholderText(/paste your page content/i);
    await user.type(textarea, "apple apple apple banana banana cherry");

    // Should show the results table header
    expect(screen.getByText(/keyword density/i)).toBeInTheDocument();
  });

  it("shows word count after input", async () => {
    const user = userEvent.setup();
    render(<KeywordDensityChecker />);

    const textarea = screen.getByPlaceholderText(/paste your page content/i);
    await user.type(textarea, "testing testing testing");

    expect(screen.getByText(/words analysed/i)).toBeInTheDocument();
  });

  it("shows count and percentage columns in results", async () => {
    const user = userEvent.setup();
    render(<KeywordDensityChecker />);

    const textarea = screen.getByPlaceholderText(/paste your page content/i);
    await user.type(textarea, "hello hello hello world world");

    expect(screen.getByText("Count")).toBeInTheDocument();
    expect(screen.getByText("Density")).toBeInTheDocument();
  });

  it("renders min word length input", () => {
    render(<KeywordDensityChecker />);
    expect(screen.getByDisplayValue("3")).toBeInTheDocument();
  });

  it("renders top results input", () => {
    render(<KeywordDensityChecker />);
    expect(screen.getByDisplayValue("20")).toBeInTheDocument();
  });

  it("shows validation error for invalid min word length", async () => {
    const user = userEvent.setup();
    render(<KeywordDensityChecker />);

    const minInput = screen.getByDisplayValue("3");
    await user.clear(minInput);
    await user.type(minInput, "25");

    expect(screen.getByText(/max 20/i)).toBeInTheDocument();
  });

  it("ignore stop words toggle is visible", () => {
    render(<KeywordDensityChecker />);
    expect(screen.getByText(/ignore common words/i)).toBeInTheDocument();
  });

  it("shows 'no keywords found' when all words are filtered out", async () => {
    const user = userEvent.setup();
    render(<KeywordDensityChecker />);

    // "a the and" are all stop words
    const textarea = screen.getByPlaceholderText(/paste your page content/i);
    await user.type(textarea, "a the and");

    // Wait for the "no keywords" message (stop words ignored by default)
    expect(screen.getByText(/no keywords found/i)).toBeInTheDocument();
  });
});
