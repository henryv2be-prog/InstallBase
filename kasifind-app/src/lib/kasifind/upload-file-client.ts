/** Browser upload to `/api/upload` with upload progress (fetch does not expose it). */
export function uploadListingImageFile(
  file: File,
  onProgress: (percent: number) => void
): Promise<{ url: string } | { error: string }> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    const body = new FormData();
    body.append("file", file);

    xhr.open("POST", "/api/upload");
    xhr.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable) return;
      const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
      onProgress(percent);
    });

    xhr.addEventListener("load", () => {
      let data: { url?: string; error?: string };
      try {
        data = JSON.parse(xhr.responseText) as { url?: string; error?: string };
      } catch {
        resolve({ error: "Upload failed." });
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300 && data.url) {
        onProgress(100);
        resolve({ url: data.url });
        return;
      }
      resolve({ error: data.error ?? "Upload failed." });
    });

    xhr.addEventListener("error", () => resolve({ error: "Upload failed." }));
    xhr.addEventListener("abort", () => resolve({ error: "Upload cancelled." }));

    xhr.send(body);
  });
}
