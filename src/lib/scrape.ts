import chromium from "@sparticuz/chromium"
import puppeteer, { Browser, Page } from "puppeteer-core"

import { cacheData, getCachedData } from "./redis"

let browserInstance: Browser | null = null

async function getBrowser() {
  if (browserInstance) return browserInstance

  console.log("Starting browser launch...")
  if (process.env.NODE_ENV === "development") {
    console.log("Launching in development mode...")
    browserInstance = await puppeteer.launch({
      headless: true,
      dumpio: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--single-process", "--no-zygote"],
    })
  } else {
    console.log("Launching in production mode with Chromium...")
    chromium.setHeadlessMode = true
    browserInstance = await puppeteer.launch({
      args: [
        ...chromium.args,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--single-process",
        "--no-zygote",
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
    })
  }
  console.log("Browser launched successfully.")

  return browserInstance
}

export async function closeBrowser() {
  if (browserInstance) {
    console.log("Closing browser instance...")
    await browserInstance.close()
    browserInstance = null
    console.log("Browser closed")
  }
}

type FilmDetails = {
  title: string | null
  imageUrl: string | null
  stars: string | null
}

async function scrapeFilmDetails(): Promise<FilmDetails | null> {
  const url = "https://letterboxd.com/da_ni/films/diary/"
  let browser: Browser | null = null
  let page: Page | null = null

  try {
    browser = await getBrowser()

    page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 800 })
    await page.setRequestInterception(true)
    page.on("request", (req) => {
      const resourceType = req.resourceType()
      if (["document", "xhr", "fetch", "script", "image"].includes(resourceType)) {
        req.continue()
      } else {
        req.abort()
      }
    })

    console.log(`Navigating to URL: ${url}`)
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 })
    console.log("Initial page load completed.")

    console.log("Waiting for the .td-film-details selector...")
    await page.waitForSelector(".td-film-details", { timeout: 10000 })
    console.log("Element .td-film-details found.")

    // Wait for the real image to load by checking its src attribute
    await page.waitForFunction(
      () => {
        const imgElement = document.querySelector(".td-film-details img")
        if (!imgElement) return false
        const src = imgElement.getAttribute("src")
        return src && !src.includes("empty-poster")
      },
      { timeout: 10000, polling: 500 }
    )
    console.log("Film poster received.")

    const filmDetails = await page.evaluate(() => {
      const filmElement = document.querySelector(".td-film-details")
      if (!filmElement) return null

      const titleElement = filmElement.parentElement?.querySelector("h3.headline-3 a")
      const title = titleElement?.textContent?.trim() || null

      const imgElement = filmElement.querySelector("img")
      let imageUrl = imgElement?.getAttribute("src")?.replace("35", "100") || null
      if (imageUrl) {
        imageUrl = imageUrl.replace(/-0-(\d+)-0-(\d+)/, "-0-70-0-105")
      }

      const starsElement = document.querySelector("span.rating")
      const stars = starsElement?.textContent?.trim() || null

      return { title, imageUrl, stars }
    })

    console.log("Scraping completed.")
    console.log(filmDetails?.imageUrl)
    return filmDetails
  } catch (error) {
    console.error("Error occurred while scraping:", error)
    return null
  } finally {
    if (page) {
      await page.close()
      console.log("Page closed")
    }
  }
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
    scrapePromise
      .then(async (freshData) => {
        if (freshData) {
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

    return cachedData
  }

  // no cache available, wait for fresh scrape
  console.log("No cached data, waiting for fresh scrape")
  const freshData = await scrapePromise

  if (freshData) {
    console.log("Caching fresh film details")
    await cacheData(cacheKey, freshData)
  }

  return freshData
}
