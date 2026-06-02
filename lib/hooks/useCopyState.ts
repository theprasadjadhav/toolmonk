import { useState, useCallback } from "react";

/**
 * Tracks which item key was last copied. Pass the key + value to `copy()`;
 * the state resets after `timeout` ms (default 1500).
 */
export function useCopyState(timeout = 1500) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = useCallback(
    (key: string, value: string) => {
      navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), timeout);
    },
    [timeout],
  );

  return { copied, copy };
}
