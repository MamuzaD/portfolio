export const COMMIT_TIME_ZONE = "America/Los_Angeles"
export const COMMIT_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000
export const COMMIT_CACHE_SECONDS = 6 * 60 * 60

export type CommitWindow = {
  startHour: number
  commitCount: number
  totalCommits: number
  activeDays: number
}

export type WeeklyCommitActivity = {
  window: CommitWindow | null
  updatedAt: string
}

type Commit = { sha: string; date: string }

const MIN_COMMITS = 5
const MIN_ACTIVE_DAYS = 2

type WindowCandidate = { window: CommitWindow; centerCount: number }

function isBetterWindow(candidate: WindowCandidate, current: WindowCandidate | null): boolean {
  if (!current) return true
  const next = candidate.window
  const previous = current.window
  if (next.commitCount !== previous.commitCount) return next.commitCount > previous.commitCount
  if (next.activeDays !== previous.activeDays) return next.activeDays > previous.activeDays
  return candidate.centerCount > current.centerCount
}

const localTime = new Intl.DateTimeFormat("en-CA", {
  timeZone: COMMIT_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23",
})

export function busiestCommitWindow(commits: Commit[], now = new Date()): CommitWindow | null {
  const cutoff = now.getTime() - COMMIT_LOOKBACK_MS
  const hours = Array.from({ length: 24 }, () => ({ count: 0, dates: new Set<string>() }))
  const seen = new Set<string>()
  const dates = new Set<string>()

  for (const commit of commits) {
    const time = Date.parse(commit.date)
    if (!Number.isFinite(time) || time < cutoff || time > now.getTime() || seen.has(commit.sha)) continue
    seen.add(commit.sha)
    const parts = localTime.formatToParts(time)
    const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((value) => value.type === type)!.value
    const date = `${part("year")}-${part("month")}-${part("day")}`
    const hour = hours[Number(part("hour"))]
    hour.count++
    hour.dates.add(date)
    dates.add(date)
  }

  if (seen.size < MIN_COMMITS || dates.size < MIN_ACTIVE_DAYS) return null

  let best: WindowCandidate | null = null
  for (let startHour = 0; startHour < 24; startHour++) {
    const bins = Array.from({ length: 4 }, (_, offset) => hours[(startHour + offset) % 24])
    const commitCount = bins.reduce((sum, bin) => sum + bin.count, 0)
    const activeDays = new Set(bins.flatMap((bin) => [...bin.dates])).size
    const candidate = {
      window: { startHour, commitCount, totalCommits: seen.size, activeDays },
      centerCount: bins[1].count + bins[2].count,
    }
    if (isBetterWindow(candidate, best)) best = candidate
  }
  return best?.window ?? null
}

function hourLabel(hour: number) {
  if (hour === 0) return "midnight"
  if (hour === 12) return "noon"
  return `${hour % 12} ${hour < 12 ? "AM" : "PM"}`
}

export function commitWindowLabel(startHour: number) {
  return `${hourLabel(startHour)}–${hourLabel((startHour + 4) % 24)} PT`
}

type WindowPresentation = {
  icon: "moon" | "sunrise" | "sun" | "sunset"
  message: string
}

export function commitWindowPresentation(startHour: number): WindowPresentation {
  const middle = (startHour + 2) % 24
  if (middle < 5) return { icon: "moon", message: "sleep was optional" }
  if (middle < 9) return { icon: "sunrise", message: "up early somehow" }
  if (middle < 12) return { icon: "sun", message: "morning commits" }
  if (middle < 17) return { icon: "sun", message: "afternoon side quests" }
  if (middle < 21) return { icon: "sunset", message: "dinner can wait" }
  return { icon: "moon", message: "just one more commit" }
}
