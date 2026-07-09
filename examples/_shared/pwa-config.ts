import { VitePWA } from "vite-plugin-pwa";
import type { PluginOption } from "vite";

/**
 * Shared VitePWA configuration for the 40kdc example apps. vite-plugin-pwa
 * derives the manifest scope, start_url, icon paths, and service-worker
 * registration scope from Vite's `base`, so the GitHub Pages subpath
 * (TOOLLET_BASE) is handled automatically — no manual path wrangling needed.
 *
 * Each app supplies only its identity (name / description); the dark
 * shadowboxing shell colours, standalone display, the 8 MiB precache ceiling
 * (the apps embed the whole 40kdc dataset, ~5–6 MB), and the Google-Fonts
 * runtime cache are common defaults. Icons are the shared Alpaca Software set
 * (`pwa-192x192.png`, `pwa-512x512.png`, `pwa-maskable-512x512.png`) generated
 * into each app's `public/` by its `gen:icons` script.
 */
export interface PwaAppConfig {
  /** Full app name (manifest `name`). */
  name: string;
  /** Home-screen label (manifest `short_name`); defaults to `name`. */
  shortName?: string;
  /** Manifest description. */
  description: string;
}

export function pwaPlugin(app: PwaAppConfig): PluginOption {
  return VitePWA({
    registerType: "autoUpdate",
    // Static icons referenced from index.html (not in the build graph) so the
    // precache manifest includes them.
    includeAssets: ["favicon-32x32.png", "apple-touch-icon.png"],
    manifest: {
      name: app.name,
      short_name: app.shortName ?? app.name,
      description: app.description,
      // Match the dark shadowboxing shell so the splash screen is seamless.
      theme_color: "#0f0f11",
      background_color: "#0f0f11",
      display: "standalone",
      // Relative src so Vite's `base` prefixes them under the deploy subpath.
      icons: [
        { src: "pwa-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        { src: "pwa-maskable-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    },
    workbox: {
      // The apps embed the whole 40kdc dataset, so the main JS chunk is several
      // MB and grows with every points/MFM data drop (the 1.0.24 wargear-cost +
      // defiler refresh pushed it past 8 MiB). That data *is* the app and must be
      // cached for offline use, so lift Workbox's 2 MiB precache cap. Keep an
      // explicit ceiling (not Infinity) so a genuinely runaway bundle still fails
      // the build loudly — bump it a data drop at a time as the embedded set grows.
      maximumFileSizeToCacheInBytes: 16 * 1024 * 1024,
      // App shell (JS/CSS/HTML) is precached by default. Runtime-cache the
      // Google Fonts CDN so the webfonts survive offline.
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: "CacheFirst",
          options: {
            cacheName: "google-fonts-stylesheets",
            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: "CacheFirst",
          options: {
            cacheName: "google-fonts-webfonts",
            expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
      ],
    },
  });
}
