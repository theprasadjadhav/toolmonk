export type XmlParseResult =
  | { ok: true; rootTag: string; elementCount: number }
  | { ok: false; error: string };

function cleanXmlError(raw: string): string {
  // Chrome/Safari: "error on line N at column M: MESSAGE"
  const lineMatch = raw.match(/error on line \d+ at column \d+:\s*(.+)/i);
  if (lineMatch) return lineMatch[1].trim();
  // Firefox: "XML Parsing Error: MESSAGE"
  const ffMatch = raw.match(/XML Parsing Error:\s*(.+)/i);
  if (ffMatch) return ffMatch[1].trim();
  return raw.split("\n")[0].trim();
}

export function parseXML(raw: string): XmlParseResult {
  if (typeof DOMParser === "undefined") return { ok: false, error: "XML parsing requires a browser" };
  const parser = new DOMParser();
  const doc = parser.parseFromString(raw, "application/xml");
  const err = doc.querySelector("parsererror");
  if (err) {
    return { ok: false, error: cleanXmlError(err.textContent ?? "Invalid XML") };
  }
  return {
    ok: true,
    rootTag: doc.documentElement.tagName,
    elementCount: doc.querySelectorAll("*").length,
  };
}

export function formatXML(raw: string, spaces = 2): string {
  const pad = " ".repeat(spaces);
  const tokens: string[] = [];
  const re = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<[^>]*>|[^<]+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) tokens.push(m[0]);

  let depth = 0;
  let out = "";

  for (const tok of tokens) {
    const t = tok.trim();
    if (!t) continue;

    if (t.startsWith("<!--") || t.startsWith("<![CDATA[")) {
      out += (out ? "\n" : "") + pad.repeat(depth) + t;
    } else if (t.startsWith("</")) {
      depth = Math.max(0, depth - 1);
      out += "\n" + pad.repeat(depth) + t;
    } else if (t.startsWith("<?") || (t.startsWith("<!") && !t.startsWith("<![CDATA["))) {
      out += (out ? "\n" : "") + t;
    } else if (t.startsWith("<") && t.endsWith("/>")) {
      out += "\n" + pad.repeat(depth) + t;
    } else if (t.startsWith("<")) {
      out += (out ? "\n" : "") + pad.repeat(depth) + t;
      depth++;
    } else {
      out += "\n" + pad.repeat(depth) + t;
    }
  }

  return out.startsWith("\n") ? out.slice(1) : out;
}

export function minifyXML(raw: string): string {
  return raw
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function syntaxHighlightXML(xml: string): string {
  const result: string[] = [];
  const re = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<[^>]*>|[^<]+/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(xml)) !== null) {
    const tok = m[0];

    if (tok.startsWith("<!--")) {
      result.push(`<span style="color:#6A9955">${escHtml(tok)}</span>`);
    } else if (tok.startsWith("<![CDATA[")) {
      result.push(`<span style="color:#CE9178">${escHtml(tok)}</span>`);
    } else if (tok.startsWith("<?")) {
      result.push(`<span style="color:#808080">${escHtml(tok)}</span>`);
    } else if (tok.startsWith("</")) {
      result.push(`<span style="color:#4EC9B0">${escHtml(tok)}</span>`);
    } else if (tok.startsWith("<")) {
      const selfClose = tok.endsWith("/>");
      const inner = tok.slice(1, selfClose ? -2 : -1);
      const spaceIdx = inner.search(/\s/);
      const tagName = spaceIdx === -1 ? inner : inner.slice(0, spaceIdx);
      const attrStr = spaceIdx === -1 ? "" : inner.slice(spaceIdx);
      const closeChar = selfClose ? "/>" : ">";

      const styledAttrs = escHtml(attrStr).replace(
        /([\w:.-]+)(\s*=\s*)("(?:[^"]*)")/g,
        `<span style="color:#9CDCFE">$1</span>$2<span style="color:#CE9178">$3</span>`
      );

      result.push(
        `<span style="color:#4EC9B0">&lt;${escHtml(tagName)}</span>` +
          styledAttrs +
          `<span style="color:#4EC9B0">${escHtml(closeChar)}</span>`
      );
    } else {
      result.push(escHtml(tok));
    }
  }

  return result.join("");
}
