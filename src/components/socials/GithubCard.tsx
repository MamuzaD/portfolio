import { motion, useReducedMotion } from "motion/react"
import React from "react"

import { cn } from "@/lib/utils"

import { CardFrame } from "@/components/socials/CardFrame"

import type { GithubContributions } from "@/pages/api/github-contributions"

const WEEKS = 20
const CELL = 11
const GAP = 2.4
const STEP = CELL + GAP
// keep the tooltip this far inside the viewport when an edge column would push it off-screen
const EDGE = 8
const PAYPAL_INTERNSHIP = { start: "2026-05-26", end: "2026-08-14" }

// Contribution shades follow the site's primary green.
const levels = [
  "bg-primary/[0.07] dark:bg-[#202021]",
  "bg-primary/20 dark:bg-primary/35",
  "bg-primary/45 dark:bg-primary/60",
  "bg-primary",
  "bg-[hsl(from_var(--color-primary)_h_s_calc(l-8))] dark:bg-[hsl(from_var(--color-primary)_h_calc(s+12)_calc(l+15))]",
]

// A damped spring keeps the pill close to the cell as the pointer moves.
const follow = { type: "spring", stiffness: 520, damping: 42, mass: 0.55 } as const

let cached: GithubContributions | null = null
let request: Promise<GithubContributions | null> | null = null

function load() {
  request ??= fetch("/api/github-contributions")
    .then((res) => (res.ok ? (res.json() as Promise<GithubContributions>) : null))
    .catch(() => null)
    .then((data) => {
      cached = data
      if (!data) request = null // let the next hover retry
      return data
    })
  return request
}

// the card only mounts once the hover opens, so warm the data as soon as the navbar island loads
if (typeof window !== "undefined") void load()

// same shape as the real grid: full weeks, then a partial column up to today
function emptyWeeks() {
  const today = new Date().getDay()
  return Array.from({ length: WEEKS }, (_, i) => Array<number>(i === WEEKS - 1 ? today + 1 : 7).fill(0))
}

