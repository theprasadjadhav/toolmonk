import type { OutputFile } from "./FileConverter";

/** Single-file server conversion (all formats except PDF→JPG) */
export async function serverConvert(
  file: File,
  targetFormat: string,
  outputExtension: string,
  mime: string,
): Promise<OutputFile> {
  const form = new FormData();
  form.append("file", file);
  form.append("format", targetFormat);

  const res = await fetch("/api/convert", { method: "POST", body: form });
  if (!res.ok) {
    const msg = await res.text().catch(() => "Conversion failed");
    throw new Error(msg || "Conversion failed");
  }

  const data = new Uint8Array(await res.arrayBuffer());
  const stem = file.name.replace(/\.[^.]+$/, "");
  return { name: `${stem}.${outputExtension}`, data, mime };
}

/** PDF → JPG pages — returns one OutputFile per page */
export async function serverConvertPdfToJpg(
  file: File,
  dpi: number,
): Promise<OutputFile[]> {
  const form = new FormData();
  form.append("file", file);
  form.append("format", "jpg");
  form.append("dpi", String(dpi));

  const res = await fetch("/api/convert", { method: "POST", body: form });
  if (!res.ok) {
    const msg = await res.text().catch(() => "Conversion failed");
    throw new Error(msg || "Conversion failed");
  }

  const json = await res.json() as { pages: Array<{ name: string; data: string }> };

  return json.pages.map(({ name, data }) => ({
    name,
    data: Uint8Array.from(atob(data), (c) => c.charCodeAt(0)),
    mime: "image/jpeg",
  }));
}
