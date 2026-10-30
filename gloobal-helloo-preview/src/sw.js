// Helloo's service worker: the app shell offline, new builds swapped in on
// the next open, and message notifications.
//
// Pushes come from the GLOOBAL server only for devices that subscribed from
// Helloo (PushSubscription.app = "helloo"), and only when the person had no
// live connection open — so a notification here always means a message the
// app has not shown yet.
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { clientsClaim } from "workbox-core";

self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);
registerRoute(new NavigationRoute(createHandlerBoundToURL("/index.html")));

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = { body: event.data ? event.data.text() : "" }; }
  const title = data.title || "Helloo";
  const options = {
    body: data.body || "New message",
    icon: "/icons/helloo-192.png",
    badge: "/icons/helloo-192.png",
    tag: data.tag || undefined,
    renotify: Boolean(data.tag),
    timestamp: data.timestamp || Date.now(),
    data: { url: data.url || "/" }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || "/", self.location.origin).href;
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of all) {
      if (new URL(client.url).origin === self.location.origin) {
        await client.focus();
        try { await client.navigate(target); } catch (e) { /* older browsers */ }
        return;
      }
    }
    await self.clients.openWindow(target);
  })());
});
