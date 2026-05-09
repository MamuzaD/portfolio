"use client"

import { Ellipsis, MonitorIcon, MoonIcon, SunIcon, Volume2, VolumeX } from "lucide-react"
import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function SettingsMenu() {
  const [isMuted, setIsMuted] = useState(true)
  const [theme, setThemeState] = useState<"theme-light" | "dark" | "system">("system")

  useEffect(() => {
    const storedMute = localStorage.getItem("soundMuted")
    if (storedMute) setIsMuted(storedMute === "true")

    const storedTheme = localStorage.getItem("theme") as "theme-light" | "dark" | "system" | null
    if (storedTheme) {
      setThemeState(storedTheme)
    } else {
      setThemeState(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "theme-light")
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("soundMuted", isMuted.toString())
    ;(window as any).soundMuted = isMuted
  }, [isMuted])

  useEffect(() => {
    const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    document.documentElement.classList[isDark ? "add" : "remove"]("dark")
    localStorage.setItem("theme", theme)
  }, [theme])

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          className="text-foreground hover:text-primary h-7 w-7 rounded-full bg-transparent p-0 hover:bg-transparent"
          aria-label="Settings"
        >
          <Ellipsis className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={5} className="z-[200] w-40 rounded-2xl p-2 backdrop-blur-sm">
        <DropdownMenuLabel className="text-center">Settings</DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-muted-foreground pt-2 pb-1 text-xs font-medium tracking-wide uppercase">
            Sound
          </DropdownMenuLabel>
          <div className="bg-muted/60 flex gap-1 rounded-xl p-0.5" role="group" aria-label="Sound">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Sound on"
              className={cn(
                "no-sound h-7 flex-1 gap-1.5 rounded-lg text-xs font-medium",
                !isMuted
                  ? "bg-background text-foreground shadow-sm dark:shadow-sm shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setIsMuted(false)}
              aria-pressed={!isMuted}
            >
              <Volume2 className="h-3.5 w-3.5 shrink-0" />
              On
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Sound off"
              className={cn(
                "no-sound h-7 flex-1 gap-1.5 rounded-lg text-xs font-medium",
                isMuted
                  ? "bg-background text-foreground shadow-sm dark:shadow-sm shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setIsMuted(true)}
              aria-pressed={isMuted}
            >
              <VolumeX className="h-3.5 w-3.5 shrink-0" />
              Off
            </Button>
          </div>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-muted-foreground pb-1 text-xs font-medium tracking-wide uppercase">
            Theme
          </DropdownMenuLabel>
          <div className="bg-muted/60 flex gap-1 rounded-xl p-0.5" role="group" aria-label="Theme">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Light"
              className={cn(
                "h-7 w-7 flex-1 rounded-lg",
                theme === "theme-light"
                  ? "bg-background text-foreground shadow-sm dark:shadow-sm shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setThemeState("theme-light")}
              aria-pressed={theme === "theme-light"}
            >
              <SunIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Dark"
              className={cn(
                "h-7 w-7 flex-1 rounded-lg",
                theme === "dark"
                  ? "bg-background text-foreground shadow-sm dark:shadow-sm shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setThemeState("dark")}
              aria-pressed={theme === "dark"}
            >
              <MoonIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="System"
              className={cn(
                "h-7 w-7 flex-1 rounded-lg",
                theme === "system"
                  ? "bg-background text-foreground shadow-sm dark:shadow-sm shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setThemeState("system")}
              aria-pressed={theme === "system"}
            >
              <MonitorIcon className="h-4 w-4" />
            </Button>
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
