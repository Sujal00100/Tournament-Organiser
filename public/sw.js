// Service Worker for Web Push Notifications
// Phase 9 — basic structure ready

self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const options = {
    body: data.body || "You have a new notification",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    data: data.data || {},
    tag: data.tag || "default",
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || "Arena Tournament",
      options
    )
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/dashboard/notifications";

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
