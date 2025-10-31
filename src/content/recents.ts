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
    content: "competed & created Weyes at Cal Hacks 12.0",
    links: [{ where: "Weyes", href: "/work/weyes" }],
  },
  {
    content: "created and released Vidlogd",
    links: [
      {
        where: "Vidlogd",
        href: "/work/vidlogd",
      },
    ],
  },
  {
    content: "built FlipTrick part of CodePath's iOS 101",
    links: [
      {
        where: "FlipTrick",
        href: "/work/fliptrick",
      },
    ],
  },
  {
    content: "began work on Fate",
    links: [
      {
        where: "Fate",
        href: "/work/fate",
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
  // {
  //   content: "started position at Intellimind as software engineer intern",
  // },
  // {
  //   content: "competed at South California's ICPC for UNLV",
  // },
]

export default recents
