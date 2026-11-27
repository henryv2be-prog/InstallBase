/* Admin-only push service worker — register only under /admin */
self.addEventListener("push", (event) => {
  let data = { title: "KasiFind", body: "New admin notification", url: "/admin/notifications" };
  try {
    if (event.data) {
      const parsed = event.data.json();
      if (parsed && typeof parsed === "object") data = { ...data, ...parsed };
    }
  } catch {
  }

  const title = data.title || "KasiFind";
  const options = {
    body: data.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: data.tag || "kasifind-admin",
    data: { url: data.url || "/admin/notifications" },
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/admin/notifications";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("/admin") && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});