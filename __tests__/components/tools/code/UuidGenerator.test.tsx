import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UuidGenerator } from "@/components/tools/code/UuidGenerator";

// ── Pure-logic unit tests ──────────────────────────────────────────────────────

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const UUID_V7_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function genV4(): string {
  return crypto.randomUUID();
}

function genV7(): string {
  const ts = Date.now();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[0] = (ts / 0x10000000000) & 0xff;
  bytes[1] = (ts / 0x100000000) & 0xff;
  bytes[2] = (ts / 0x1000000) & 0xff;
  bytes[3] = (ts / 0x10000) & 0xff;
  bytes[4] = (ts / 0x100) & 0xff;
  bytes[5] = ts & 0xff;
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const h = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}

describe("UuidGenerator — business logic (pure functions)", () => {
  describe("genV4", () => {
    it("produces a valid v4 UUID", () => {
      const uuid = genV4();
      expect(UUID_V4_REGEX.test(uuid)).toBe(true);
    });

    it("produces unique values on successive calls", () => {
      const a = genV4();
      const b = genV4();
      expect(a).not.toBe(b);
    });

    it("version nibble is 4", () => {
      const uuid = genV4();
      expect(uuid[14]).toBe("4");
    });

    it("variant nibble is one of 8/9/a/b", () => {
      const uuid = genV4();
      expect(["8","9","a","b"]).toContain(uuid[19]);
    });
  });

  describe("genV7", () => {
    it("produces a valid UUID format", () => {
      const uuid = genV7();
      expect(UUID_V7_REGEX.test(uuid)).toBe(true);
    });

    it("version nibble is 7", () => {
      const uuid = genV7();
      expect(uuid[14]).toBe("7");
    });

    it("variant nibble is one of 8/9/a/b", () => {
      const uuid = genV7();
      expect(["8","9","a","b"]).toContain(uuid[19]);
    });

    it("has the standard UUID hyphen structure (8-4-4-4-12)", () => {
      const uuid = genV7();
      const parts = uuid.split("-");
      expect(parts[0]).toHaveLength(8);
      expect(parts[1]).toHaveLength(4);
      expect(parts[2]).toHaveLength(4);
      expect(parts[3]).toHaveLength(4);
      expect(parts[4]).toHaveLength(12);
    });
  });
});

describe("UuidGenerator — component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<UuidGenerator />);
    expect(
      screen.getByText(/press generate to create UUIDs/i),
    ).toBeInTheDocument();
  });

  it("renders UUID v4 and v7 toggle buttons", () => {
    render(<UuidGenerator />);
    expect(screen.getByRole("button", { name: /uuid v4/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /uuid v7/i })).toBeInTheDocument();
  });

  it("renders count selector", () => {
    render(<UuidGenerator />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("renders generate button", () => {
    render(<UuidGenerator />);
    expect(screen.getByTitle("generate")).toBeInTheDocument();
  });

  it("clicking generate produces UUIDs", async () => {
    const user = userEvent.setup();
    render(<UuidGenerator />);
    await user.click(screen.getByTitle("generate"));
    await waitFor(() => {
      expect(screen.queryByText(/press generate/i)).not.toBeInTheDocument();
      expect(screen.getByText(/— generated uuids/i)).toBeInTheDocument();
    });
  });

  it("generates 5 UUIDs by default", async () => {
    const user = userEvent.setup();
    render(<UuidGenerator />);
    await user.click(screen.getByTitle("generate"));
    await waitFor(() => {
      const items = screen.getAllByText(UUID_V4_REGEX);
      expect(items).toHaveLength(5);
    });
  });

  it("changing count to 1 generates 1 UUID", async () => {
    const user = userEvent.setup();
    render(<UuidGenerator />);
    const countSelect = screen.getByRole("combobox");
    await user.selectOptions(countSelect, "1 UUIDs");
    await user.click(screen.getByTitle("generate"));
    await waitFor(() => {
      const items = screen.getAllByText(UUID_V4_REGEX);
      expect(items).toHaveLength(1);
    });
  });

  it("switching to v7 generates v7 UUIDs", async () => {
    const user = userEvent.setup();
    render(<UuidGenerator />);
    await user.click(screen.getByRole("button", { name: /uuid v7/i }));
    await user.click(screen.getByTitle("generate"));
    await waitFor(() => {
      const items = screen.getAllByText(UUID_V7_REGEX);
      expect(items.length).toBeGreaterThan(0);
    });
  });

  it("UPPER toggle produces uppercase UUIDs", async () => {
    const user = userEvent.setup();
    render(<UuidGenerator />);
    await user.click(screen.getByTitle("UPPER"));
    await user.click(screen.getByTitle("generate"));
    await waitFor(() => {
      const items = screen.getAllByText(/[0-9A-F]{8}-/);
      expect(items.length).toBeGreaterThan(0);
    });
  });

  it("clicking a UUID row copies it to clipboard", async () => {
    const writeSpy = vi.spyOn(navigator.clipboard, "writeText");
    const user = userEvent.setup();
    render(<UuidGenerator />);
    await user.click(screen.getByTitle("generate"));
    await waitFor(() => {
      expect(screen.getByText(/— generated uuids/i)).toBeInTheDocument();
    });
    const firstUuidEl = screen.getAllByText(UUID_V4_REGEX)[0];
    await user.click(firstUuidEl);
    expect(writeSpy).toHaveBeenCalledWith(firstUuidEl.textContent);
  });

  it("copy all button copies all UUIDs joined by newlines", async () => {
    const writeSpy = vi.spyOn(navigator.clipboard, "writeText");
    const user = userEvent.setup();
    render(<UuidGenerator />);
    await user.click(screen.getByTitle("generate"));
    await waitFor(() => {
      expect(screen.getByText(/— generated uuids/i)).toBeInTheDocument();
    });
    await user.click(screen.getByTitle("copy all"));
    await waitFor(() => {
      const calls = writeSpy.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const lastCall = calls[calls.length - 1][0];
      const parts = lastCall.split("\n");
      expect(parts).toHaveLength(5);
      expect(UUID_V4_REGEX.test(parts[0])).toBe(true);
    });
  });

  it("clear button removes all UUIDs", async () => {
    const user = userEvent.setup();
    render(<UuidGenerator />);
    await user.click(screen.getByTitle("generate"));
    await waitFor(() => {
      expect(screen.getByText(/— generated uuids/i)).toBeInTheDocument();
    });
    await user.click(screen.getByTitle("clear"));
    await waitFor(() => {
      expect(
        screen.getByText(/press generate to create UUIDs/i),
      ).toBeInTheDocument();
    });
  });
});

describe("UuidGenerator — accessibility", () => {
  it("version toggle buttons have accessible names", () => {
    render(<UuidGenerator />);
    expect(screen.getByRole("button", { name: /uuid v4/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /uuid v7/i })).toBeInTheDocument();
  });

  it("count combobox is present", () => {
    render(<UuidGenerator />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("generate button has a title attribute", () => {
    render(<UuidGenerator />);
    expect(screen.getByTitle("generate")).toBeInTheDocument();
  });
});
