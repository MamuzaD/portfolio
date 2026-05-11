"use client"

import { useEffect, useState } from "react"

import TypingAnimation from "@/components/ui/typing-animation"

import { Button } from "./ui/button"

const REDIRECT_DELAY_MS = 7000
const TICK_MS = 50

export default function NotFound() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const timeout = window.setTimeout(() => {
      window.location.href = "/"
    }, REDIRECT_DELAY_MS)

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - start
      const next = Math.min((elapsed / REDIRECT_DELAY_MS) * 100, 100)
      setProgress(next)
      if (next >= 100) window.clearInterval(interval)
    }, TICK_MS)

    return () => {
      window.clearTimeout(timeout)
      window.clearInterval(interval)
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <TypingAnimation className="min-h-20">page not found...</TypingAnimation>
      <TypingAnimation className="min-h-24 text-6xl tracking-wide" delay={850} duration={500}>
        404
      </TypingAnimation>

      <div className="w-full max-w-xs space-y-2 px-4">
        <span className="text-muted-foreground block text-center text-sm">Redirecting...</span>
        <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
          <div className="bg-primary h-full duration-75 ease-linear" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <a href="/" data-astro-prefetch className="z-10 w-full max-w-xs cursor-pointer">
        <Button className="z-10 w-full max-w-xs cursor-pointer">go home</Button>
      </a>
    </div>
  )
}
