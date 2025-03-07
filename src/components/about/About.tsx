"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

import Movies from "@/components/about/Movies"
import Quotes from "@/components/about/Quotes"
import TopSkills from "@/components/about/TopSkills"

interface AboutProps {
  children: ReactNode // This is the type for the content inside the component
}

export default function About({ children }: AboutProps) {
  return (
    <motion.div
      className="relative flex h-full min-h-[400px] w-full max-w-[785px] auto-rows-[176px] grid-cols-4 flex-col gap-4 rounded-xl bg-primary-foreground/50 p-4 shadow-aboutcard backdrop-blur-sm md:grid"
      initial={{
        opacity: 0,
        transform: "perspective(1500px) translateY(400px) rotateX(45deg) scaleX(0.9)", // Initial state
      }}
      whileInView={{
        opacity: 1,
        transform: "perspective(1500px) translateY(0px) rotateX(0deg) scaleX(1)", // Final state
      }}
      viewport={{ once: true, margin: "500px" }}
      transition={{
        type: "spring",
        stiffness: 90,
        damping: 16,
        duration: 300,
        delay: 0.6,
      }}
    >
      <Quotes />
      {children}
      <Movies />
      <TopSkills />
    </motion.div>
  )
}
