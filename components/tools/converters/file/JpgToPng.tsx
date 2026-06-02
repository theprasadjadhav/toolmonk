"use client";

import { FileConverter, type OutputFile } from "./FileConverter";

async function convertViaCanvas(file: File, mime: string, quality?: number): Promise<OutputFile> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas not supported")); return; }
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        async (blob) => {
          if (!blob) { reject(new Error("Canvas toBlob failed")); return; }
          const buf = await blob.arrayBuffer();
          const ext = mime === "image/png" ? "png" : "webp";
          resolve({
            name: file.name.replace(/\.[^.]+$/, "") + "." + ext,
            data: new Uint8Array(buf),
            mime,
          });
        },
        mime,
        quality,
      );
    };

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`Failed to load ${file.name}`)); };
    img.src = url;
  });
}

export function JpgToPng() {
  const handleConvert = async (files: File[]): Promise<OutputFile[]> => {
    return Promise.all(files.map((f) => convertViaCanvas(f, "image/png")));
  };

  return (
    <FileConverter
      accept="image/jpeg,image/jpg,.jpg,.jpeg"
      acceptLabel="JPG / JPEG"
      multiple
      onConvert={handleConvert}
    />
  );
}
