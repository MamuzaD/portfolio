import { persistentAtom } from "@nanostores/persistent"

import { profiles } from "@/content/profiles"

export const currentProfile = persistentAtom<string>("currentProfile", "Me")

export const cycleProfile = () => {
  currentProfile.set(
    profiles[(profiles.findIndex((profile) => profile.name == currentProfile.get()) + 1) % profiles.length].name
  )
}

export const getIcons = (): string[] => {
  let currentIndex = profiles.findIndex((profile) => profile.name === currentProfile.get())

  return profiles[currentIndex].icons
}
