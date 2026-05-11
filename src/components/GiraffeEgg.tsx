"use client"

import { AnimatePresence, motion } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"

type Phase = "idle" | "measuring"

const TICKS = [0, 20, 40, 60, 80, 100]
const MAX_TAPS = 10

function MeasureOverlay({ onComplete, growthScale }: { onComplete: () => void; growthScale: number }) {
  const topOffset = `-${(growthScale - 0.95) * 100}%`
  useEffect(() => {
    const t = setTimeout(onComplete, 3200)
    return () => clearTimeout(t)
  }, [onComplete])

  return (
    <motion.div className="pointer-events-none absolute inset-0" exit={{ opacity: 0, transition: { duration: 0.4 } }}>
      <motion.div
        className="absolute bottom-2"
        style={{ right: "-50px", width: "30px", top: topOffset }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.12 }}
      >
        <motion.div
          className="bg-primary/55 absolute top-0 bottom-0 left-0 w-px"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.35, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "top center" }}
        />

        {TICKS.map((pct, i) => (
          <motion.div
            key={pct}
            className="bg-primary/75 absolute left-0"
            style={{
              top: `${pct}%`,
              height: "1.5px",
              width: i === 0 || i === TICKS.length - 1 ? "14px" : i % 2 === 0 ? "9px" : "5px",
              transformOrigin: "left center",
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.04, duration: 0.13, ease: "easeOut" }}
          />
        ))}

        <motion.span
          className="text-primary absolute top-1/2 left-[18px] -translate-y-1/2 font-mono text-xs leading-none font-black tracking-tighter whitespace-nowrap"
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.85, duration: 0.22, ease: "easeOut" }}
        >
          6&apos;4&quot;
        </motion.span>
      </motion.div>
    </motion.div>
  )
}

export default function GiraffeEgg() {
  const [growthLevel, setGrowthLevel] = useState(0)
  const [phase, setPhase] = useState<Phase>("idle")
  const dismissTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const growthScale = 1.0 + (growthLevel / MAX_TAPS) * 0.2

  const handleTap = () => {
    if (phase !== "idle") return
    setGrowthLevel((prev) => {
      const next = Math.min(prev + 1, MAX_TAPS)
      if (next === MAX_TAPS) setPhase("measuring")
      return next
    })
  }

  const handleMeasureDone = useCallback(() => {
    if (dismissTimeout.current) clearTimeout(dismissTimeout.current)
    dismissTimeout.current = setTimeout(() => {
      setPhase("idle")
      setGrowthLevel(0)
    }, 200)
  }, [])

  useEffect(() => {
    return () => {
      if (dismissTimeout.current) clearTimeout(dismissTimeout.current)
    }
  }, [])

  return (
    <span className="relative">
      <motion.span
        initial={{ x: "140%", y: "4%", opacity: 0, rotate: 10 }}
        whileInView={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
        animate={{ scale: growthScale }}
        viewport={{ once: true }}
        transition={{
          delay: 1.82,
          duration: 1.1,
          ease: [0.22, 1, 0.36, 1],
          rotate: { delay: 1.9, duration: 0.16 },
          opacity: { delay: 1.87, duration: 0.16 },
          scale: { type: "spring", stiffness: 480, damping: 11 },
        }}
        style={{ originY: 1 }}
        className="text-foreground block -scale-x-100 cursor-default text-5xl select-none md:text-7xl"
        onClick={handleTap}
      >
        🦒
      </motion.span>

      <AnimatePresence>
        {phase === "measuring" && <MeasureOverlay onComplete={handleMeasureDone} growthScale={growthScale} />}
      </AnimatePresence>
    </span>
  )
}
