import type { APIRoute } from "astro"

import { cacheData, getCachedData } from "@/lib/redis"

export const prerender = false

const USERNAME = "mamuzad"
const WEEKS = 20
const CACHE_KEY = `github-contributions:v3:${WEEKS}w`
const CACHE_SECONDS = 60 * 60

export type GithubContributions = {
  total: number
  year: number
  /** Date of the first cell (a Sunday), YYYY-MM-DD. Cell dates follow from it. */
  start: string
  /** Oldest week first, each week Sunday-first; the last week stops at today. Each day is [count, level 0-4]. */
  weeks: [count: number, level: number][][]
}

type Day = { date: string; count: number; level: number }

const headers = { "User-Agent": "danielmamuza.com", Accept: "text/html" }

async function fetchText(url: string) {
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`${url} responded ${res.status}`)
  return res.text()
}

// github's own calendar fragment, no token needed
async function fromGithub(year: number) {
  const [lastYearHtml, yearHtml] = await Promise.all([
    fetchText(`https://github.com/users/${USERNAME}/contributions`),
    fetchText(`https://github.com/users/${USERNAME}/contributions?from=${year}-01-01&to=${year}-12-31`),
  ])

  // counts only live in each cell's tooltip: "4 contributions on May 1st." / "No contributions on ..."
  const counts = new Map<string, number>()
  for (const [, id, text] of lastYearHtml.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]*)/g)) {
    counts.set(id, Number(text.match(/^([\d,]+) contribution/)?.[1].replace(/,/g, "") ?? 0))
  }

  const days: Day[] = []
  for (const tag of lastYearHtml.match(/<td[^>]*data-date="[^"]+"[^>]*>/g) ?? []) {
    const date = tag.match(/data-date="([^"]+)"/)?.[1]
    const level = tag.match(/data-level="(\d)"/)?.[1]
    const id = tag.match(/id="([^"]+)"/)?.[1]
    if (date && level) days.push({ date, level: Number(level), count: (id && counts.get(id)) || 0 })
  }

  const heading = yearHtml.replace(/\s+/g, " ").match(/([\d,]+) contributions? in (\d{4})/)
  if (!days.length || !counts.size || !heading) throw new Error("Unexpected GitHub contributions markup")

  return { days, total: Number(heading[1].replace(/,/g, "")) }
}

// community mirror of the same data, used if github's markup changes
async function fromMirror(year: number) {
  const get = async (y: string) => {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=${y}`)
    if (!res.ok) throw new Error(`Mirror responded ${res.status}`)
    return (await res.json()) as { total: Record<string, number>; contributions: Day[] }
  }
  const [lastYear, thisYear] = await Promise.all([get("last"), get(String(year))])
  return { days: lastYear.contributions, total: thisYear.total[year] ?? 0 }
}

function toWeeks(days: Day[]) {
  const byDate = new Map(days.map((day) => [day.date, day]))
  // the calendar ends on the user's "today", which may differ from the server's UTC date
  const today = days
    .map((day) => day.date)
    .sort()
    .at(-1)!
  const end = new Date(`${today}T00:00:00Z`)
  const start = new Date(end)
  start.setUTCDate(end.getUTCDate() - end.getUTCDay() - (WEEKS - 1) * 7)

  const weeks: GithubContributions["weeks"] = []
  for (const day = new Date(start); day <= end; day.setUTCDate(day.getUTCDate() + 1)) {
    if (day.getUTCDay() === 0) weeks.push([])
    const found = byDate.get(day.toISOString().slice(0, 10))
    weeks.at(-1)!.push([found?.count ?? 0, found?.level ?? 0])
  }
  return { start: start.toISOString().slice(0, 10), weeks }
}

async function getContributions(): Promise<GithubContributions> {
  // daniel's calendar year, not the server's UTC one
  const year = Number(new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", year: "numeric" }).format())
  const { days, total } = await fromGithub(year).catch((error) => {
    console.warn("GitHub contributions: falling back to mirror:", error)
    return fromMirror(year)
  })
  return { total, year, ...toWeeks(days) }
}

export const GET: APIRoute = async () => {
  try {
    let data = await getCachedData<GithubContributions>(CACHE_KEY)
    if (!data) {
      data = await getContributions()
      await cacheData(CACHE_KEY, data, CACHE_SECONDS)
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("Error in github-contributions API route:", error)
    return new Response("Could not load GitHub contributions", { status: 502 })
  }
}
