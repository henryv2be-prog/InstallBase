/** Limit concurrent muted feed previews to keep mobile browsers stable. */

export const MAX_ACTIVE_VIDEO_PREVIEWS = 2;

type PreviewHandle = {
  pause: () => void;
};

const previews = new Map<string, PreviewHandle>();
const activeIds: string[] = [];

function removeActiveId(id: string) {
  const index = activeIds.indexOf(id);
  if (index >= 0) activeIds.splice(index, 1);
}

export function registerVideoPreview(id: string, pause: () => void) {
  previews.set(id, { pause });
  return () => {
    previews.delete(id);
    removeActiveId(id);
  };
}

export function claimVideoPreview(id: string) {
  if (activeIds.includes(id)) return;

  while (activeIds.length >= MAX_ACTIVE_VIDEO_PREVIEWS) {
    const oldest = activeIds.shift();
    if (oldest) previews.get(oldest)?.pause();
  }

  activeIds.push(id);
}

export function releaseVideoPreview(id: string) {
  removeActiveId(id);
}
