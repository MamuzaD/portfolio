import { type Container, type ISourceOptions } from "@tsparticles/engine"
import Particles, { initParticlesEngine } from "@tsparticles/react"
import { loadSlim } from "@tsparticles/slim"
import { useEffect, useMemo, useRef, useState } from "react"

import { useVisualMode } from "@/lib/lite-mode"
import { currentProfile, getIcons } from "@/lib/store"

let particlesEngineInitPromise: Promise<void> | null = null

function initializeParticlesEngine() {
  particlesEngineInitPromise ??= initParticlesEngine(async (engine) => {
    await loadSlim(engine)
  }).catch((error: unknown) => {
    particlesEngineInitPromise = null
    throw error
  })

  return particlesEngineInitPromise
}

// Gate on visual mode here so none of the canvas hooks run in lite mode.
const ParticlesBG = () => {
  const mode = useVisualMode()
  return mode === "full" ? <ParticlesCanvas /> : null
}

const ParticlesCanvas = () => {
  const [init, setInit] = useState(false)
  const [particleIcons, setParticleIcons] = useState<string[]>([])
  const soundRef = useRef<HTMLAudioElement | null>(null)
  const isPlayingRef = useRef(false)

  useEffect(() => {
    initializeParticlesEngine()
      .then(() => setInit(true))
      .catch(() => {
        // engine chunk failed to load; particles stay hidden and the next mount retries
      })
  }, [])

  useEffect(() => {
    const unsubscribe = currentProfile.subscribe(() => {
      const icons = getIcons()
      setParticleIcons(icons)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    soundRef.current = new Audio()
  }, [])

  // sounds
  const sounds = ["/sounds/click1.wav", "/sounds/click2.wav", "/sounds/click3.wav", "/sounds/click4.wav"]

  const playRandomSound = () => {
    const sound = soundRef.current
    if (!sound) return
    // Check if sound is muted
    if ((window as any).soundMuted) return

    const randomSound = sounds[Math.floor(Math.random() * sounds.length)]

    if (isPlayingRef.current) {
      sound.pause()
      sound.currentTime = 0
    }

    sound.src = randomSound
    sound.volume = 0.3
    isPlayingRef.current = true
    sound.play()

    sound.addEventListener(
      "ended",
      () => {
        isPlayingRef.current = false
      },
      { once: true }
    )
  }

  const particlesLoaded = async (container: Container | undefined): Promise<void> => {
    if (container) {
      container.interactivity.element?.addEventListener("click", () => {
        playRandomSound()
      })
    }
  }

  const options: ISourceOptions = useMemo(
    () => ({
      detectRetina: true,
      fpsLimit: 60,
      fullScreen: {
        enable: true,
        zIndex: 0, // or any value is good for you, if you use -1 set `interactivity.detectsOn` to `"window"` if you need mouse interactions
      },
      interactivity: {
        detectsOn: "canvas",
        events: {
          onClick: {
            enable: true,
            mode: "push",
          },
          onHover: {
            enable: true,
            mode: "bubble",
          },
        },
        modes: {
          bubble: {
            distance: 400,
            duration: 2,
            opacity: 1,
            size: 24,
            speed: 15,
          },
          push: {
            quantity: 1,
          },
        },
      },
      particles: {
        rotate: {
          value: 0,
          random: true,
          direction: "clockwise",
          animation: {
            enable: true,
            speed: 5,
            sync: false,
          },
        },
        move: {
          enable: true,
          outMode: "out",
          speed: 1,
        },
        number: {
          value: 15,
        },
        opacity: {
          value: 0.8,
        },
        shape: {
          type: "image",
          options: {
            image: particleIcons.map((icon) => ({
              src: icon,
              width: 64,
              height: 64,
            })),
          },
        },
        size: {
          value: 22,
        },
      },
    }),
    [particleIcons]
  )

  if (init && particleIcons.length > 0) {
    return <Particles id="tsparticles" particlesLoaded={particlesLoaded} options={options} className="absolute" />
  }

  return null
}

export default ParticlesBG
