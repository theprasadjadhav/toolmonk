import { execFileSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const MAGIC_PDF = Buffer.from([0x25, 0x50, 0x44, 0x46]); // %PDF

// ── Concurrency queue ─────────────────────────────────────────────────────────

let active = 0;
const MAX_CONCURRENT = 3;
const MAX_QUEUE = 10;
const pending: Array<() => void> = [];

function acquire(): Promise<void> {
  if (pending.length >= MAX_QUEUE) {
    return Promise.reject(new Error("SERVER_BUSY"));
  }
  return new Promise((resolve) => {
    if (active < MAX_CONCURRENT) {
      active++;
      resolve();
    } else {
      pending.push(() => { active++; resolve(); });
    }
  });
}

function release(): void {
  active--;
  const next = pending.shift();
  if (next) next();
}

function sanitizeFilename(name: string): string {
  return path.basename(name).replace(/[^a-zA-Z0-9._-]/g, "_");
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: Request): Promise<Response> {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return new Response("Invalid form data", { status: 400 });
  }

  const fileEntry   = formData.get("file");
  const userPwd     = formData.get("userPassword");
  const ownerPwd    = formData.get("ownerPassword");
  const allowPrint  = formData.get("allowPrint")  === "true";
  const allowCopy   = formData.get("allowCopy")   === "true";
  const allowModify = formData.get("allowModify") === "true";

  if (!(fileEntry instanceof File)) {
    return new Response("Missing file field", { status: 400 });
  }
  if (typeof userPwd !== "string" || !userPwd.trim()) {
    return new Response("User password is required", { status: 400 });
  }
  if (fileEntry.size > MAX_FILE_SIZE) {
    return new Response("File exceeds 50 MB limit", { status: 413 });
  }

  // Magic-byte check — must be a real PDF
  const arrayBuffer = await fileEntry.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);
  if (!inputBuffer.subarray(0, 4).equals(MAGIC_PDF)) {
    return new Response("File is not a valid PDF", { status: 400 });
  }

  try {
    await acquire();
  } catch {
    return new Response("Server busy, please try again shortly", { status: 503 });
  }

  const tmpDir = path.join("/tmp", randomUUID());

  try {
    fs.mkdirSync(tmpDir, { recursive: true });

    const safeName   = sanitizeFilename(fileEntry.name);
    const inputPath  = path.join(tmpDir, safeName);
    const outputPath = path.join(tmpDir, "locked.pdf");

    fs.writeFileSync(inputPath, inputBuffer);

    // Owner password falls back to user password when omitted
    const effectiveOwner =
      typeof ownerPwd === "string" && ownerPwd.trim() ? ownerPwd : userPwd;

    // qpdf --encrypt <user-pwd> <owner-pwd> 256 [permissions] -- input output
    // Arguments are passed as an array — never interpolated into a shell string,
    // so passwords with special characters are safe.
    execFileSync("qpdf", [
      "--encrypt", userPwd, effectiveOwner, "256",
      `--print=${allowPrint  ? "full" : "none"}`,
      `--modify=${allowModify ? "all"  : "none"}`,
      `--extract=${allowCopy  ? "y"    : "n"}`,
      "--",
      inputPath,
      outputPath,
    ], { timeout: 60_000 });

    if (!fs.existsSync(outputPath)) {
      return new Response("Encryption failed. Please try again.", { status: 500 });
    }

    const outputBuffer = fs.readFileSync(outputPath);
    const stem         = path.basename(fileEntry.name).replace(/\.[^.]+$/, "");
    const downloadName = sanitizeFilename(`${stem}-locked.pdf`);

    return new Response(outputBuffer, {
      status: 200,
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `attachment; filename="${downloadName}"`,
        "Cache-Control":       "no-store",
      },
    });
  } catch (err) {
    // Log the real error server-side — never expose system details to the client.
    console.error("[pdf/lock]", err);

    if (err instanceof Error && (err as NodeJS.ErrnoException).code === "ENOENT") {
      return new Response("PDF encryption is not available on this server.", { status: 503 });
    }
    if (err instanceof Error && err.message === "SERVER_BUSY") {
      return new Response("Server busy, please try again shortly.", { status: 503 });
    }
    return new Response("Encryption failed. Please ensure the file is a valid PDF.", { status: 500 });
  } finally {
    release();
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }
  }
}
