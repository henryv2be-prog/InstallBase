"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

export type KfToastType = "success" | "error" | "info";

type ToastItem = {
  id: string;
  type: KfToastType;
  message: string;
};

type ShowOptions = {
  durationMs?: number;
};

type KfToastContextValue = {
  success: (message: string, options?: ShowOptions) => void;
  error: (message: string, options?: ShowOptions) => void;
  info: (message: string, options?: ShowOptions) => void;
};

const KfToastContext = createContext<KfToastContextValue | null>(null);

const DEFAULT_DURATION_MS = 4500;

export function KfToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (type: KfToastType, message: string, options?: ShowOptions) => {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;
      setToasts((current) => [...current, { id, type, message }]);
      const durationMs = options?.durationMs ?? DEFAULT_DURATION_MS;
      const timer = setTimeout(() => dismiss(id), durationMs);
      timersRef.current.set(id, timer);
    },
    [dismiss]
  );

  const value = useMemo<KfToastContextValue>(
    () => ({
      success: (message, options) => show("success", message, options),
      error: (message, options) => show("error", message, options),
      info: (message, options) => show("info", message, options),
    }),
    [show]
  );

  return (
    <KfToastContext.Provider value={value}>
      {children}
      <div className="kf-toast-host" aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`kf-toast kf-toast--${toast.type}`}
          >
            <span className="kf-toast-icon" aria-hidden>
              {toast.type === "success" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : toast.type === "error" ? (
                <AlertCircle className="h-5 w-5" />
              ) : (
                <Info className="h-5 w-5" />
              )}
            </span>
            <p className="kf-toast-message">{toast.message}</p>
            <button
              type="button"
              className="kf-toast-dismiss"
              aria-label="Dismiss notification"
              onClick={() => dismiss(toast.id)}
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </KfToastContext.Provider>
  );
}

export function useKfToast(): KfToastContextValue {
  const ctx = useContext(KfToastContext);
  if (!ctx) {
    throw new Error("useKfToast must be used within KfToastProvider");
  }
  return ctx;
}
