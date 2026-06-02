import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";
import { makeImageFile } from "../../../helpers/mocks";

vi.mock("@/lib/utils/image", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils/image")>();
  return {
    ...actual,
    validateImageFile: vi.fn().mockReturnValue(null),
    getImageInfo: vi.fn().mockResolvedValue({
      width: 1920,
      height: 1080,
      mime: "image/jpeg",
      name: "photo.jpg",
      size: 100000,
    }),
    processWithWorker: vi.fn().mockResolvedValue(
      new Blob(["resized"], { type: "image/jpeg" })
    ),
    formatBytes: vi.fn((n: number) => `${n} B`),
    stemName: vi.fn((name: string) => name.replace(/\.[^.]+$/, "")),
    revokeUrl: vi.fn(),
    downloadBlob: vi.fn(),
    getOutputMime: vi.fn().mockReturnValue("image/jpeg"),
    getOutputExtension: vi.fn().mockReturnValue("jpg"),
  };
});

import { ImageResizer } from "@/components/tools/image-tools/ImageResizer";

describe("ImageResizer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the upload drop zone", () => {
    render(<ImageResizer />);
    expect(screen.getByText(/drop an image here/i)).toBeInTheDocument();
  });

  it("file input accepts image files", () => {
    render(<ImageResizer />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input?.getAttribute("accept")).toBe("image/*");
  });

  it("shows dimension inputs after file upload", async () => {
    const user = userEvent.setup();
    render(<ImageResizer />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.jpg"));

    await waitFor(() => {
      // Labels are rendered as siblings, not with htmlFor associations
      // Check by label text content
      expect(screen.getByText(/^Width px$/i)).toBeInTheDocument();
      expect(screen.getByText(/^Height px$/i)).toBeInTheDocument();
    });
  });

  it("seeds dimension inputs with original image size", async () => {
    const user = userEvent.setup();
    render(<ImageResizer />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.jpg"));

    await waitFor(() => {
      expect(screen.getByDisplayValue("1920")).toBeInTheDocument();
      expect(screen.getByDisplayValue("1080")).toBeInTheDocument();
    });
  });

  it("shows resize mode toggle buttons", async () => {
    const user = userEvent.setup();
    render(<ImageResizer />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.jpg"));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /pixels/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /percentage/i })).toBeInTheDocument();
    });
  });

  it("shows fit mode buttons", async () => {
    const user = userEvent.setup();
    render(<ImageResizer />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.jpg"));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /stretch/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /contain/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /cover/i })).toBeInTheDocument();
    });
  });

  it("shows output format buttons", async () => {
    const user = userEvent.setup();
    render(<ImageResizer />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.jpg"));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^original$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^jpeg$/i })).toBeInTheDocument();
    });
  });

  it("shows resize button", async () => {
    const user = userEvent.setup();
    render(<ImageResizer />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.jpg"));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^resize$/i })).toBeInTheDocument();
    });
  });

  it("shows validation error for width below 1", async () => {
    const user = userEvent.setup();
    render(<ImageResizer />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.jpg"));

    await waitFor(() => screen.getByDisplayValue("1920"));

    const widthInput = screen.getByDisplayValue("1920");
    await user.clear(widthInput);
    await user.type(widthInput, "0");

    await waitFor(() => {
      expect(screen.getByText(/min 1 px/i)).toBeInTheDocument();
    });
  });

  it("shows aspect ratio lock button", async () => {
    const user = userEvent.setup();
    render(<ImageResizer />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.jpg"));

    await waitFor(() => {
      expect(screen.getByText(/locked|free/i)).toBeInTheDocument();
    });
  });

  it("shows background color options when 'contain' mode is selected", async () => {
    const user = userEvent.setup();
    render(<ImageResizer />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.jpg"));

    await waitFor(() => screen.getByRole("button", { name: /contain/i }));

    await user.click(screen.getByRole("button", { name: /contain/i }));

    expect(screen.getByText(/background color/i)).toBeInTheDocument();
  });
});