function dayDetails(start: string, offset: number, count: number) {
  const date = new Date(`${start}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + offset)
  const day = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
  const isoDate = date.toISOString().slice(0, 10)
  return {
    label: `${count} ${count === 1 ? "contribution" : "contributions"} · ${day}`,
    internship: isoDate >= PAYPAL_INTERNSHIP.start && isoDate <= PAYPAL_INTERNSHIP.end,
  }
}

function calendarMonths(start: string) {
  const months: { week: number; name: string }[] = []
  const date = new Date(`${start}T00:00:00Z`)
  for (let week = 0; week < WEEKS; week++) {
    const name = date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })
    if (months.at(-1)?.name !== name) months.push({ week, name })
    date.setUTCDate(date.getUTCDate() + 7)
  }
  // Omit a one-week fragment at the left edge so adjacent month names do not overlap.
  return months[1]?.week === 1 ? months.slice(1) : months
}

type Tip = { x: number; y: number; label: string; cell: string; internship: boolean }

export const GithubCard = () => {
  const [data, setData] = React.useState(cached)
  const [tip, setTip] = React.useState<Tip | null>(null)
  const [visible, setVisible] = React.useState(false)
  // the first cell after entering the grid places the tooltip instantly; later cells glide
  const [instant, setInstant] = React.useState(true)
  const grid = React.useRef<HTMLDivElement>(null)
  const header = React.useRef<HTMLDivElement>(null)
  const frame = React.useRef<HTMLDivElement>(null)
  const pill = React.useRef<HTMLDivElement>(null)
  const [placement, setPlacement] = React.useState({ nudge: 0, below: false })
  const reduceMotion = useReducedMotion()

  // Allow the pill to extend past the card while keeping it inside the viewport.
  React.useLayoutEffect(() => {
    if (!tip || !frame.current || !pill.current || !header.current) return
    const center = frame.current.getBoundingClientRect().left + tip.x
    const half = pill.current.offsetWidth / 2
    const clamped = Math.min(Math.max(center, EDGE + half), window.innerWidth - EDGE - half)
    const headerBottom = header.current.offsetTop + header.current.offsetHeight
    // oxlint-disable-next-line react/set-state-in-effect -- needs rendered pill dimensions, measured before paint
    setPlacement({
      nudge: clamped - center,
      below: tip.y - pill.current.offsetHeight - 8 < headerBottom + 4,
    })
  }, [tip])

  React.useEffect(() => {
    if (data) return
    let active = true
    void load().then((result) => active && result && setData(result))
    return () => {
      active = false
    }
  }, [data])

  const year = data?.year ?? new Date().getFullYear()
  const weeks = data?.weeks.map((week) => week.map(([, level]) => level)) ?? emptyWeeks()

  const show = (w: number, d: number) => {
    if (!data || !grid.current) return
    // offsets ignore the hover card's open/scale transforms, unlike getBoundingClientRect
    const { offsetLeft, offsetTop } = grid.current
    setInstant(!visible)
    setTip({
      x: offsetLeft + w * STEP + CELL / 2,
      y: offsetTop + d * STEP,
      ...dayDetails(data.start, w * 7 + d, data.weeks[w][d][0]),
      cell: `${w}-${d}`,
    })
    setVisible(true)
  }

  const still = reduceMotion || instant

  return (
    // the tooltip sits outside CardFrame so its overflow-hidden can't clip edge columns
    <div ref={frame} className="relative">
      <CardFrame label="github.com/mamuzad" className="px-[15.5px] py-5">
        <div ref={header} className="flex h-5 items-center gap-2 text-[13px] leading-none tracking-[0.005em]">
          <svg
            viewBox="0 0 16 16"
            className="size-[18px] shrink-0 text-neutral-600 dark:text-[#b0abab]"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"
            />
          </svg>
          <p className="whitespace-nowrap text-neutral-600 dark:text-[#a1a1a2]">
            {data ? (
              <span className="font-semibold text-neutral-900 tabular-nums dark:text-[#f5f5f7]">
                {data.total.toLocaleString("en-US")}
              </span>
            ) : (
              <span className="bg-primary/10 inline-block h-[9px] w-[34px] animate-pulse rounded-full align-baseline dark:bg-[#202021]" />
            )}{" "}
            contributions in {year}
          </p>
        </div>

        <div className="mx-auto mt-3 w-fit" aria-hidden="true">
          <div
            ref={grid}
            className="grid w-fit auto-cols-[11px] grid-flow-col grid-rows-[repeat(7,11px)] gap-[2.4px]"
            onMouseLeave={() => setVisible(false)}
          >
            {weeks.flatMap((week, w) =>
              week.map((level, d) => (
                <span
                  key={`${w}-${d}`}
                  onMouseEnter={() => show(w, d)}
                  className={cn(
                    "rounded-[2px] transition-colors duration-500",
                    levels[level] ?? levels[0],
                    visible && tip?.cell === `${w}-${d}` && "ring-primary/80 ring-1 dark:ring-white/50",
                    !data && "animate-pulse"
                  )}
                />
              ))
            )}
          </div>
          <div className="relative mt-2 h-3 font-mono text-[9px] leading-3 text-neutral-600 dark:text-neutral-400">
            {data
              ? calendarMonths(data.start).map(({ week, name }) => (
                  <span
                    key={week}
                    className="absolute"
                    style={{ left: Math.min(week * STEP, WEEKS * STEP - GAP - 18) }}
                  >
                    {name}
                  </span>
                ))
              : null}
          </div>
        </div>
      </CardFrame>

      <motion.div
        className="pointer-events-none absolute top-0 left-0 z-10"
        initial={false}
        animate={{ x: (tip?.x ?? 0) + placement.nudge, y: tip?.y ?? 0, opacity: visible ? 1 : 0 }}
        transition={{
          x: still ? { duration: 0 } : follow,
          y: still ? { duration: 0 } : follow,
          opacity: { duration: reduceMotion ? 0 : 0.1 },
        }}
        aria-hidden="true"
      >
        <div style={{ transform: `translate(-50%, ${placement.below ? `${CELL + 8}px` : "calc(-100% - 8px)"})` }}>
          <div
            ref={pill}
            className={cn(
              "border-primary/35 dark:border-primary/50 overflow-hidden border bg-[hsl(from_var(--color-primary)_h_s_calc(l-8))] font-mono text-[10px] leading-tight font-medium tracking-[0.025em] whitespace-nowrap text-white uppercase shadow-[0_4px_12px_rgba(0,0,0,0.12)] dark:bg-[#181c19] dark:text-neutral-100 dark:shadow-[0_4px_12px_rgba(0,0,0,0.4)]",
              tip?.internship ? "rounded-xl px-3.5 py-2" : "rounded-full px-3 py-1.5"
            )}
          >
            <motion.div
              key={tip?.label ?? ""}
              className="block"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.08, ease: "linear" }}
            >
              <span className="block">{tip?.label ?? ""}</span>
              {tip?.internship ? (
                <span className="mt-1.5 flex items-center gap-1.5 border-t border-white/15 pt-1.5 font-sans text-[11px] leading-4 font-normal tracking-normal text-white/85 normal-case">
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-white p-[2px]">
                    <img
                      src="/experiences/paypal.png"
                      width={12}
                      height={12}
                      alt=""
                      className="size-3 object-contain"
                    />
                  </span>
                  PayPal internship
                </span>
              ) : null}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
