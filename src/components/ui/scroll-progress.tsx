import { motion, useScroll } from "motion/react"
import { useEffect, useState } from "react"

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    let frame2: number | null = null

    const frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => {
        scrollYProgress.set(window.scrollY === 0 ? 0 : scrollYProgress.get())
        setMounted(true)
      })
    })

    return () => {
      cancelAnimationFrame(frame1)
      if (frame2 !== null) cancelAnimationFrame(frame2)
    }
  }, [scrollYProgress])

  if (!mounted) return null

  return (
    <div className="bg-primary-foreground absolute top-[95%] right-0 left-0 z-99 h-[2px] overflow-hidden md:top-[75px] md:right-5 md:left-5">
      <motion.div style={{ scaleX: scrollYProgress }} className="bg-primary h-full origin-left" />
    </div>
  )
}
