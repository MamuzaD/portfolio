import { favorites as defaultFavorites } from "@/content/games"

import { cacheData, getCachedData } from "./redis"

const api = import.meta.env.STEAM_API_KEY
const steamId = "76561197989108352"
const recentGamesUrl = `http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${api}&steamid=${steamId}&format=json&count=4`
const allGamesUrl = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${api}&steamid=${steamId}&format=json&include_appinfo=1&include_played_free_games=1`

async function getFavoriteGames(): Promise<string[]> {
  const cachedFavorites = await getCachedData<string[]>("portfolio_favoriteGames")
  if (cachedFavorites) {
    return cachedFavorites
  }

  await cacheData("portfolio_favoriteGames", defaultFavorites)
  return defaultFavorites
}

export type Game = {
  appid: number
  name: string
  playtime_2weeks: number
  playtime_forever: number
  img_icon_url: string
  img_logo_url: string
}

async function fetchRecentGames(): Promise<Game[]> {
  try {
    // get recent games
    const recentResponse = await fetch(recentGamesUrl)
    const recentData = await recentResponse.json()

    if (recentData.response?.games?.length > 0) {
      await cacheData("portfolio_recentGames", recentData.response.games)
      return recentData.response.games
    }
    return []
  } catch (error) {
    console.error("failed to fetch recent games, using cache:", error)
    const cached = await getCachedData<Game[]>("portfolio_recentGames")
    return cached || []
  }
}

async function fetchAllGames(): Promise<Game[]> {
  let allGamesResponse: Response | null = null
  try {
    // get all games
    allGamesResponse = await fetch(allGamesUrl)
    const allGamesData = await allGamesResponse.json()

    if (allGamesData.response?.games) {
      await cacheData("portfolio_allGames", allGamesData.response.games)
      return allGamesData.response.games
    }
    return []
  } catch (error) {
    console.error(`failed to fetch all games (${allGamesResponse?.statusText}), using cache`)
    const cached = await getCachedData<Game[]>("portfolio_allGames")
    return cached || []
  }
}

async function selectFavoriteGames(allGames: Game[], recentGames: Game[], needed: number): Promise<Game[]> {
  const favorites = await getFavoriteGames()
  const favoriteGames = allGames.filter((game: Game) =>
    favorites.some((fav: string) => game.name && game.name.toLowerCase() == fav.toLowerCase())
  )

  // filter out games already in recent
  const newGames = favoriteGames.filter(
    (fav: Game) => !recentGames.some((recentGame) => recentGame.appid === fav.appid)
  )

  // shuffle
  const shuffledFavorites = newGames.sort(() => 0.5 - Math.random())
  return shuffledFavorites.slice(0, needed)
}

async function filterRecentGames(games: Game[]): Promise<Game[]> {
  // filter out any boring games (e.g. Wallpaper Engine)
  const filteredGames = await getCachedData<string[]>("portfolio_filteredGames")
  if (!filteredGames || filteredGames.length === 0) {
    return games
  }

  return games.filter(
    (game) =>
      !filteredGames.some((filteredTitle) => game.name && game.name.toLowerCase() === filteredTitle.toLowerCase())
  )
}

export async function getGames(): Promise<Game[]> {
  let games: Game[] = []

  try {
    // get recent games
    const shouldFetchRecent = await getCachedData<boolean>("portfolio_fetchRecent")
    if (shouldFetchRecent) {
      const recentGames = await fetchRecentGames()
      games = await filterRecentGames(recentGames)
    }

    if (games.length < 4) {
      const allGames = await fetchAllGames()

      if (allGames && allGames.length > 0) {
        const needed = 4 - games.length
        const selectedFavorites = await selectFavoriteGames(allGames, games, needed)
        games = [...games, ...selectedFavorites]
      }
    }
  } catch (error) {
    console.error("failed to fetch games:", error)
  }

  return games
}
