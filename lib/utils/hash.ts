// ── Helpers ────────────────────────────────────────────────────────────────────

function u32(n: number): number {
  return n >>> 0;
}

function add(a: number, b: number): number {
  return u32(a + b);
}

function rotl(x: number, n: number): number {
  return u32((x << n) | (x >>> (32 - n)));
}

// ── MD5 (synchronous, pure JS) ─────────────────────────────────────────────────

// Per-step shift amounts (RFC 1321 §3.4)
const MD5_S = [
  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,
  5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,
  4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,
  6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,
];

// Precomputed T[i] = floor(|sin(i+1)| * 2^32)  (RFC 1321 §3.4)
const MD5_T = [
  0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
  0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
  0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
  0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
  0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
  0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
  0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
  0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
];

function md5Block(M: number[], a0: number, b0: number, c0: number, d0: number): [number, number, number, number] {
  let a = a0, b = b0, c = c0, d = d0;
  for (let i = 0; i < 64; i++) {
    let F: number, g: number;
    if (i < 16)      { F = u32((b & c) | (~b & d)); g = i; }
    else if (i < 32) { F = u32((d & b) | (~d & c)); g = (5 * i + 1) % 16; }
    else if (i < 48) { F = u32(b ^ c ^ d);           g = (3 * i + 5) % 16; }
    else             { F = u32(c ^ (b | ~d));         g = (7 * i) % 16; }
    const tmp = add(add(a, F), add(M[g], MD5_T[i]));
    a = d; d = c; c = b;
    b = add(b, rotl(tmp, MD5_S[i]));
  }
  return [add(a0, a), add(b0, b), add(c0, c), add(d0, d)];
}

function leHex(words: number[]): string {
  return words.map(w =>
    u32(w).toString(16).padStart(8, "0").match(/../g)!.reverse().join("")
  ).join("");
}

export function md5(str: string): string {
  const bytes = new TextEncoder().encode(str);
  const len = bytes.length;
  const bitLen = len * 8;
  const padLen = (55 - (len % 64) + 64) % 64;
  const padded = new Uint8Array(len + 1 + padLen + 8);
  padded.set(bytes);
  padded[len] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 8, bitLen >>> 0, true);
  dv.setUint32(padded.length - 4, Math.floor(bitLen / 2 ** 32) >>> 0, true);

  let [a, b, c, d] = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];
  for (let off = 0; off < padded.length; off += 64) {
    const M = Array.from({ length: 16 }, (_, i) => dv.getUint32(off + i * 4, true));
    [a, b, c, d] = md5Block(M, a, b, c, d);
  }
  return leHex([a, b, c, d]);
}

// ── SHA via Web Crypto API (async) ─────────────────────────────────────────────

async function digest(alg: AlgorithmIdentifier, text: string): Promise<string> {
  const buf = await crypto.subtle.digest(alg, new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

export const sha1   = (text: string): Promise<string> => digest("SHA-1",   text);
export const sha256 = (text: string): Promise<string> => digest("SHA-256", text);
export const sha512 = (text: string): Promise<string> => digest("SHA-512", text);
