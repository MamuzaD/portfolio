import type { APIRoute } from "astro"

import { getFilmDetails, scrapeFilmDetails } from "@/lib/scrape"

export const GET: APIRoute = async ({ request }) => {
  const searchParams = new URL(request.url).searchParams
  const refresh = searchParams.get("refresh")

  if (refresh === "true") {
    try {
      const filmDetails = await scrapeFilmDetails()
      if (filmDetails) {
        return new Response(JSON.stringify(filmDetails), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      }
    } catch (error) {
      console.error("Error in refresh scrape API route:", error)
      return new Response("Internal Server Error", { status: 500 })
    }
  }

  try {
    const filmDetails = await getFilmDetails()

    if (filmDetails) {
      return new Response(JSON.stringify(filmDetails), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    } else {
      return new Response("Could not scrape film details", { status: 500 })
    }
  } catch (error) {
    console.error("Error in API route:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
