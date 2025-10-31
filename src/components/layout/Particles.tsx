// if you are going to use `loadSlim`, install the "@tsparticles/slim" package too.
import { type Container, type ISourceOptions } from "@tsparticles/engine"
import Particles, { initParticlesEngine } from "@tsparticles/react"
import { loadSlim } from "@tsparticles/slim"
import { useEffect, useMemo, useState } from "react"

import { currentProfile, getIcons } from "@/lib/store"

const ParticlesBG = () => {
  const [init, setInit] = useState(false)
  const [particleIcons, setParticleIcons] = useState<string[]>([])
  const [sound, setSound] = useState<HTMLAudioElement | null>(null)

  // this should be run only once per application lifetime
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
      // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
      // starting from v2 you can add only the features you need reducing the bundle size
      //await loadAll(engine);
      //await loadFull(engine);
      await loadSlim(engine)
      //await loadBasic(engine);
    }).then(() => {
      setInit(true)
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
    setSound(new Audio())
  }, [])

  // sounds
  const sounds = ["/sounds/click1.wav", "/sounds/click2.wav", "/sounds/click3.wav", "/sounds/click4.wav"]

  let isPlaying = false

  const playRandomSound = () => {
    if (!sound) return
    // Check if sound is muted
    if ((window as any).soundMuted) return

    const randomSound = sounds[Math.floor(Math.random() * sounds.length)]

    if (isPlaying) {
      sound.pause()
      sound.currentTime = 0
    }

    sound.src = randomSound
    sound.volume = 0.3
    isPlaying = true
    sound.play()

    sound.addEventListener(
      "ended",
      () => {
        isPlaying = false
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

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => {
      setInit(true)
    })
  }, [])

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

  return <></>
}

export default ParticlesBG
