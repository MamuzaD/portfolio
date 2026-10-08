import type React from "react"

import type { social } from "@/content/socials"

import { GithubCard } from "@/components/socials/GithubCard"
import { LinkedinCard } from "@/components/socials/LinkedinCard"
import { ResumeCard } from "@/components/socials/ResumeCard"
import { LinkPreview } from "@/components/ui/link-preview"

const cards = {
  github: GithubCard,
  linkedin: LinkedinCard,
  resume: ResumeCard,
}

type SocialLinkProps = {
  social: social
  children: React.ReactNode
}

export const SocialLink = ({ social, children }: SocialLinkProps) => {
  const Card = cards[social.card]

  return (
    <LinkPreview url={social.href} target={social.name === "Resume" ? "" : "_blank"} preview={<Card />}>
      {children}
    </LinkPreview>
  )
}
