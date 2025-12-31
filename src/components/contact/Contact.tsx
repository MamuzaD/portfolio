"use client"

import { Clipboard, Link2 } from "lucide-react"
import { motion } from "motion/react"
import { useEffect, useRef, useState } from "react"

import { reachouts } from "@/content/socials"

import ContactForm from "@/components/contact/ContactForm"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Contact() {
  const [viewForm, setViewForm] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedMessage, setCopiedMessage] = useState<string>("")
  const formRef = useRef<HTMLDivElement | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleCopy = (name: string, href: string) => {
    navigator.clipboard.writeText(href)
    setCopied(true)
    setCopiedMessage(`saved ${name}`)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    if (viewForm && formRef.current) formRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [viewForm])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && dropdownOpen)
        setDropdownOpen(false)
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [dropdownOpen])

  return (
    <section className="relative z-50 flex flex-col items-center">
      {!dropdownOpen && !viewForm && (
        <div className="absolute -right-24 bottom-10 z-10">
          <img src="/particles/arrow.gif" alt="pointer" className="h-24 w-24 object-contain" />
        </div>
      )}
      {!viewForm && (
        <div ref={dropdownRef}>
          <DropdownMenu modal={false} open={dropdownOpen}>
            <DropdownMenuTrigger
              onClick={() => setDropdownOpen((val) => !val)}
              className={`z-50 min-h-26 text-4xl font-bold ${!copied && "pb-5"} hover-underline-animation cursor-pointer`}
            >
              contact me
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-muted/50 w-full backdrop-blur-md">
              <DropdownMenuLabel className="text-center">your preference</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setViewForm(true)
                  setDropdownOpen(false)
                }}
                className="flex cursor-pointer items-center gap-2 text-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2M7 7h2v2H7zm0 4h2v2H7zm0 4h2v2H7zm10 2h-6v-2h6zm0-4h-6v-2h6zm0-4h-6V7h6z"
                  />
                </svg>
                <span>contact form</span>
              </DropdownMenuItem>
              {reachouts.map((r) => (
                <DropdownMenuItem key={r.name} className="items-center justify-between gap-10 text-lg">
                  <div className="flex items-center gap-2">
                    {r.icon}
                    <span>{r.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="outline" className="dark:hover:bg-primary-foreground size-9">
                      <a href={r.href} target="_blank" rel="noopener noreferrer">
                        <Link2 />
                      </a>
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="dark:hover:bg-primary-foreground size-9"
                      onClick={() => handleCopy(r.name, r.href)}
                    >
                      <Clipboard />
                    </Button>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      {viewForm && (
        <div ref={formRef}>
          <ContactForm setViewForm={setViewForm} setDropdownOpen={setDropdownOpen} />
        </div>
      )}
      {copied && (
        <motion.span
          className="saved text-primary text-sm font-semibold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {copiedMessage}
        </motion.span>
      )}
    </section>
  )
}
