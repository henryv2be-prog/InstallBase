import fs from "node:fs";
import path from "node:path";

export function setupUploadVolume() {
  const uploadDir = process.env.UPLOAD_DIR?.trim() || path.join(process.cwd(), "public", "uploads");

  fs.mkdirSync(uploadDir, { recursive: true });

  if (!uploadDir.startsWith("/data")) {
    console.log(`Upload directory ready at ${uploadDir}`);
    return;
  }

  const publicDir = path.join(process.cwd(), "public");
  const linkPath = path.join(publicDir, "uploads");

  fs.mkdirSync(publicDir, { recursive: true });

  if (fs.existsSync(linkPath)) {
    const stat = fs.lstatSync(linkPath);
    if (stat.isSymbolicLink()) {
      const target = fs.readlinkSync(linkPath);
      if (path.resolve(path.dirname(linkPath), target) === path.resolve(uploadDir)) {
        console.log(`Upload volume ready at ${uploadDir}`);
        return;
      }
      fs.unlinkSync(linkPath);
    } else if (stat.isDirectory() && fs.readdirSync(linkPath).length === 0) {
      fs.rmdirSync(linkPath);
    } else {
      console.warn(`Using ${uploadDir} directly; ${linkPath} already exists.`);
      return;
    }
  }

  fs.symlinkSync(uploadDir, linkPath, "dir");
  console.log(`Linked ${linkPath} → ${uploadDir}`);
}
