"use client"

import * as HoverCardPrimitive from "@radix-ui/react-hover-card"
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react"
import { encode } from "qss"
import React from "react"

import { cn } from "@/lib/utils"

type LinkPreviewProps = {
  children: React.ReactNode
  url?: string
  noUrl?: boolean
  target?: string
  side?: "top" | "right" | "bottom" | "left"
  sideOffset?: number
  align?: "center" | "end" | "start"
  alignOffset?: number
  className?: string
  width?: number
  height?: number
  quality?: number
  layout?: string
} & ({ isStatic: true; imageSrc: string } | { isStatic?: false; imageSrc?: never })

export const LinkPreview = ({
  children,
  url,
  noUrl = false,
  className,
  width = 200,
  height = 125,
  isStatic = false,
  imageSrc = "",
  side = "top",
  sideOffset = 0,
  align = "center",
  alignOffset = 0,
  target = "_self",
}: LinkPreviewProps) => {
  let src
  if (!isStatic) {
    const params = encode({
      url,
      screenshot: true,
      meta: false,
      embed: "screenshot.url",
      colorScheme: "dark",
      "viewport.isMobile": true,
      "viewport.deviceScaleFactor": 1,
      "viewport.width": width * 3,
      "viewport.height": height * 3,
    })
    src = `https://api.microlink.io/?${params}`
  } else {
    src = imageSrc
  }

  const [isOpen, setOpen] = React.useState(false)

  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const springConfig = { stiffness: 100, damping: 15 }
  const x = useMotionValue(0)

  const translateX = useSpring(x, springConfig)

  const handleMouseMove = (event: any) => {
    const targetRect = event.target.getBoundingClientRect()
    const eventOffsetX = event.clientX - targetRect.left
    const offsetFromCenter = eventOffsetX - targetRect.width / 2 // Reduce the effect to make it subtle
    x.set(offsetFromCenter)
  }

  return (
    <>
      {isMounted ? (
        <div className="hidden">
          <img src={src} width={width} height={height} alt="hidden image" />
        </div>
      ) : null}

      <HoverCardPrimitive.Root
        openDelay={50}
        closeDelay={100}
        onOpenChange={(open) => {
          setOpen(open)
        }}
      >
        <HoverCardPrimitive.Trigger
          onMouseMove={handleMouseMove}
          className={cn("text-black dark:text-white", className, {
            "no-sound": noUrl,
          })}
          target={target}
          {...(noUrl ? {} : { href: url })}
          asChild={noUrl}
        >
          {children}
        </HoverCardPrimitive.Trigger>

        <HoverCardPrimitive.Content
          className="z-[9999] [transform-origin:var(--radix-hover-card-content-transform-origin)]"
          side={side}
          align={align}
          alignOffset={alignOffset}
          sideOffset={sideOffset}
        >
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 400,
                    damping: 20,
                  },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                className="rounded-xl shadow-xl"
                style={{
                  x: translateX,
                }}
              >
                {noUrl || !url ? (
                  <div
                    className="bg-background/80 block rounded-xl border-2 p-0.5 backdrop-blur-lg"
                    style={{ fontSize: 0 }}
                  >
                    <img
                      src={isStatic ? imageSrc : src}
                      width={width}
                      height={height}
                      className="rounded-lg"
                      alt="preview image z-[999]"
                    />
                  </div>
                ) : (
                  <a
                    href={url}
                    target={target}
                    className="bg-background/80 block rounded-xl border-2 p-0.5 backdrop-blur-lg"
                    style={{ fontSize: 0 }}
                  >
                    <img
                      src={isStatic ? imageSrc : src}
                      width={width}
                      height={height}
                      className="rounded-lg"
                      alt="preview image z-[999]"
                    />
                  </a>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </HoverCardPrimitive.Content>
      </HoverCardPrimitive.Root>
    </>
  )
}
