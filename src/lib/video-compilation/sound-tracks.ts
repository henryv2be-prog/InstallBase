/** Client-safe helpers — track list comes from GET /api/install-video/sounds */

export const VIDEO_SOUND_PUBLIC_BASE = "/audio/video-compilation";

export type VideoSoundTrackClient = {
  id: string;
  label: string;
  tag: string;
  description: string;
  publicPath: string;
};

export function previewUrlForTrack(track: VideoSoundTrackClient | null): string | null {
  return track?.publicPath ?? null;
}
