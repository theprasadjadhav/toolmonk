import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";
import { makeImageFile } from "../../../helpers/mocks";

vi.mock("browser-image-compression", () => ({
  default: vi.fn().mockResolvedValue(
    new File(["compressed"], "out.jpg", { type: "image/jpeg" })
  ),
}));

vi.mock("@/lib/utils/image", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils/image")>();
  return {
    ...actual,
    validateImageFile: vi.fn().mockReturnValue(null),
    getImageInfo: vi.fn().mockResolvedValue({ width: 800, height: 600, mime: "image/jpeg", name: "test.jpg" }),
    processWithWorker: vi.fn().mockResolvedValue(new Blob(["compressed"], { type: "image/jpeg" })),
    formatBytes: vi.fn((n: number) => `${n} B`),
    stemName: vi.fn((name: string) => name.replace(/\.[^.]+$/, "")),
    revokeUrl: vi.fn(),
    downloadBlob: vi.fn(),
    getOutputMime: vi.fn().mockReturnValue("image/jpeg"),
    getOutputExtension: vi.fn().mockReturnValue("jpg"),
  };
});

import { ImageCompressor } from "@/components/tools/image-tools/ImageCompressor";

describe("ImageCompressor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the upload drop zone", () => {
    render(<ImageCompressor />);
    expect(screen.getByText(/drop an image here/i)).toBeInTheDocument();
  });

  it("file input accepts image files", () => {
    render(<ImageCompressor />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input?.getAttribute("accept")).toBe("image/*");
  });

  it("shows quality slider after file is uploaded", async () => {
    const user = userEvent.setup();
    render(<ImageCompressor />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.jpg"));

    await waitFor(() => {
      expect(screen.getByRole("slider")).toBeInTheDocument();
    });
  });

  it("shows output format buttons after file upload", async () => {
    const user = userEvent.setup();
    render(<ImageCompressor />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.jpg"));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^original$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^jpeg$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^png$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^webp$/i })).toBeInTheDocument();
    });
  });

  it("shows compress button after file upload", async () => {
    const user = userEvent.setup();
    render(<ImageCompressor />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.jpg"));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /compress$/i })).toBeInTheDocument();
    });
  });

  it("shows max dimension input after file upload", async () => {
    const user = userEvent.setup();
    render(<ImageCompressor />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.jpg"));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/1920/i)).toBeInTheDocument();
    });
  });

  it("shows validation error for invalid max dimension", async () => {
    const user = userEvent.setup();
    render(<ImageCompressor />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.jpg"));

    await waitFor(() => screen.getByPlaceholderText(/1920/i));

    const dimInput = screen.getByPlaceholderText(/1920/i);
    await user.type(dimInput, "10");

    await waitFor(() => {
      expect(screen.getByText(/min 32/i)).toBeInTheDocument();
    });
  });

  it("shows change button after file is uploaded", async () => {
    const user = userEvent.setup();
    render(<ImageCompressor />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.jpg"));

    await waitFor(() => {
      expect(screen.getByText(/✕ change/i)).toBeInTheDocument();
    });
  });

  it("shows original and compressed preview panels after upload", async () => {
    const user = userEvent.setup();
    render(<ImageCompressor />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.jpg"));

    await waitFor(() => {
      expect(screen.getByText(/— original/i)).toBeInTheDocument();
      expect(screen.getByText(/— compressed/i)).toBeInTheDocument();
    });
  });
});
