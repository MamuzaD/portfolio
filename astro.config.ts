import react from "@astrojs/react"
import sitemap from "@astrojs/sitemap"
import vercel from "@astrojs/vercel"
import tailwindcss from "@tailwindcss/vite"
import compressor from "astro-compressor"
import icon from "astro-icon"
import { defineConfig } from "astro/config"

import { execFileSync } from "node:child_process"

// Capture the deployed commit's date so rebuilding the same commit keeps it unchanged.
const commitDate = execFileSync("git", ["show", "-s", "--format=%cs", process.env.VERCEL_GIT_COMMIT_SHA || "HEAD"], {
  cwd: new URL(".", import.meta.url),
  encoding: "utf8",
}).trim()

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
    define: {
      "import.meta.env.PUBLIC_COMMIT_DATE": JSON.stringify(commitDate),
    },
    plugins: [tailwindcss()],
  },
})
