"use client"

import { motion } from "motion/react"

import GiraffeEgg from "@/components/GiraffeEgg"
import { LinkPreview } from "@/components/ui/link-preview"

export default function Welcome() {
  return (
    <main className="relative z-0 mx-auto mb-12 flex max-w-3xl flex-col items-start px-4 pt-60">
      <h1 className="font-display mb-5 leading-none font-black tracking-tight">
        <motion.span
          className="block text-2xl font-extrabold md:text-3xl"
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 120, damping: 12, duration: 500, delay: 0.35 }}
        >
          hey, i&apos;m
        </motion.span>
        <motion.span
          className="text-primary inline-flex items-center gap-4 text-6xl md:text-8xl"
          initial={{ x: -200, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 10,
            duration: 500,
            delay: 0.5,
          }}
        >
          <span className="z-1">daniel</span>
          <GiraffeEgg />
        </motion.span>
      </h1>

      <motion.h2
        className="text-muted-foreground max-w-sm text-lg md:text-xl"
        initial={{ x: -20, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 100, damping: 10, duration: 3, delay: 0.98 }}
      >
        software engineer <span className="text-foreground font-bold">·</span> student at{" "}
        <LinkPreview
          noUrl
          imageSrc="/experiences/unlv.webp"
          height={80}
          width={80}
          isStatic
          className="text-muted-foreground dark:text-muted-foreground cursor-default"
          side="right"
          sideOffset={20}
          align="center"
          alignOffset={0}
        >
          <span>unlv</span>
        </LinkPreview>
      </motion.h2>
    </main>
  )
}
