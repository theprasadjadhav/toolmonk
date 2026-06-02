export type JsonParseResult =
  | { ok: true; value: unknown }
  | { ok: false; error: string };

export function parseJSON(raw: string): JsonParseResult {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export function formatJSON(value: unknown, indent: number): string {
  return JSON.stringify(value, null, indent);
}

export function minifyJSON(value: unknown): string {
  return JSON.stringify(value);
}

export type DiffLine = {
  type: "added" | "removed" | "unchanged";
  content: string;
  lineA: number | null;
  lineB: number | null;
};

export type DiffStats = { added: number; removed: number; unchanged: number };

export function diffJSON(a: unknown, b: unknown, indent = 2): { lines: DiffLine[]; stats: DiffStats } {
  const aLines = formatJSON(a, indent).split("\n");
  const bLines = formatJSON(b, indent).split("\n");

  // LCS-based diff
  const m = aLines.length, n = bLines.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = aLines[i - 1] === bLines[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);

  const raw: Omit<DiffLine, "lineA" | "lineB">[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && aLines[i - 1] === bLines[j - 1]) {
      raw.unshift({ type: "unchanged", content: aLines[i - 1] }); i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      raw.unshift({ type: "added", content: bLines[j - 1] }); j--;
    } else {
      raw.unshift({ type: "removed", content: aLines[i - 1] }); i--;
    }
  }

  // Assign line numbers
  let la = 1, lb = 1;
  const lines: DiffLine[] = raw.map((r) => {
    if (r.type === "unchanged") return { ...r, lineA: la++, lineB: lb++ };
    if (r.type === "removed")   return { ...r, lineA: la++, lineB: null };
    return { ...r, lineA: null, lineB: lb++ };
  });

  const stats: DiffStats = { added: 0, removed: 0, unchanged: 0 };
  for (const l of lines) stats[l.type]++;
  return { lines, stats };
}

export function syntaxHighlight(json: string): string {
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        if (/^"/.test(match)) {
          if (/:$/.test(match))
            return `<span style="color:#9CDCFE">${match}</span>`;
          return `<span style="color:#CE9178">${match}</span>`;
        }
        if (/true|false|null/.test(match))
          return `<span style="color:#569CD6">${match}</span>`;
        return `<span style="color:#B5CEA8">${match}</span>`;
      }
    );
}
