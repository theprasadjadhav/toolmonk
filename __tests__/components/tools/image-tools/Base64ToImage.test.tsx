import React from "react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";
import { Base64ToImage } from "@/components/tools/image-tools/Base64ToImage";

// Minimal valid 1x1 PNG in base64
const TINY_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const TINY_PNG_DATA_URI = `data:image/png;base64,${TINY_PNG_BASE64}`;

// Mock Image so onload fires synchronously
let OriginalImage: typeof Image;
beforeEach(() => {
  OriginalImage = global.Image;
  (global as unknown as { Image: unknown }).Image = class MockImage {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    naturalWidth = 1;
    naturalHeight = 1;
    private _src = "";
    get src() { return this._src; }
    set src(val: string) {
      this._src = val;
      setTimeout(() => this.onload?.(), 0);
    }
  };
});

afterEach(() => {
  global.Image = OriginalImage;
});

describe("Base64ToImage", () => {
  it("renders a textarea for base64 input", () => {
    render(<Base64ToImage />);
    expect(screen.getByPlaceholderText(/paste a base64 string/i)).toBeInTheDocument();
  });

  it("renders upload .txt button", () => {
    render(<Base64ToImage />);
    expect(screen.getByRole("button", { name: /upload/i })).toBeInTheDocument();
  });

  it("hidden file input accepts .txt files", () => {
    render(<Base64ToImage />);
    // The hidden file input for .txt upload
    const inputs = document.querySelectorAll('input[type="file"]');
    const txtInput = Array.from(inputs).find((el) =>
      (el as HTMLInputElement).accept.includes(".txt")
    );
    expect(txtInput).toBeInTheDocument();
  });

  it("shows error for invalid base64 string", async () => {
    render(<Base64ToImage />);
    const textarea = screen.getByPlaceholderText(/paste a base64 string/i);
    // Use fireEvent.change to bypass debounce timing concerns with userEvent
    fireEvent.change(textarea, { target: { value: "!!not-base64!!" } });

    await waitFor(() => {
      expect(screen.getByText(/invalid base64/i)).toBeInTheDocument();
    });
  });

  it("shows decoded image after valid data URI entered", async () => {
    render(<Base64ToImage />);
    const textarea = screen.getByPlaceholderText(/paste a base64 string/i);
    fireEvent.change(textarea, { target: { value: TINY_PNG_DATA_URI } });

    await waitFor(() => {
      expect(screen.getByAltText("Decoded")).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it("shows format metadata after decode", async () => {
    render(<Base64ToImage />);
    const textarea = screen.getByPlaceholderText(/paste a base64 string/i);
    fireEvent.change(textarea, { target: { value: TINY_PNG_DATA_URI } });

    await waitFor(() => {
      expect(screen.getByText("PNG")).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it("shows Download button after successful decode", async () => {
    render(<Base64ToImage />);
    const textarea = screen.getByPlaceholderText(/paste a base64 string/i);
    fireEvent.change(textarea, { target: { value: TINY_PNG_DATA_URI } });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /download/i })).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it("shows copy data URI button after decode", async () => {
    render(<Base64ToImage />);
    const textarea = screen.getByPlaceholderText(/paste a base64 string/i);
    fireEvent.change(textarea, { target: { value: TINY_PNG_DATA_URI } });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /copy data uri/i })).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it("shows char count as user types", async () => {
    const user = userEvent.setup();
    render(<Base64ToImage />);

    const textarea = screen.getByPlaceholderText(/paste a base64 string/i);
    await user.type(textarea, "abc");

    expect(screen.getByText(/chars/i)).toBeInTheDocument();
  });

  it("Clear button appears after typing and clears the input", async () => {
    const user = userEvent.setup();
    render(<Base64ToImage />);

    const textarea = screen.getByPlaceholderText(/paste a base64 string/i);
    await user.type(textarea, "abc");

    const clearButton = screen.getByRole("button", { name: /clear/i });
    expect(clearButton).toBeInTheDocument();

    await user.click(clearButton);
    expect(textarea).toHaveValue("");
  });
});
