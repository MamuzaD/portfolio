import type { APIRoute } from "astro"

import { getFilmDetails } from "../../lib/scrape"

export const GET: APIRoute = async () => {
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
