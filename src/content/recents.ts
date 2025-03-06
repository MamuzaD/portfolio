type Recent = {
  content: string
  links?: {
    where: string
    href: string
    internal?: boolean
  }[]
}

const recents: Recent[] = [
  {
    content: "began work on Fate",
    links: [
      {
        where: "Fate",
        href: "#recent-work",
        internal: true,
      },
    ],
  },
  {
    content: "created & hosted portfolio workshop for ACM",
    links: [
      {
        where: "portfolio workshop",
        href: "https://github.com/mamuzad/portfolio-workshop",
      },
    ],
  },
  {
    content: "updated portfolio to v3",
  },
  {
    content: "started position at Intellimind as software engineer intern",
  },
  {
    content: "competed at South California's ICPC for UNLV",
  },
]

export default recents
