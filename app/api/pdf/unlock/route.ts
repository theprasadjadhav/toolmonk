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

// ── User-friendly error mapping ───────────────────────────────────────────────

function friendlyQpdfError(stderr: string, passwordSupplied: boolean): { message: string; status: number } {
  const s = stderr.toLowerCase();
  if (s.includes("invalid password") || s.includes("bad password") || s.includes("password incorrect")) {
    return {
      message: passwordSupplied
        ? "Incorrect password. Please check it and try again."
        : "This PDF is password-protected. Enter the password and try again.",
      status: 400,
    };
  }
  if (s.includes("password required") || s.includes("requires a password")) {
    return {
      message: "This PDF requires a password to open. Enter it and try again.",
      status: 400,
    };
  }
  if (s.includes("not encrypted") || s.includes("not a pdf")) {
    return { message: "This PDF does not appear to be encrypted.", status: 400 };
  }
  if (s.includes("damaged") || s.includes("corrupt") || s.includes("not a pdf")) {
    return { message: "The PDF appears to be damaged or invalid.", status: 422 };
  }
  return { message: "Could not unlock the PDF. The file may be unsupported or corrupt.", status: 422 };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: Request): Promise<Response> {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return new Response("Invalid form data", { status: 400 });
  }

  const fileEntry = formData.get("file");
  const password  = formData.get("password");

  if (!(fileEntry instanceof File)) {
    return new Response("Missing file field", { status: 400 });
  }
  if (fileEntry.size > MAX_FILE_SIZE) {
    return new Response("File exceeds 50 MB limit", { status: 413 });
  }

  // Magic-byte check
  const arrayBuffer = await fileEntry.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);
  if (!inputBuffer.subarray(0, 4).equals(MAGIC_PDF)) {
    return new Response("The uploaded file is not a valid PDF.", { status: 400 });
  }

  try {
    await acquire();
  } catch {
    return new Response("Server is busy. Please try again in a moment.", { status: 503 });
  }

  const tmpDir = path.join("/tmp", randomUUID());

  try {
    fs.mkdirSync(tmpDir, { recursive: true });

    const safeName   = sanitizeFilename(fileEntry.name);
    const inputPath  = path.join(tmpDir, safeName);
    const outputPath = path.join(tmpDir, "unlocked.pdf");

    fs.writeFileSync(inputPath, inputBuffer);

    const passwordSupplied = typeof password === "string" && password.trim().length > 0;

    // qpdf --decrypt [--password=<pwd>] -- input output
    // Arguments as array — no shell interpolation, passwords with special chars are safe.
    const args: string[] = ["--decrypt"];
    if (passwordSupplied) args.push(`--password=${password}`);
    args.push("--", inputPath, outputPath);

    try {
      execFileSync("qpdf", args, {
        timeout: 60_000,
        stdio: ["pipe", "pipe", "pipe"],
      });
    } catch (err: unknown) {
      const e = err as { stderr?: Buffer; stdout?: Buffer };
      const stderr = (e?.stderr?.toString() ?? "") + (e?.stdout?.toString() ?? "");
      const { message, status } = friendlyQpdfError(stderr, passwordSupplied);
      return new Response(message, { status });
    }

    if (!fs.existsSync(outputPath)) {
      return new Response("Unlock produced no output. Please try again.", { status: 500 });
    }

    const outputBuffer = fs.readFileSync(outputPath);
    const stem         = path.basename(fileEntry.name).replace(/\.[^.]+$/, "");
    const downloadName = sanitizeFilename(`${stem}-unlocked.pdf`);

    return new Response(outputBuffer, {
      status: 200,
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `attachment; filename="${downloadName}"`,
        "Cache-Control":       "no-store",
      },
    });
  } catch {
    return new Response("Something went wrong. Please try again.", { status: 500 });
  } finally {
    release();
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }
  }
}
