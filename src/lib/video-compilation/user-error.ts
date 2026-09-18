/** Never show spawn paths / ENOENT text to installers. */
export function userFacingCompilationError(error: unknown): string {
  if (!(error instanceof Error)) {
    return "We couldn't build your install video — your photos are still saved";
  }

  const message = error.message;
  if (/ENOENT|spawn|EACCES|ffmpeg|ffprobe|not available on this server/i.test(message)) {
    return "We couldn't prepare video on the server — tap Regenerate or post as photos";
  }

  return message;
}
