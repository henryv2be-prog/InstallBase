export function isVideoMedia(type?: string, url?: string) {
  return type === "video" || Boolean(url?.match(/\.(mp4|webm|mov)(\?|$)/i));
}

/** Safari often needs a media fragment to paint the first frame without playing. */
export function videoPreviewSrc(url: string, seconds = 0.1) {
  if (url.includes("#t=")) return url;
  const base = url.split("#")[0];
  return `${base}#t=${seconds}`;
}

export function formatVideoDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  const total = Math.round(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
