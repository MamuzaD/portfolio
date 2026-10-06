import { Component, lazy, Suspense, useEffect, useState } from "react"

import { hasWebGL, useVisualMode } from "@/lib/lite-mode"

import ShaderStill from "./ShaderStill"

const ShaderCanvas = lazy(() => import("./ShaderCanvas"))

export default function ShaderOverlay() {
  const mode = useVisualMode()
  const [hasShownStill, setHasShownStill] = useState(mode === "lite")
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"))

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains("dark"))
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  // Lite never probes WebGL or downloads the animation module.
  const useStill = mode === "lite" || !hasWebGL()

  if (useStill && !hasShownStill) setHasShownStill(true)

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0" style={{ zIndex: -1 }}>
      {/* Keep the fade in viewport coordinates, even when the still is cropped. */}
      <div
        className="absolute inset-x-0 top-0 mx-auto h-full max-h-[1440px] w-full max-w-[2560px]"
        style={{
          maskImage: "radial-gradient(ellipse 60% 65% at 50% 40%, black 25%, transparent 90%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 65% at 50% 40%, black 25%, transparent 90%)",
        }}
      >
        {useStill ? (
          <ShaderStill isDark={isDark} />
        ) : (
          <ShaderBoundary isDark={isDark} keepStillWhileLoading={hasShownStill} />
        )}
      </div>
    </div>
  )
}

class ShaderBoundary extends Component<
  { isDark: boolean; keepStillWhileLoading: boolean },
  { failed: boolean; showStill: boolean }
> {
  // Keep Lite's still until Full is ready.
  state = { failed: false, showStill: this.props.keepStillWhileLoading }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  onReady = () => this.setState({ showStill: false })

  render() {
    const { isDark } = this.props
    if (this.state.failed) return <ShaderStill isDark={isDark} />

    return (
      <>
        {this.state.showStill && <ShaderStill isDark={isDark} />}
        <Suspense fallback={null}>
          <ShaderCanvas isDark={isDark} onReady={this.onReady} />
        </Suspense>
      </>
    )
  }
}
