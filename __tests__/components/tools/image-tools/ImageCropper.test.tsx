import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";
import { makeImageFile } from "../../../helpers/mocks";

vi.mock("cropperjs", () => ({
  default: vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    setAspectRatio: vi.fn(),
    getCroppedCanvas: vi.fn().mockReturnValue({
      width: 100,
      height: 100,
      toBlob: vi.fn((cb: (b: Blob) => void) =>
        cb(new Blob(["cropped"], { type: "image/jpeg" }))
      ),
    }),
  })),
}));

vi.mock("@/lib/utils/image", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils/image")>();
  return {
    ...actual,
    validateImageFile: vi.fn().mockReturnValue(null),
    getImageInfo: vi.fn().mockResolvedValue({
      width: 800,
      height: 600,
      mime: "image/jpeg",
      name: "photo.jpg",
      size: 50000,
    }),
    formatBytes: vi.fn((n: number) => `${n} B`),
    stemName: vi.fn((name: string) => name.replace(/\.[^.]+$/, "")),
    revokeUrl: vi.fn(),
    downloadBlob: vi.fn(),
    getOutputMime: vi.fn().mockReturnValue("image/jpeg"),
    getOutputExtension: vi.fn().mockReturnValue("jpg"),
  };
});

import { ImageCropper } from "@/components/tools/image-tools/ImageCropper";

describe("ImageCropper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the upload drop zone", () => {
    render(<ImageCropper />);
    expect(screen.getByText(/drop an image here/i)).toBeInTheDocument();
  });

  it("file input accepts image files", () => {
    render(<ImageCropper />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input?.getAttribute("accept")).toBe("image/*");
  });

  it("shows aspect ratio preset buttons after file upload", async () => {
    const user = userEvent.setup();
    render(<ImageCropper />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /free/i })).toBeInTheDocument();
    });
  });

  it("shows common aspect ratio presets", async () => {
    const user = userEvent.setup();
    render(<ImageCropper />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /1:1/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /16:9/i })).toBeInTheDocument();
    });
  });

  it("shows output format buttons after file upload", async () => {
    const user = userEvent.setup();
    render(<ImageCropper />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^original$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^JPEG$/i })).toBeInTheDocument();
    });
  });

  it("shows crop image button after file upload", async () => {
    const user = userEvent.setup();
    render(<ImageCropper />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      // Button may say "loading..." initially until cropper is ready
      const btn = screen.getByRole("button", { name: /crop image|loading/i });
      expect(btn).toBeInTheDocument();
    });
  });

  it("shows custom aspect ratio inputs when Custom is selected", async () => {
    const user = userEvent.setup();
    render(<ImageCropper />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => screen.getByRole("button", { name: /custom/i }));

    await user.click(screen.getByRole("button", { name: /custom/i }));

    // The W and H labels are not `htmlFor` associated, check by text content
    await waitFor(() => {
      expect(screen.getByText("W")).toBeInTheDocument();
      expect(screen.getByText("H")).toBeInTheDocument();
    });
  });

  it("shows change button after file upload", async () => {
    const user = userEvent.setup();
    render(<ImageCropper />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      expect(screen.getByText(/✕ change/i)).toBeInTheDocument();
    });
  });
});
