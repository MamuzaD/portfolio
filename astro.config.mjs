// @ts-check
import react from "@astrojs/react"
import sitemap from "@astrojs/sitemap"
// import tailwindcss from "@tailwindcss/vite"; // tailwind v4
import tailwind from "@astrojs/tailwind"
import vercel from "@astrojs/vercel"
import compressor from "astro-compressor"
import icon from "astro-icon"
import { defineConfig } from "astro/config"

import { sitemapCopier } from "./sitemap-copier"

// https://astro.build/config
export default defineConfig({
  site: "https://danielmamuza.com",
  base: "/",
  prefetch: {
    defaultStrategy: "hover",
  },

  integrations: [
    react(),
    icon(),
    sitemap(),
    tailwind({
      applyBaseStyles: false,
    }),
    compressor(),
    sitemapCopier(),
  ],
  output: "server",
  adapter: vercel({
    maxDuration: 25,
    webAnalytics: { enabled: true },
    imageService: true,
  }),
  image: {
    remotePatterns: [{ protocol: "https" }],
    domains: ["api.microlink.io"],
  },
  // vite: {
  //   plugins: [tailwindcss()],
  // },
})
