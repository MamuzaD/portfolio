import { motion, useScroll } from "motion/react"

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()

  return (
    <motion.div
      style={{ scaleX: scrollYProgress }}
      className="bg-primary absolute top-[95%] right-0 left-0 z-99 h-[2px] origin-left p-0 md:top-[75px] md:right-5 md:left-5"
    />
  )
}
