const MAX_EDGE = 1920;
const JPEG_QUALITY = 0.86;

export { MAX_POST_MEDIA, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES } from "@/lib/upload-limits";

function isHeic(file: File) {
  return /heic|heif/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
}

function isImageFile(file: File) {
  return file.type.startsWith("image/") || isHeic(file);
}

async function canvasToJpeg(source: CanvasImageSource, width: number, height: number): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process this photo");
  ctx.drawImage(source, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
  if (!blob) throw new Error("Could not process this photo");
  return blob;
}

function loadHtmlImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read this photo"));
    img.src = url;
  });
}

/** Convert HEIC / huge iPhone photos into a JPEG that the server will accept. */
export async function prepareMediaFile(file: File): Promise<File> {
  if (file.type.startsWith("video/")) return file;
  if (!isImageFile(file)) return file;

  const tryBitmap = async () => {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const blob = await canvasToJpeg(bitmap, width, height);
    bitmap.close();
    return blob;
  };

  const tryImageElement = async () => {
    const url = URL.createObjectURL(file);
    try {
      const img = await loadHtmlImage(url);
      const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
      const width = Math.max(1, Math.round(img.naturalWidth * scale));
      const height = Math.max(1, Math.round(img.naturalHeight * scale));
      return await canvasToJpeg(img, width, height);
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  try {
    let blob: Blob;
    try {
      blob = await tryBitmap();
    } catch {
      blob = await tryImageElement();
    }
    const name = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
  } catch {
    if (isHeic(file)) {
      throw new Error("This iPhone photo couldn’t be converted. In Camera, set Formats to Most Compatible, then try again.");
    }
    return file;
  }
}
