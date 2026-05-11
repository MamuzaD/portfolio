import { Dithering } from "@paper-design/shaders-react"
import { motion, useReducedMotion } from "motion/react"
import { useEffect, useRef, useState } from "react"

export default function ShaderOverlay() {
  const shouldReduceMotion = useReducedMotion()
  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined" ? document.documentElement.classList.contains("dark") : false
  )
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef<number | null>(null)
  const randVal = useRef(Math.random() * 2 - 1)

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains("dark"))
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onScroll = () => {
      setIsScrolling(true)
      if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = window.setTimeout(() => setIsScrolling(false), 200)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const paused = shouldReduceMotion || isScrolling

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: -1 }}
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* capped at 1440p so the shader doesn't repeat on weird res */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: "2560px",
          height: "100%",
          maxHeight: "1440px",
        }}
      >
        <Dithering
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            maskImage: "radial-gradient(ellipse 60% 65% at 50% 40%, black 25%, transparent 90%)",
            WebkitMaskImage: "radial-gradient(ellipse 60% 65% at 50% 40%, black 25%, transparent 90%)",
          }}
          colorBack={isDark ? "#0c0d0c" : "#e9eae3"}
          colorFront={isDark ? "#338a3725" : "#338a3780"}
          shape="warp"
          type="4x4"
          size={2.5}
          speed={paused ? 0.15 : 0.45}
          scale={0.7}
          rotation={45}
          offsetX={randVal.current * 0.2}
          minPixelRatio={1}
        />
      </div>
    </motion.div>
  )
}
