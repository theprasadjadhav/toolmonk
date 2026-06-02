import { execFileSync, spawnSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

// ── Config ─────────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE      = 50 * 1024 * 1024; // 50 MB
const SOFFICE_TIMEOUT_MS = 120_000;
const PDFTOPPM_TIMEOUT_MS = 60_000;

const SOFFICE = process.platform === "darwin"
  ? "/Applications/LibreOffice.app/Contents/MacOS/soffice"
  : "libreoffice";

// Pre-seeded LO user-profile (Java disabled, see docker/lo-profile/).
// Cloned per-request so each conversion gets an isolated profile directory
// and concurrent conversions never share a lock file.
const LO_PROFILE_TEMPLATE = "/opt/lo-profile";

// ── Conversion matrix ──────────────────────────────────────────────────────────

const ALLOWED_FORMATS = new Set([
  "pdf", "docx", "odt", "pptx", "odp", "xlsx", "ods", "jpg",
]);

const ALLOWED_INPUTS: Record<string, Set<string>> = {
  pdf:  new Set([".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx",
                 ".odt", ".odp", ".ods",
                 ".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff", ".tif"]),
  docx: new Set([".odt", ".doc", ".pdf"]),
  odt:  new Set([".doc", ".docx"]),
  pptx: new Set([".odp", ".ppt"]),
  odp:  new Set([".ppt", ".pptx"]),
  xlsx: new Set([".ods", ".xls"]),
  ods:  new Set([".xls", ".xlsx"]),
  jpg:  new Set([".pdf"]),
};

const MIME: Record<string, string> = {
  pdf:  "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  odt:  "application/vnd.oasis.opendocument.text",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  odp:  "application/vnd.oasis.opendocument.presentation",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ods:  "application/vnd.oasis.opendocument.spreadsheet",
};

// Explicit LibreOffice filter specs for --convert-to.
// Extension-only ("docx") fails on LO 7.4/Bookworm with "no export filter found".
// The "ext:FilterName" form pins the exact filter and works reliably.
const LO_FILTER: Record<string, string> = {
  pdf:  "pdf",
  docx: "docx:MS Word 2007 XML",
  odt:  "odt:writer8",
  pptx: "pptx:Impress MS PowerPoint 2007 XML",
  odp:  "odp:impress8",
  xlsx: "xlsx:Calc MS Excel 2007 XML",
  ods:  "ods:calc8",
};

// ── Magic-byte validation ──────────────────────────────────────────────────────

const SIG = {
  ZIP:  Buffer.from([0x50, 0x4b, 0x03, 0x04]),
  CFB:  Buffer.from([0xd0, 0xcf, 0x11, 0xe0]),
  PDF:  Buffer.from([0x25, 0x50, 0x44, 0x46]), // %PDF
  JPEG: Buffer.from([0xff, 0xd8, 0xff]),
  PNG:  Buffer.from([0x89, 0x50, 0x4e, 0x47]),
};

const ZIP_EXTS = new Set([".docx", ".xlsx", ".pptx", ".odt", ".ods", ".odp"]);
const CFB_EXTS = new Set([".doc", ".xls", ".ppt"]);
const IMG_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff", ".tif"]);

function hasValidMagicBytes(buf: Buffer, ext: string): boolean {
  if (ZIP_EXTS.has(ext))               return buf.subarray(0, 4).equals(SIG.ZIP);
  if (CFB_EXTS.has(ext))               return buf.subarray(0, 4).equals(SIG.CFB);
  if (ext === ".pdf")                  return buf.subarray(0, 4).equals(SIG.PDF);
  if (ext === ".jpg" || ext === ".jpeg") return buf.subarray(0, 3).equals(SIG.JPEG);
  if (ext === ".png")                  return buf.subarray(0, 4).equals(SIG.PNG);
  if (IMG_EXTS.has(ext))               return true; // webp/bmp/tiff — no universal magic
  return true;
}

// ── Concurrency limiter ────────────────────────────────────────────────────────

const MAX_CONCURRENT = 3;
const MAX_QUEUED     = 10;
let active = 0;
const queue: Array<() => void> = [];

function acquire(): Promise<void> {
  if (queue.length >= MAX_QUEUED) return Promise.reject();
  return new Promise<void>((resolve) => {
    if (active < MAX_CONCURRENT) { active++; resolve(); }
    else queue.push(() => { active++; resolve(); });
  });
}

function release(): void {
  active--;
  queue.shift()?.();
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function sanitize(name: string): string {
  return path.basename(name).replace(/[^a-zA-Z0-9._-]/g, "_");
}

// ── Conversion: LibreOffice ────────────────────────────────────────────────────

// PDF files are opened by LO's Draw component by default, which cannot export
// as Writer formats (docx, odt). --infilter forces the Writer PDF import filter
// so the PDF is treated as a Writer document, enabling DOCX/ODT export.
const WRITER_PDF_INPUTS = new Set(["docx", "odt"]);

function libreofficeConvert(inputPath: string, format: string, outDir: string): string {
  // Clone the pre-seeded profile (Java disabled) so this request has an isolated
  // LO environment. Concurrent conversions each get their own lock file.
  const profileDir = path.join(outDir, ".lo-profile");
  try {
    fs.cpSync(LO_PROFILE_TEMPLATE, profileDir, { recursive: true });
  } catch (e) {
    console.error("[convert] Failed to clone LO profile from", LO_PROFILE_TEMPLATE, e);
    throw new Error("Profile setup failed");
  }

  const isPdfInput = path.extname(inputPath).toLowerCase() === ".pdf";
  const needsWriterImport = isPdfInput && WRITER_PDF_INPUTS.has(format);

  const result = spawnSync(SOFFICE, [
    "--headless",
    "--norestore",
    "--nologo",
    ...(needsWriterImport ? ["--infilter=writer_pdf_import"] : []),
    `-env:UserInstallation=file://${profileDir}`,
    "--convert-to", LO_FILTER[format],
    "--outdir",     outDir,
    inputPath,
  ], {
    timeout:   SOFFICE_TIMEOUT_MS,
    maxBuffer: 10 * 1024 * 1024,
    env: {
      ...process.env,
      SAL_USE_VCLPLUGIN: "headless", // force headless VCL backend
      DISPLAY: "",                    // no display server
    },
  });

  // Log diagnostics — LO exit codes are unreliable so we never fail on them,
  // but the logs tell us exactly what happened if the output file is missing.
  if (result.error) {
    console.error("[convert] LO spawn error:", result.error.message,
      "signal:", result.signal);
  }
  if (result.stdout?.length) {
    console.log("[convert] LO stdout:", result.stdout.toString().slice(0, 1000));
  }
  if (result.stderr?.length) {
    console.error("[convert] LO stderr:", result.stderr.toString().slice(0, 1000));
  }

  // Output filename is deterministic: <input-stem>.<format>
  const outputPath = path.join(
    outDir,
    `${path.basename(inputPath, path.extname(inputPath))}.${format}`,
  );

  const stat = fs.existsSync(outputPath) ? fs.statSync(outputPath) : null;
  if (!stat || stat.size === 0) {
    console.error("[convert] No output produced.",
      `status=${result.status} signal=${result.signal}`,
      `expected=${outputPath}`);
    throw new Error("LibreOffice produced no output");
  }

  return outputPath;
}

// ── Conversion: PDF → JPG ──────────────────────────────────────────────────────

function pdfToJpg(
  inputPath: string,
  outputStem: string,
  dpi: number,
  outDir: string,
): Array<{ name: string; data: string }> {
  execFileSync(
    "pdftoppm",
    ["-jpeg", "-r", String(dpi), inputPath, path.join(outDir, "page")],
    { timeout: PDFTOPPM_TIMEOUT_MS },
  );

  const pages = fs
    .readdirSync(outDir)
    .filter((f) => /^page-\d+\.jpg$/.test(f))
    .sort();

  if (!pages.length) throw new Error("pdftoppm produced no output");

  return pages.map((f, i) => ({
    name: `${outputStem}_page${String(i + 1).padStart(2, "0")}.jpg`,
    data: fs.readFileSync(path.join(outDir, f)).toString("base64"),
  }));
}

// ── Route handler ──────────────────────────────────────────────────────────────

export async function POST(req: Request): Promise<Response> {
  // 1. Parse
  let form: FormData;
  try { form = await req.formData(); }
  catch { return err(400, "Invalid request body"); }

  // 2. Validate
  const fileEntry = form.get("file");
  const format    = form.get("format");
  const dpi       = Math.min(600, Math.max(72, Number(form.get("dpi")) || 150));

  if (!(fileEntry instanceof File))
    return err(400, "Missing file");
  if (typeof format !== "string" || !ALLOWED_FORMATS.has(format))
    return err(400, "Invalid target format");
  if (fileEntry.size > MAX_FILE_SIZE)
    return err(413, "File exceeds 50 MB limit");

  const ext = path.extname(fileEntry.name).toLowerCase();
  if (!ALLOWED_INPUTS[format]?.has(ext))
    return err(400, "Unsupported conversion");

  const buf = Buffer.from(await fileEntry.arrayBuffer());
  if (!hasValidMagicBytes(buf, ext))
    return err(400, "File content does not match its extension");

  // 3. Concurrency gate
  try { await acquire(); }
  catch { return err(503, "Server busy — please try again shortly"); }

  // 4. Isolated working directory
  const tmpDir = path.join("/tmp", randomUUID());
  try {
    fs.mkdirSync(tmpDir);

    const inName   = sanitize(fileEntry.name);
    const inPath   = path.join(tmpDir, inName);
    const inStem   = path.basename(inName, path.extname(inName));
    const origStem = sanitize(path.basename(fileEntry.name, path.extname(fileEntry.name)));
    fs.writeFileSync(inPath, buf);

    // 5a. PDF → JPG (pdftoppm)
    if (format === "jpg") {
      const pages = pdfToJpg(inPath, origStem, dpi, tmpDir);
      return new Response(JSON.stringify({ pages }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    }

    // 5b. All other formats (LibreOffice)
    const outPath = libreofficeConvert(inPath, format, tmpDir);
    const outBuf  = fs.readFileSync(outPath);

    return new Response(outBuf, {
      status: 200,
      headers: {
        "Content-Type":        MIME[format],
        "Content-Disposition": `attachment; filename="${inStem}.${format}"`,
        "Cache-Control":       "no-store",
      },
    });
  } catch {
    return err(500, "Conversion failed");
  } finally {
    release();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

function err(status: number, message: string): Response {
  return new Response(message, { status });
}
