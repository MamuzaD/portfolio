export default function ShaderStill({ isDark }: { isDark: boolean }) {
  const theme = isDark ? "dark" : "light"

  return (
    <picture>
      <source media="(max-aspect-ratio: 1/1)" srcSet={`/backgrounds/dithering-${theme}-mobile.webp`} />
      <img
        src={`/backgrounds/dithering-${theme}.webp`}
        alt=""
        width={1920}
        height={1080}
        decoding="async"
        fetchPriority="low"
        className="absolute inset-0 h-full w-full object-cover object-top"
      />
    </picture>
  )
}
