import { NextRequest, NextResponse } from "next/server";
import { saveUploadedFile } from "@/lib/save-upload";
import { getKasiFindSessionUser } from "@/lib/kasifind/session";

export async function POST(request: NextRequest) {
  const user = await getKasiFindSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to upload photos." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Please upload a photo (JPG, PNG, WebP)." }, { status: 400 });
  }

  const saved = await saveUploadedFile(file);
  if ("error" in saved) {
    return NextResponse.json({ error: saved.error }, { status: 400 });
  }
  if (saved.type !== "image") {
    return NextResponse.json({ error: "Photos only for KasiFind listings." }, { status: 400 });
  }

  return NextResponse.json({ url: saved.url });
}
