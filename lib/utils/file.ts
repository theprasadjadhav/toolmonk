/** Read a text file via a hidden file input. Returns the file content as a string. */
export function uploadText(accept: string): Promise<string | null> {
  return new Promise((resolve) => {
    const el = document.createElement("input");
    el.type = "file";
    el.accept = accept;
    el.onchange = () => {
      const file = el.files?.[0];
      if (!file) { resolve(null); return; }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsText(file);
    };
    el.oncancel = () => resolve(null);
    el.click();
  });
}

/** Trigger a browser download of a text string as a file. */
export function downloadText(
  content: string,
  filename: string,
  mime = "text/plain;charset=utf-8"
) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
