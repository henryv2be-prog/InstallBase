export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
/** Typical TikTok clips are well under this; 200MB covers phone-recorded vertical video. */
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
export const MAX_POST_MEDIA = 10;

export function isVideoUpload(file: { type: string; name?: string }) {
  return file.type.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(file.name ?? "");
}

export function maxBytesForUpload(file: { type: string; name?: string }) {
  return isVideoUpload(file) ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
}

export function formatUploadLimit(bytes: number) {
  return `${Math.round(bytes / (1024 * 1024))}MB`;
}
