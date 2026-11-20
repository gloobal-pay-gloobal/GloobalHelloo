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
// Shared INTO Helloo from the phone's share sheet (manifest share_target).
// The words and the first picture are kept in a cache for the app to read
// (screens/ShareIn.jsx), then the app opens on "Send to…". Registered
// before the navigation route so the POST is ours, not the app shell's.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "POST" || url.origin !== self.location.origin || url.pathname !== "/share-in") return;
  event.respondWith((async () => {
    try {
      const form = await event.request.formData();
      const file = form.getAll("file").find((f) => f && typeof f === "object" && f.size > 0);
      await caches.delete("helloo-share-in");
      const cache = await caches.open("helloo-share-in");
      const meta = { title: String(form.get("title") || ""), text: String(form.get("text") || ""), url: String(form.get("url") || ""), fileName: file ? file.name : "", fileType: file ? file.type : "" };
      await cache.put("/share-in/meta", new Response(JSON.stringify(meta), { headers: { "content-type": "application/json" } }));
      if (file) await cache.put("/share-in/file", new Response(file, { headers: { "content-type": file.type || "image/png" } }));
    } catch (e) { /* open the app anyway */ }
    return Response.redirect("/?share=in", 303);
  })());
});
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
