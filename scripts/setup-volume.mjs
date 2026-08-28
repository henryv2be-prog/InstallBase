import fs from "node:fs";
import path from "node:path";

const uploadDir = process.env.UPLOAD_DIR?.trim() || path.join(process.cwd(), "public", "uploads");

fs.mkdirSync(uploadDir, { recursive: true });

// When using a Railway volume outside public/, symlink so Next.js can serve /uploads/*
if (uploadDir.startsWith("/data")) {
  const publicDir = path.join(process.cwd(), "public");
  const linkPath = path.join(publicDir, "uploads");

  fs.mkdirSync(publicDir, { recursive: true });

  if (fs.existsSync(linkPath)) {
    const stat = fs.lstatSync(linkPath);
    if (stat.isSymbolicLink()) {
      const target = fs.readlinkSync(linkPath);
      if (path.resolve(target) === path.resolve(uploadDir)) {
        console.log(`Upload volume ready at ${uploadDir}`);
        process.exit(0);
      }
      fs.unlinkSync(linkPath);
    } else if (stat.isDirectory() && fs.readdirSync(linkPath).length === 0) {
      fs.rmdirSync(linkPath);
    } else {
      console.warn(`Skipping uploads symlink; ${linkPath} already exists.`);
      process.exit(0);
    }
  }

  fs.symlinkSync(uploadDir, linkPath, "dir");
  console.log(`Linked ${linkPath} → ${uploadDir}`);
} else {
  console.log(`Upload directory ready at ${uploadDir}`);
}
