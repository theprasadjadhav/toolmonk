/**
 * Shared mock helpers used across test files.
 */
import { vi, expect } from "vitest";
import { fireEvent } from "@testing-library/react";

/** Reset clipboard mock call counts between tests (clearMocks:true in vitest.config handles this automatically) */
export function clearClipboard() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (navigator.clipboard.writeText as any).mockClear?.();
}

/**
 * Assert that the clipboard contains the given value.
 * Works with both userEvent's virtual clipboard (readText) and vi.fn spy fallback.
 */
export async function expectCopied(value: string) {
  if (vi.isMockFunction(navigator.clipboard?.writeText)) {
    // Direct spy (non-userEvent tests)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(value);
  } else {
    // userEvent virtual clipboard — read back what was written
    const text = await navigator.clipboard.readText();
    expect(text).toBe(value);
  }
}

/** Assert clipboard was written (any value) */
export async function expectAnyCopied() {
  if (vi.isMockFunction(navigator.clipboard?.writeText)) {
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  } else {
    const text = await navigator.clipboard.readText();
    expect(text).toBeTruthy();
  }
}

/**
 * Type text into an element using fireEvent.change instead of userEvent.type.
 * Use this for strings containing `{` or `}` (e.g. JSON) since userEvent v14
 * treats `{` as a special keyboard modifier character.
 */
export function typeValue(element: Element, value: string) {
  fireEvent.change(element, { target: { value } });
}

/** Stub fetch for tools that call external APIs (e.g. currency, domain age) */
export function mockFetch(data: unknown, ok = true) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  });
}

/** Create a mock File object */
export function makeFile(name: string, content: string, type = "text/plain") {
  return new File([content], name, { type });
}

/** Create a mock image File */
export function makeImageFile(name = "test.png") {
  return new File(["fake-image-data"], name, { type: "image/png" });
}
