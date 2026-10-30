import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Helloo installs like Gloobal does: a manifest, its own icons, and a
// service worker that keeps the app shell offline and swaps in a new
// build the next time the app is opened (no "update available" prompt).
// The worker is our own file (src/sw.js, "injectManifest") because it has
// to show message notifications; the plugin only injects the precache list.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.js",
      registerType: "autoUpdate",
      includeAssets: ["icons/helloo.svg", "icons/helloo-180.png", "icons/helloo-32.png"],
      manifest: {
        id: "/",
        name: "Helloo by GLOOBAL",
        short_name: "Helloo",
        description: "Free calls and messages with your GLOOBAL ID. Strangers pay your price, or ask.",
        lang: "en",
        theme_color: "#1B1838",
        background_color: "#F6F5FC",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        categories: ["social", "communication"],
        icons: [
          { src: "/icons/helloo-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icons/helloo-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/icons/helloo-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
      devOptions: { enabled: false },
    }),
  ],
});
