import { persistentAtom } from "@nanostores/persistent"
import { useSyncExternalStore } from "react"

export type VisualMode = "full" | "lite"

export const visualMode = persistentAtom<VisualMode>("visualMode", "full", {
  encode: (mode) => mode,
  decode: (raw: string) => (raw === "lite" ? "lite" : "full"),
})

const getServerSnapshot = (): VisualMode => "full"

export function useVisualMode(): VisualMode {
  return useSyncExternalStore(visualMode.listen, visualMode.get, getServerSnapshot)
}

let webglAvailable: boolean | undefined

export function hasWebGL() {
  if (webglAvailable !== undefined) return webglAvailable

  try {
    const gl = document.createElement("canvas").getContext("webgl2", { failIfMajorPerformanceCaveat: true })
    if (!gl) return (webglAvailable = false)
    gl.getExtension("WEBGL_lose_context")?.loseContext()
    return (webglAvailable = true)
  } catch {
    return (webglAvailable = false)
  }
}
