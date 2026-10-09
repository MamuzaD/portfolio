import { Fragment } from "react"

import { CardFrame } from "@/components/socials/CardFrame"

/**
 * Name, headline, photo and banner checked against linkedin.com/in/daniel-mamuza on 2026-10-08.
 */
const profile = {
  name: "Daniel Mamuza",
  headline: "SWE @ Intellimind | Prev @ PayPal | CS @ UNLV",
  avatar: "/socials/linkedin/avatar.jpg",
  banner: "/socials/linkedin/banner.jpg",
}

// The card only mounts on hover, so warm the cache as soon as the navbar hydrates.
if (typeof window !== "undefined") {
  for (const src of [profile.avatar, profile.banner]) {
    const img = new Image()
    img.src = src
  }
}

export const LinkedinCard = () => (
  <CardFrame label="linkedin.com/in/daniel-mamuza">
    <img
      src={profile.banner}
      width={800}
      height={200}
      loading="eager"
      decoding="async"
      alt=""
      className="block h-16 w-full object-cover object-[center_80%]"
    />

    <div className="px-[18px]">
      <div className="flex items-start justify-between">
        <img
          src={profile.avatar}
          width={160}
          height={160}
          loading="eager"
          decoding="async"
          alt={profile.name}
          className="border-card bg-card -mt-[26px] size-[52px] rounded-full border-2 object-cover dark:border-[#151516] dark:bg-[#151516]"
        />
        <span className="mt-2 inline-flex h-7 items-center rounded-full bg-[#0a66c2] px-3.5 text-[13px] leading-none font-semibold text-white transition-colors group-hover:bg-[#004182]">
          View profile
        </span>
      </div>

      <p className="mt-2 text-base leading-5 font-semibold">{profile.name}</p>
      <p className="mt-1 line-clamp-2 text-[13px] leading-[18px] font-normal text-neutral-600 dark:text-white/60">
        {/* Wrap after a " | ", never inside a segment. */}
        {profile.headline.split(" | ").map((part, i, parts) => (
          <Fragment key={part}>
            {i > 0 && " "}
            <span className="whitespace-nowrap">{i < parts.length - 1 ? `${part}\u00a0|` : part}</span>
          </Fragment>
        ))}
      </p>
    </div>
  </CardFrame>
)
