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
      className="no-sound bg-foreground hover:bg-primary h-7 w-7 rounded-full p-0"
    >
      <Volume2 className={`h-4 w-4 transition-transform ${isMuted ? "scale-0 -rotate-90" : ""}`} />
      <VolumeX
        className={`absolute h-4 w-4 transition-transform ${isMuted ? "scale-100 rotate-0" : "scale-0 -rotate-90"}`}
      />
      <span className="sr-only">Toggle sound</span>
    </Button>
  )
}
