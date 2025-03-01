import type { Game } from "@/components/about/Games.astro"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

interface GameCardProps {
  game: Game
}

const GameCard = ({ game }: GameCardProps) => {
  const text = game.playtime_2weeks
    ? `i've played ${
        game.playtime_2weeks < 120 ? `${game.playtime_2weeks} mins` : `${(game.playtime_2weeks / 60.0).toFixed(1)} hrs`
      } recently`
    : `i've played ${(game.playtime_forever / 60.0).toFixed(1)} hrs total`

  return (
    <HoverCard openDelay={500} closeDelay={50}>
      <HoverCardTrigger>
        <img
          width={80}
          height={80}
          src={`https://images.weserv.nl/?url=https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/hero_capsule.jpg&w=300&h=300&fit=cover`}
          alt={`${game.name}'s Picture`}
          style={{ imageRendering: "crisp-edges" }}
          className="no-sound h-16 w-16 rounded-lg object-cover transition-transform duration-300 ease-in-out hover:scale-110 md:h-[4.75rem] md:w-[4.75rem]"
        />
      </HoverCardTrigger>
      <HoverCardContent
        className="bg-primary-foreground/80 z-999 flex h-40 w-full flex-col place-items-center justify-between backdrop-blur-xl"
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
