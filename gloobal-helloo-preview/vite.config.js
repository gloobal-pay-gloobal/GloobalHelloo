import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
// The live photo's face models (GLOOBAL features/identity/liveFaceCheck.jsx),
// served from Helloo's own origin at /face-models/ exactly as GLOOBAL serves
// them: copied out of the pinned @vladmandic/human package at build, served
// from node_modules by the dev server. Needed since 25 Nov, when making a
// GLOOBAL ID inside Helloo (GloobalJoinFlow) takes the photo live. Only the
// five models the check uses, about 10 MB, never precached: they download
// the first time somebody opens the camera.
import { readFileSync as faceRead, existsSync as faceExists } from "node:fs";
import { fileURLToPath as faceUrlPath } from "node:url";
import { join as faceJoin, dirname as faceDir } from "node:path";
const FACE_MODELS = ["blazeface", "facemesh", "faceres", "antispoof", "liveness"];
const faceModelDir = () => faceJoin(faceDir(faceUrlPath(import.meta.url)), "node_modules", "@vladmandic", "human", "models");
const faceModels = () => ({
  name: "helloo-face-models",
  configureServer(server) {
    server.middlewares.use("/face-models", (req, res, next) => {
      const name = String(req.url || "").replace(/^\//, "").split("?")[0];
      const ok = FACE_MODELS.some((m) => name === `${m}.json` || name === `${m}.bin`);
      const file = ok ? faceJoin(faceModelDir(), name) : "";
      if (!file || !faceExists(file)) return next();
      res.setHeader("Content-Type", name.endsWith(".json") ? "application/json" : "application/octet-stream");
      res.end(faceRead(file));
    });
  },
  generateBundle() {
    for (const m of FACE_MODELS) {
      for (const ext of ["json", "bin"]) {
        this.emitFile({ type: "asset", fileName: `face-models/${m}.${ext}`, source: faceRead(faceJoin(faceModelDir(), `${m}.${ext}`)) });
      }
    }
  },
});

// Helloo installs like Gloobal does: a manifest, its own icons, and a
// service worker that keeps the app shell offline and swaps in a new
// build the next time the app is opened (no "update available" prompt).
// The worker is our own file (src/sw.js, "injectManifest") because it has
// to show message notifications; the plugin only injects the precache list.
export default defineConfig({
  plugins: [
    react(),
    faceModels(),
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
        // Helloo in the phone's share sheet (Android, once installed), next
        // to WhatsApp and Telegram: src/sw.js takes the post at /share-in.
        // Any file: a GLOOBAL QR, or a WhatsApp "Export chat" with its media.
        share_target: {
          action: "/share-in",
          method: "POST",
          enctype: "multipart/form-data",
          params: { title: "title", text: "text", url: "url", files: [{ name: "file", accept: ["image/*", "video/*", "audio/*", "text/plain", "application/*"] }] },
        },
        icons: [
          { src: "/icons/helloo-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icons/helloo-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/icons/helloo-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
        // The face library (~2 MB) and its models load only when the camera
        // opens for a live photo, like GLOOBAL; never part of the install.
        globIgnores: ["**/human*", "**/face-models/**"],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
      devOptions: { enabled: false },
    }),
  ],
});
