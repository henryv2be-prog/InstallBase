const CACHE = "installbase-v6";
const PRECACHE = [
  "/login",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-192-maskable.png",
  "/icons/icon-512-maskable.png",
  "/icons/badge.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all(PRECACHE.map((url) => cache.add(url).catch(() => undefined)))
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    )
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigations stay on the network so a new service worker cannot claim and
  // re-fetch the document mid-launch (that is the PWA "reload flash").
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/login").then((cached) => cached || Response.error()))
    );
    return;
  }

  if (url.pathname.startsWith("/uploads/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
            return response;
          })
      )
    );
  }
});

self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      let data = {
        title: "InstallBase",
        body: "You have a new notification",
        url: "/notifications",
        icon: "/icons/icon-192.png",
        badge: "/icons/badge.png",
      };
      try {
        if (event.data) {
          data = { ...data, ...event.data.json() };
        }
      } catch {
        try {
          const text = event.data && event.data.text();
          if (text) data.body = text;
        } catch {
          /* keep defaults */
        }
      }

      await self.registration.showNotification(data.title || "InstallBase", {
        body: data.body,
        icon: data.icon || "/icons/icon-192.png",
        badge: data.badge || "/icons/badge.png",
        data: { url: data.url || "/notifications" },
      });
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const raw = event.notification.data?.url || "/notifications";
  const url = new URL(raw, self.location.origin).href;
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of all) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          await client.focus();
          if ("navigate" in client) {
            try {
              await client.navigate(url);
            } catch {
              /* iOS may reject navigate; focusing is enough */
            }
          }
          return;
        }
      }
      await self.clients.openWindow(url);
    })()
  );
});
