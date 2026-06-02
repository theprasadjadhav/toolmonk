import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";
import { makeImageFile } from "../../../helpers/mocks";

vi.mock("@/lib/utils/image", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils/image")>();
  return {
    ...actual,
    validateImageFile: vi.fn().mockReturnValue(null),
    stemName: vi.fn((name: string) => name.replace(/\.[^.]+$/, "")),
    downloadBlob: vi.fn(),
  };
});

// Mock Image so onload fires synchronously
let OriginalImage: typeof Image;
beforeEach(() => {
  OriginalImage = global.Image;
  (global as unknown as { Image: unknown }).Image = class MockImage {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    naturalWidth = 800;
    naturalHeight = 600;
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
  vi.clearAllMocks();
});

import { ImageWatermark } from "@/components/tools/image-tools/ImageWatermark";

describe("ImageWatermark", () => {
  it("renders the upload drop zone", () => {
    render(<ImageWatermark />);
    expect(screen.getByText(/drop images here/i)).toBeInTheDocument();
  });

  it("file input accepts image files and allows multiple", () => {
    render(<ImageWatermark />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input?.getAttribute("accept")).toBe("image/*");
    expect(input?.hasAttribute("multiple")).toBe(true);
  });

  it("shows watermark text input after file upload", async () => {
    const user = userEvent.setup();
    render(<ImageWatermark />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter watermark text/i)).toBeInTheDocument();
    });
  });

  it("shows default watermark text '© Your Name'", async () => {
    const user = userEvent.setup();
    render(<ImageWatermark />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      expect(screen.getByDisplayValue("© Your Name")).toBeInTheDocument();
    });
  });

  it("shows font family selector after file upload", async () => {
    const user = userEvent.setup();
    render(<ImageWatermark />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      expect(screen.getByDisplayValue("Arial")).toBeInTheDocument();
    });
  });

  it("shows font size slider after file upload", async () => {
    const user = userEvent.setup();
    render(<ImageWatermark />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      expect(screen.getByText(/font size/i)).toBeInTheDocument();
    });
  });

  it("shows opacity slider after file upload", async () => {
    const user = userEvent.setup();
    render(<ImageWatermark />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      expect(screen.getByText(/opacity/i)).toBeInTheDocument();
    });
  });

  it("shows single/repeat mode buttons after file upload", async () => {
    const user = userEvent.setup();
    render(<ImageWatermark />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^single$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^repeat$/i })).toBeInTheDocument();
    });
  });

  it("shows position grid when in single mode", async () => {
    const user = userEvent.setup();
    render(<ImageWatermark />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      // Position grid buttons (TL, TC, TR, etc.)
      expect(screen.getByTitle("MC")).toBeInTheDocument();
    });
  });

  it("shows output format buttons", async () => {
    const user = userEvent.setup();
    render(<ImageWatermark />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^original$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^jpeg$/i })).toBeInTheDocument();
    });
  });

  it("download button is disabled when watermark text is empty", async () => {
    const user = userEvent.setup();
    render(<ImageWatermark />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => screen.getByPlaceholderText(/enter watermark text/i));

    const textInput = screen.getByDisplayValue("© Your Name");
    await user.clear(textInput);

    const downloadBtn = screen.getByRole("button", { name: /download/i });
    expect(downloadBtn).toBeDisabled();
  });

  it("shows canvas preview element after file upload", async () => {
    const user = userEvent.setup();
    render(<ImageWatermark />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      expect(document.querySelector("canvas")).toBeInTheDocument();
    });
  });
});
