import { useCallback, useEffect, useState } from "react";

import type { Game } from "@/components/about/Games.astro";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface GameCardProps {
  game: Game
}

const GameCard = ({ game }: GameCardProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const text = game.playtime_2weeks
    ? `i've played ${
        game.playtime_2weeks < 120 ? `${game.playtime_2weeks} mins` : `${(game.playtime_2weeks / 60.0).toFixed(1)} hrs`
      } recently`
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
    if (game.appid === 911400)
      game.appid = 208480
    
    const heroCapsuleUrl = `https://images.weserv.nl/?url=https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/hero_capsule.jpg&w=300&h=300&fit=cover`
    const capsule231x87Url = `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${game.appid}/capsule_231x87.jpg`
    const library600x900Url = `https://images.weserv.nl/?url=https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/library_600x900.jpg&w=300&h=300&fit=cover`

    Promise.any([checkImageExists(heroCapsuleUrl), checkImageExists(library600x900Url)])
      .then((url) => setImageUrl(url))
      .catch(() => {
        // If all images fail, use the capsule URL
        setImageUrl(capsule231x87Url)
      })
  }, [game.appid, checkImageExists])

  return (
    <HoverCard openDelay={500} closeDelay={50}>
      <HoverCardTrigger asChild>
        {imageUrl ? (
          <img
            width={80}
            height={80}
            src={imageUrl}
            alt={`${game.name}'s Picture`}
            style={{ imageRendering: "crisp-edges" }}
            className="no-sound h-16 w-16 rounded-lg object-cover transition-transform duration-300 ease-in-out hover:scale-110 md:h-[4.75rem] md:w-[4.75rem]"
          />
        ) : (
          <div className="h-16 w-16 rounded-lg bg-neutral-200 transition-transform duration-300 ease-in-out hover:scale-110 dark:bg-neutral-700 md:h-[4.75rem] md:w-[4.75rem]" />
        )}
      </HoverCardTrigger>
      <HoverCardContent
        className="bg-primary-foreground/80 z-[999] flex h-40 w-full flex-col place-items-center justify-between backdrop-blur-xl"
        side="top"
      >
        <img
          width={374}
          height={488}
          src={`https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${game.appid}/capsule_231x87.jpg`}
          alt={`${game.name}'s Picture`}
          style={{ imageRendering: "crisp-edges" }}
          className="w-full rounded-lg object-cover transition-transform duration-300 ease-in-out hover:scale-110"
        />
        <span className="font-semibold">{text}</span>
      </HoverCardContent>
    </HoverCard>
  )
}

export default GameCard