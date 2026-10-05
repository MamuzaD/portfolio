import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type Duration = { start: Date; end?: Date | "Present" }

// most recent activity: ongoing projects first, then by end date (start if no end)
function lastActive({ start, end }: Duration) {
  if (end === "Present") return Number.MAX_SAFE_INTEGER
  return (end ?? start).valueOf()
}

type Sortable = { data: { duration: Duration } }

export function byRecency(a: Sortable, b: Sortable) {
  return lastActive(b.data.duration) - lastActive(a.data.duration)
}
