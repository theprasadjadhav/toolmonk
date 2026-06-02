import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";
import { makeImageFile } from "../../../helpers/mocks";

vi.mock("@imgly/background-removal", () => ({
  removeBackground: vi.fn().mockResolvedValue(new Blob([""], { type: "image/png" })),
  preload: vi.fn().mockResolvedValue(undefined),
}));

// Mock dynamic imports used inside the component
vi.mock("@/lib/utils/image", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils/image")>();
  return {
    ...actual,
    validateImageFile: vi.fn().mockReturnValue(null),
    formatBytes: vi.fn((n: number) => `${n} B`),
    stemName: vi.fn((name: string) => name.replace(/\.[^.]+$/, "")),
    downloadBlob: vi.fn(),
  };
});

import { BackgroundRemover } from "@/components/tools/image-tools/BackgroundRemover";

describe("BackgroundRemover", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the upload drop zone", () => {
    render(<BackgroundRemover />);
    expect(screen.getByText(/drop an image here/i)).toBeInTheDocument();
  });

  it("file input accepts image files", () => {
    render(<BackgroundRemover />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.getAttribute("accept")).toBe("image/*");
  });

  it("drop zone is keyboard accessible (has role=button)", () => {
    render(<BackgroundRemover />);
    expect(screen.getByRole("button", { name: /drop/i })).toBeInTheDocument();
  });

  it("shows quality (Fast, Balanced, Best) model buttons after file upload", async () => {
    const user = userEvent.setup();
    render(<BackgroundRemover />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      expect(screen.getByText("Fast")).toBeInTheDocument();
      expect(screen.getByText("Balanced")).toBeInTheDocument();
      expect(screen.getByText("Best")).toBeInTheDocument();
    });
  });

  it("shows background fill options after file upload", async () => {
    const user = userEvent.setup();
    render(<BackgroundRemover />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      expect(screen.getByText(/transparent/i)).toBeInTheDocument();
      expect(screen.getByText(/solid color/i)).toBeInTheDocument();
    });
  });

  it("shows 'Remove background' button after file upload", async () => {
    const user = userEvent.setup();
    render(<BackgroundRemover />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /remove background/i })).toBeInTheDocument();
    });
  });

  it("shows file info bar with change button after upload", async () => {
    const user = userEvent.setup();
    render(<BackgroundRemover />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      expect(screen.getByText(/✕ change/i)).toBeInTheDocument();
    });
  });

  it("shows original and result preview panels after upload", async () => {
    const user = userEvent.setup();
    render(<BackgroundRemover />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      expect(screen.getByText(/— original/i)).toBeInTheDocument();
      expect(screen.getByText(/— result/i)).toBeInTheDocument();
    });
  });
});
