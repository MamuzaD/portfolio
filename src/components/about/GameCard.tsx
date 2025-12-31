import { useCallback, useEffect, useState } from "react"

import type { Game } from "@/lib/games"

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

interface GameCardProps {
  game: Game
}

const GameCard = ({ game }: GameCardProps) => {
  const [heroImg, setHeroImg] = useState<string | null>(null)
  const [bannerImg, setBannerImg] = useState<string | null>(null)

  const text = game.playtime_2weeks
    ? `i've played ${
        game.playtime_2weeks < 120 ? `${game.playtime_2weeks} mins` : `${(game.playtime_2weeks / 60.0).toFixed(1)} hrs`
      } recently`
    : game.playtime_forever === 0
      ? "on the backlog"
      : `i've played ${(game.playtime_forever / 60.0).toFixed(1)} hrs total`

  const checkImageExists = useCallback((url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(url) // Resolve with the URL
      img.onerror = () => reject() // Reject if the image fails to load
      img.src = url
    })
  }, [])

  useEffect(() => {
    // ac3
    const appid = game.appid === 911400 ? 208480 : game.appid

    const imageUrls = {
      heroCapsule: `https://images.weserv.nl/?url=https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/hero_capsule.jpg&w=300&h=300&fit=cover`,
      capsule231x87: `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appid}/capsule_231x87.jpg`,
      library600x900: `https://images.weserv.nl/?url=https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/library_600x900.jpg&w=300&h=300&fit=cover`,
      header: `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg`,
    }

    // priority order
    const heroFallbacks = ["heroCapsule", "library600x900", "header", "capsule231x87"]
    const bannerFallbacks = ["capsule231x87", "header", "library600x900", "heroCapsule"]

    async function findWorkingImage(fallbackOrder: string[]): Promise<string | null> {
      for (const imageType of fallbackOrder) {
        try {
          const url = await checkImageExists(imageUrls[imageType as keyof typeof imageUrls])
          if (url) return url
        } catch {
          continue
        }
      }
      return null
    }

    Promise.all([findWorkingImage(heroFallbacks), findWorkingImage(bannerFallbacks)]).then(([heroUrl, bannerUrl]) => {
      setHeroImg(heroUrl)
      setBannerImg(bannerUrl)
    })
  }, [game.appid, checkImageExists])

  return (
    <HoverCard openDelay={500} closeDelay={50}>
      <HoverCardTrigger asChild>
        {heroImg ? (
          <img
            width={80}
            height={80}
            src={heroImg}
            alt={`${game.name}'s Picture`}
            style={{ imageRendering: "crisp-edges" }}
            className="no-sound h-16 w-16 rounded-lg object-cover transition-transform duration-300 ease-in-out hover:scale-110 md:h-[4.75rem] md:w-[4.75rem]"
          />
        ) : (
          <div className="h-16 w-16 rounded-lg bg-neutral-200 transition-transform duration-300 ease-in-out hover:scale-110 md:h-[4.75rem] md:w-[4.75rem] dark:bg-neutral-700" />
        )}
      </HoverCardTrigger>
      <HoverCardContent
        className="bg-primary-foreground/80 z-[999] flex h-40 w-full flex-col place-items-center justify-between backdrop-blur-xl"
        side="top"
      >
        {bannerImg ? (
          <img
            width={374}
            height={488}
            src={bannerImg}
            alt={`${game.name}'s Picture`}
            style={{ imageRendering: "crisp-edges" }}
            className="h-[87px] w-[231px] rounded-lg object-cover transition-transform duration-300 ease-in-out hover:scale-110"
          />
        ) : (
          <div className="h-[87px] w-[231px] rounded-lg bg-neutral-200 object-cover transition-transform duration-300 ease-in-out hover:scale-110 dark:bg-neutral-700" />
        )}
        <span className="font-semibold">{text}</span>
      </HoverCardContent>
    </HoverCard>
  )
}

export default GameCard
