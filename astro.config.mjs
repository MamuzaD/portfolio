// @ts-check
import react from "@astrojs/react"
import sitemap from "@astrojs/sitemap"
import vercel from "@astrojs/vercel"
import tailwindcss from "@tailwindcss/vite"
import compressor from "astro-compressor"
import icon from "astro-icon"
import { defineConfig } from "astro/config"

// https://astro.build/config
export default defineConfig({
  site: "https://danielmamuza.com",
  base: "/",

  prefetch: {
    defaultStrategy: "hover",
  },

  integrations: [react(), icon(), sitemap(), compressor()],
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
  vite: {
    plugins: [tailwindcss()],
  },
})
