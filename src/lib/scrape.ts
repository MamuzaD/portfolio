import { waitUntil } from "@vercel/functions"

import { acquireCacheCooldown, cacheData, getCachedData } from "./redis"

export type FilmDetails = {
  title: string | null
  imageUrl: string | null
  stars: string | null
}

const LETTERBOXD_RSS_URL = "https://letterboxd.com/da_ni/rss/"
const LETTERBOXD_PROFILE_URL = "https://letterboxd.com/da_ni/"
const SCRAPE_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
const SCRAPE_ACCEPT_LANGUAGE = "en-US,en;q=0.9"
const CACHE_KEY = "film:latest"
const FRESHNESS_MS = 15 * 60 * 1000
const REFRESH_COOLDOWN_SECONDS = 60

type CachedFilmDetails = FilmDetails & { refreshedAt?: number }
let nextRefreshAt = 0
let pendingRefresh: Promise<FilmDetails | null> | null = null

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

  const signal = AbortSignal.timeout(15000)
  for (let attempt = 1; attempt <= 2; attempt++) {
    const response = await fetch(LETTERBOXD_RSS_URL, {
      headers,
      signal,
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

function filmDetails(cached: CachedFilmDetails): FilmDetails {
  return { title: cached.title, imageUrl: cached.imageUrl, stars: cached.stars }
}

function refreshFilmDetails(): Promise<FilmDetails | null> {
  if (pendingRefresh) return pendingRefresh
  if (Date.now() < nextRefreshAt) return Promise.resolve(null)

  nextRefreshAt = Date.now() + REFRESH_COOLDOWN_SECONDS * 1000
  pendingRefresh = (async () => {
    if (!(await acquireCacheCooldown("film:refresh-cooldown", REFRESH_COOLDOWN_SECONDS))) return null

    const freshData = await scrapeFilmDetails()
    if (!freshData?.imageUrl) return null

    await cacheData(CACHE_KEY, { ...freshData, refreshedAt: Date.now() })
    return freshData
  })()
    .catch((error) => {
      console.warn("Film refresh failed:", error)
      return null
    })
    .finally(() => {
      pendingRefresh = null
    })

  return pendingRefresh
}

export async function getFilmDetails(): Promise<FilmDetails | null> {
  const cachedData = await getCachedData<CachedFilmDetails>(CACHE_KEY)

  if (cachedData?.imageUrl) {
    const age = Date.now() - (cachedData.refreshedAt ?? 0)
    if (cachedData.refreshedAt && age >= 0 && age < FRESHNESS_MS) return filmDetails(cachedData)

    waitUntil(refreshFilmDetails())
    return filmDetails(cachedData)
  }

  return refreshFilmDetails()
}
