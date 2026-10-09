import type { APIRoute } from "astro"

import {
  busiestCommitWindow,
  COMMIT_CACHE_SECONDS,
  COMMIT_LOOKBACK_MS,
  type WeeklyCommitActivity,
} from "@/lib/github-commit-window"
import { cacheData, getCachedData } from "@/lib/redis"

export const prerender = false

const USERNAME = "MamuzaD"
const ACCOUNT_ID = 94477022
const CACHE_KEY = "github-commit-window"
const PAGE_SIZE = 100
const MAX_RESULTS = 1000

type SearchResult = {
  total_count: number
  incomplete_results: boolean
  items: {
    sha: string
    author: { id: number } | null
    commit: { author: { date: string } }
  }[]
}

async function fetchActivity(): Promise<WeeklyCommitActivity> {
  const now = new Date()
  const startDay = new Date(now.getTime() - COMMIT_LOOKBACK_MS).toISOString().slice(0, 10)
  const endDay = now.toISOString().slice(0, 10)
  const commits: { sha: string; date: string }[] = []
  // Search includes authored commits in public default branches, including organization repos.
  const query = `author:${USERNAME} author-date:${startDay}..${endDay} is:public`
  const signal = AbortSignal.timeout(15_000)
  let total = 0

  for (let page = 1; page === 1 || (page - 1) * PAGE_SIZE < total; page++) {
    const params = new URLSearchParams({ q: query, per_page: String(PAGE_SIZE), page: String(page) })
    const res = await fetch(`https://api.github.com/search/commits?${params}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "danielmamuza.com",
        "X-GitHub-Api-Version": "2026-03-10",
      },
      signal,
    })
    if (!res.ok) throw new Error(`GitHub commit search responded ${res.status}`)
    const result = (await res.json()) as SearchResult
    if (result.incomplete_results || result.total_count > MAX_RESULTS) {
      throw new Error("GitHub commit search returned incomplete results")
    }
    total = result.total_count
    if (!result.items.length && commits.length < total) throw new Error("GitHub commit search ended early")
    for (const item of result.items) {
      if (item.author?.id === ACCOUNT_ID) commits.push({ sha: item.sha, date: item.commit.author.date })
    }
  }

  return { window: busiestCommitWindow(commits, now), updatedAt: now.toISOString() }
}

let pending: Promise<WeeklyCommitActivity> | null = null

async function getActivity(): Promise<WeeklyCommitActivity> {
  pending ??= (async () => {
    const cached = await getCachedData<WeeklyCommitActivity>(CACHE_KEY)
    const activity = cached ?? (await fetchActivity())
    if (!cached) await cacheData(CACHE_KEY, activity, COMMIT_CACHE_SECONDS)
    return activity
  })().finally(() => {
    pending = null
  })
  return pending
}

export const GET: APIRoute = async ({ url }) => {
  if (url.search.length > 0) {
    return new Response("Query parameters are not supported", {
      status: 400,
      headers: { "Cache-Control": "no-store" },
    })
  }

  try {
    return new Response(JSON.stringify(await getActivity()), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, s-maxage=${COMMIT_CACHE_SECONDS}, stale-while-revalidate=${COMMIT_CACHE_SECONDS}`,
      },
    })
  } catch (error) {
    console.warn("GitHub commit window unavailable:", error)
    return new Response("Could not load GitHub commit window", {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    })
  }
}
