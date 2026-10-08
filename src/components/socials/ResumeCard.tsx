import { CardFrame } from "@/components/socials/CardFrame"

const src = "/socials/resume.jpg"

// The card only mounts on hover, so warm the cache as soon as the navbar hydrates.
if (typeof window !== "undefined") {
  const img = new Image()
  img.src = src
}

export const ResumeCard = () => (
  <CardFrame label="danielmamuza.com/resume">
    <img
      src={src}
      width={900}
      height={540}
      loading="eager"
      decoding="async"
      alt="First page of Daniel Mamuza's resume"
      className="block h-full w-full object-cover object-top"
    />
  </CardFrame>
)
