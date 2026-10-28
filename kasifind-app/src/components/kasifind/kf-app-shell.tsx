"use client";

import type { ReactNode } from "react";
import { KfToastProvider } from "@/components/kasifind/kf-toast";

export function KfAppShell({ children }: { children: ReactNode }) {
  return <KfToastProvider>{children}</KfToastProvider>;
}
