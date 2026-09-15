type UploadResult = { url: string; type: "video" | "image" } | { error: string };

function networkErrorMessage(file: File) {
  const kind = file.type.startsWith("video/") ? "Video" : "Photo";
  return `${kind} upload failed — check your connection, try Wi‑Fi, or post your text first and retry the file.`;
}

export function uploadMediaFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/uploads");
    xhr.responseType = "json";
    xhr.timeout = 0;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      const data = xhr.response as UploadResult | null;
      if (xhr.status >= 200 && xhr.status < 300 && data && "url" in data) {
        resolve(data);
        return;
      }
      resolve({ error: data && "error" in data ? data.error : networkErrorMessage(file) });
    };

    xhr.onerror = () => resolve({ error: networkErrorMessage(file) });
    xhr.onabort = () => resolve({ error: "Upload cancelled" });

    const formData = new FormData();
    formData.append("file", file);
    xhr.send(formData);
  });
}
