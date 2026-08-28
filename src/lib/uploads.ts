import path from "path";

/** Local dev: public/uploads. Railway: mount a volume at /data and set UPLOAD_DIR=/data/uploads */
export function getUploadDir(): string {
  const configured = process.env.UPLOAD_DIR?.trim();
  if (configured) return configured;
  return path.join(process.cwd(), "public", "uploads");
}

export function uploadPublicPath(filename: string): string {
  return `/uploads/${filename}`;
}
