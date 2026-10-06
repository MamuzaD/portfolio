import { Dithering } from "@paper-design/shaders-react"
import { motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"

export default function ShaderCanvas({ isDark, onReady }: { isDark: boolean; onReady: () => void }) {
  const shouldReduceMotion = useReducedMotion()
  const [isScrolling, setIsScrolling] = useState(false)
  const [offsetX] = useState(() => (Math.random() * 2 - 1) * 0.2)

  useEffect(() => {
    if (shouldReduceMotion) onReady()
  }, [shouldReduceMotion, onReady])

  useEffect(() => {
    let scrollTimeout: number | undefined
    const onScroll = () => {
      setIsScrolling(true)
      window.clearTimeout(scrollTimeout)
      scrollTimeout = window.setTimeout(() => setIsScrolling(false), 200)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.clearTimeout(scrollTimeout)
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  return (
    <motion.div
      className="absolute inset-0"
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onAnimationComplete={onReady}
    >
      <Dithering
        className="absolute inset-0 h-full w-full"
        colorBack={isDark ? "#0c0d0c" : "#e9eae3"}
        colorFront={isDark ? "#338a3730" : "#338a3780"}
        shape="warp"
        type="4x4"
        size={2.5}
        speed={shouldReduceMotion || isScrolling ? 0.15 : 0.45}
        scale={0.7}
        rotation={45}
        offsetX={offsetX}
        minPixelRatio={1}
        maxPixelCount={1920 * 1080}
      />
    </motion.div>
  )
}
