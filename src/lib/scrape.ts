import { waitUntil } from "@vercel/functions"

import { cacheData, getCachedData } from "./redis"

type FilmDetails = {
  title: string | null
  imageUrl: string | null
  stars: string | null
}

const LETTERBOXD_RSS_URL = "https://letterboxd.com/da_ni/rss/"
const LETTERBOXD_PROFILE_URL = "https://letterboxd.com/da_ni/"
const SCRAPE_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
const SCRAPE_ACCEPT_LANGUAGE = "en-US,en;q=0.9"

function extractTag(xml: string, tagName: string): string | null {
  const match = xml.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, "i"))
  return match?.[1]?.trim() ?? null
}

function ratingToStars(memberRating: string | null): string | null {
  const value = Number(memberRating)
  if (!Number.isFinite(value) || value <= 0) return null

  const full = Math.floor(value)
  const half = value % 1 >= 0.5
  return `${"★".repeat(full)}${half ? "½" : ""}`
}

function parseFilmDetailsFromRss(xml: string): FilmDetails | null {
  const firstItem = xml.match(/<item>\s*([\s\S]*?)\s*<\/item>/i)?.[1] ?? null
  if (!firstItem) return null

  const filmTitleTag = extractTag(firstItem, "letterboxd:filmTitle")
  const itemTitleTag = extractTag(firstItem, "title")
  const titleFromItem = itemTitleTag?.replace(/\s*,\s*\d{4}\s*-\s*.*$/, "").trim() ?? null
  const title = filmTitleTag ?? titleFromItem ?? ""

  const memberRating = extractTag(firstItem, "letterboxd:memberRating")
  const stars = ratingToStars(memberRating)

  const description = extractTag(firstItem, "description")
  const imageUrl =
    description
      ?.match(/<img[^>]+src="([^"]+)"/i)?.[1]
      ?.trim()
      ?.replace(/-0-600-0-900-crop/, "-0-70-0-105-crop") ?? ""

  return {
    title: title || null,
    imageUrl: imageUrl || null,
    stars,
  }
}

export async function scrapeFilmDetails(): Promise<FilmDetails | null> {
  const headers = {
    "user-agent": SCRAPE_USER_AGENT,
    "accept-language": SCRAPE_ACCEPT_LANGUAGE,
    accept: "application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.7",
    referer: LETTERBOXD_PROFILE_URL,
  }

  for (let attempt = 1; attempt <= 2; attempt++) {
    const response = await fetch(LETTERBOXD_RSS_URL, {
      headers,
      signal: AbortSignal.timeout(30000),
    })

    if (response.ok) {
      const xml = await response.text()
      const filmDetails = parseFilmDetailsFromRss(xml)
      console.log(`Scraping completed via RSS (attempt ${attempt}/2).`)
      console.log(filmDetails)
      return filmDetails
    }

    console.warn(`Letterboxd RSS request failed (${response.status}) on attempt ${attempt}/2`)
    if (attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 1200))
    }
  }

  return null
}

function dataHasChanged(cached: FilmDetails, fresh: FilmDetails): boolean {
  return cached.title !== fresh.title || cached.imageUrl !== fresh.imageUrl || cached.stars !== fresh.stars
}

export async function getFilmDetails(): Promise<FilmDetails | null> {
  const cacheKey = "portfolio_film"
  const cachedData = await getCachedData<FilmDetails>(cacheKey)

  const scrapePromise = scrapeFilmDetails()

  if (cachedData) {
    console.log("Returning cached data immediately, scraping in background")

    // background update
    waitUntil(
      scrapePromise
        .then(async (freshData) => {
          if (freshData) {
            if (!freshData.imageUrl) {
              console.warn("Fresh data has no poster URL; skipping cache update")
              return
            }
            if (dataHasChanged(cachedData, freshData)) {
              console.log("Fresh data differs from cache, updating")
              await cacheData(cacheKey, freshData)
            } else {
              console.log("Fresh data matches cache, no update needed")
            }
          }
        })
        .catch((error) => {
          console.error("Background scrape failed:", error)
        })
    )

    return cachedData
  }

  // no cache available, wait for fresh scrape
  console.log("No cached data, waiting for fresh scrape")
  const freshData = await scrapePromise

  if (freshData?.imageUrl) {
    console.log("Caching fresh film details")
    await cacheData(cacheKey, freshData)
  }

  return freshData
}
