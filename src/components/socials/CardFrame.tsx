import { ArrowUpRight } from "lucide-react"
import type React from "react"

import { cn } from "@/lib/utils"

type CardFrameProps = {
  /** Shown in the footer, e.g. "github.com/mamuzad". */
  label: string
  className?: string
  children: React.ReactNode
}

/**
 * Shared shell for the navbar social hover cards, so every card is the same size
 * and carries the site's mono footer label.
 */
export const CardFrame = ({ label, className, children }: CardFrameProps) => (
  <div className="group flex h-[212px] w-[300px] flex-col overflow-hidden rounded-[20px] border border-black/10 border-t-black/[0.06] bg-gradient-to-b from-white to-[#f2f3ed] font-normal text-neutral-900 antialiased dark:border-white/[0.09] dark:border-t-white/[0.13] dark:from-[#151516] dark:to-[#0e0e10] dark:text-white">
    <div className={cn("min-h-0 flex-1", className)}>{children}</div>
    <div className="flex h-8 shrink-0 items-center justify-between border-t border-black/[0.08] px-[18px] font-mono text-[10px] tracking-[0.08em] text-neutral-600 uppercase dark:border-white/[0.06] dark:text-neutral-400">
      <span className="truncate">{label}</span>
      <ArrowUpRight className="size-3 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-neutral-900 dark:group-hover:text-neutral-300" />
    </div>
  </div>
)
