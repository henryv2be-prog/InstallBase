export type MediaKind = "image" | "video";

export function shouldAutoCompileInstallVideo(
  items: { kind: MediaKind; status: "uploading" | "ready" | "error" }[]
) {
  const ready = items.filter((item) => item.status === "ready");
  if (ready.length < 1) return false;
  const images = ready.filter((item) => item.kind === "image").length;
  const videos = ready.filter((item) => item.kind === "video").length;
  if (images >= 1) return true;
  if (videos >= 2) return true;
  return false;
}
