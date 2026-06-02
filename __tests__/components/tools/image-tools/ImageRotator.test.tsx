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
    formatBytes: vi.fn((n: number) => `${n} B`),
    stemName: vi.fn((name: string) => name.replace(/\.[^.]+$/, "")),
    downloadBlob: vi.fn(),
    getOutputMime: vi.fn().mockReturnValue("image/jpeg"),
    getOutputExtension: vi.fn().mockReturnValue("jpg"),
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

import { ImageRotator } from "@/components/tools/image-tools/ImageRotator";

describe("ImageRotator", () => {
  it("renders the upload drop zone initially", () => {
    render(<ImageRotator />);
    expect(screen.getByText(/drop images here/i)).toBeInTheDocument();
  });

  it("file input accepts image files and allows multiple", () => {
    render(<ImageRotator />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input?.getAttribute("accept")).toBe("image/*");
    expect(input?.hasAttribute("multiple")).toBe(true);
  });

  it("shows rotation buttons (90° Left, 90° Right) after file upload", async () => {
    const user = userEvent.setup();
    render(<ImageRotator />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      expect(screen.getByText(/90° left/i)).toBeInTheDocument();
      expect(screen.getByText(/90° right/i)).toBeInTheDocument();
    });
  });

  it("shows angle input field after file upload", async () => {
    const user = userEvent.setup();
    render(<ImageRotator />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      expect(screen.getByDisplayValue("0")).toBeInTheDocument();
    });
  });

  it("shows flip buttons after file upload", async () => {
    const user = userEvent.setup();
    render(<ImageRotator />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      expect(screen.getByText(/horizontal/i)).toBeInTheDocument();
      expect(screen.getByText(/vertical/i)).toBeInTheDocument();
    });
  });

  it("shows expand/clip canvas buttons after file upload", async () => {
    const user = userEvent.setup();
    render(<ImageRotator />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /expand/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /clip/i })).toBeInTheDocument();
    });
  });

  it("shows output format selector after file upload", async () => {
    const user = userEvent.setup();
    render(<ImageRotator />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^original$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^JPEG$/i })).toBeInTheDocument();
    });
  });

  it("shows download button after file upload", async () => {
    const user = userEvent.setup();
    render(<ImageRotator />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /download/i })).toBeInTheDocument();
    });
  });

  it("shows validation error for angle out of range", async () => {
    const user = userEvent.setup();
    render(<ImageRotator />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => screen.getByDisplayValue("0"));

    const angleInput = screen.getByDisplayValue("0");
    await user.clear(angleInput);
    await user.type(angleInput, "400");

    expect(screen.getByText(/angle must be between -360 and 360/i)).toBeInTheDocument();
  });

  it("shows canvas preview element after file upload", async () => {
    const user = userEvent.setup();
    render(<ImageRotator />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      expect(document.querySelector("canvas")).toBeInTheDocument();
    });
  });

  it("shows thumbnail strip and + Add more images strip after file upload", async () => {
    const user = userEvent.setup();
    render(<ImageRotator />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      expect(screen.getByText(/add more images/i)).toBeInTheDocument();
    });
  });
});
