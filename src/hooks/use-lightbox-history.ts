"use client";

import { useCallback, useEffect, useRef } from "react";

const HISTORY_KEY = "installbaseMedia";

/**
 * Syncs an open overlay with the browser history stack so the device back
 * button closes the viewer instead of leaving the page.
 */
export function useLightboxHistory(isOpen: boolean, onClose: () => void) {
  const ownsHistoryEntry = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    window.history.pushState({ [HISTORY_KEY]: true }, "");
    ownsHistoryEntry.current = true;

    const onPopState = () => {
      ownsHistoryEntry.current = false;
      onClose();
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [isOpen, onClose]);

  const close = useCallback(() => {
    onClose();
    if (ownsHistoryEntry.current) {
      ownsHistoryEntry.current = false;
      window.history.back();
    }
  }, [onClose]);

  return close;
}
