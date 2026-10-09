import type { APIRoute } from "astro"

import { getFilmDetails } from "@/lib/scrape"

export const GET: APIRoute = async ({ request }) => {
  if (new URL(request.url).search.length > 0) {
    return new Response("Query parameters are not supported", {
      status: 400,
      headers: { "Cache-Control": "no-store" },
    })
  }

  try {
    const filmDetails = await getFilmDetails()

    if (filmDetails) {
      return new Response(JSON.stringify(filmDetails), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
        },
      })
    } else {
      return new Response("Film details temporarily unavailable", {
        status: 503,
        headers: { "Cache-Control": "no-store", "Retry-After": "60" },
      })
    }
  } catch (error) {
    console.error("Error in API route:", error)
    return new Response("Internal Server Error", { status: 500, headers: { "Cache-Control": "no-store" } })
  }
}
