"use client";

import { isHuaweiDevice, isIosDevice, prefersManualHomeScreenInstall } from "@/components/pwa/device";

export function InstallInstructions({ canonicalHost }: { canonicalHost?: string | null }) {
  if (isIosDevice()) {
    return (
      <p>
        On iPhone, tap <strong>Share</strong> → <strong>Add to Home Screen</strong>, then open InstallBase from
        that icon.
      </p>
    );
  }

  if (isHuaweiDevice()) {
    return (
      <div className="space-y-2">
        <p>
          On Huawei, use Chrome&apos;s menu (⋮) → <strong>Add to Home screen</strong>. If the &quot;Install
          app&quot; popup loops back without adding a shortcut, skip it and use the menu instead.
        </p>
        {canonicalHost && (
          <p>
            Make sure you are on the correct link (<strong>{canonicalHost}</strong>, not an old shortened URL).
            After adding the shortcut, open InstallBase from your home screen.
          </p>
        )}
        <p>
          Phone alerts require Google Play Services. Many Huawei phones cannot receive web push in Chrome — in-app
          notifications still work when you open the app.
        </p>
      </div>
    );
  }

  if (prefersManualHomeScreenInstall()) {
    return (
      <p>
        Use your browser menu → <strong>Add to Home screen</strong> or <strong>Install app</strong> for a
        full-screen experience.
      </p>
    );
  }

  return (
    <p>
      On Android, use the browser menu → <strong>Install app</strong> or <strong>Add to Home screen</strong>.
    </p>
  );
}
