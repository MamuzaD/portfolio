"use client"

import { Volume2, VolumeX } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

export function MuteToggle() {
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    const storedMute = localStorage.getItem("soundMuted")
    if (storedMute) {
      setIsMuted(storedMute === "true")
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("soundMuted", isMuted.toString())
    ;(window as any).soundMuted = isMuted
  }, [isMuted])

  const toggleMute = () => {
    console.log("toggleMute")
    setIsMuted((prev) => !prev)
  }

  return (
    <Button
      size="icon"
      onClick={toggleMute}
      className="no-sound h-7 w-7 rounded-full bg-foreground p-0 hover:bg-primary"
    >
      <Volume2 className={`h-4 w-4 transition-transform ${isMuted ? "-rotate-90 scale-0" : ""}`} />
      <VolumeX
        className={`absolute h-4 w-4 transition-transform ${isMuted ? "rotate-0 scale-100" : "-rotate-90 scale-0"}`}
      />
      <span className="sr-only">Toggle sound</span>
    </Button>
  )
}
