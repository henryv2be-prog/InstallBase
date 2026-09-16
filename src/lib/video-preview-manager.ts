/** Only one muted feed preview should play at a time. */

type PreviewHandle = {
  pause: () => void;
};

const previews = new Map<string, PreviewHandle>();
let activeId: string | null = null;

export function registerVideoPreview(id: string, pause: () => void) {
  previews.set(id, { pause });
  return () => {
    previews.delete(id);
    if (activeId === id) activeId = null;
  };
}

export function claimVideoPreview(id: string) {
  if (activeId && activeId !== id) {
    previews.get(activeId)?.pause();
  }
  activeId = id;
}

export function releaseVideoPreview(id: string) {
  if (activeId === id) activeId = null;
}
