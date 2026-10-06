type Recent = {
  content: string
  links?: {
    where: string
    href: string
    internal?: boolean
  }[]
  date: Date
}

const recents: Recent[] = [
  {
    content: "built lectr in a few days for fall sem",
    links: [{ where: "lectr", href: "/work/lectr", internal: true }],
    date: new Date("2026-08-27"),
  },
  {
    content: "won 1st place in CS at UNLV's Senior Design Competition with Fomo",
    links: [
      {
        where: "won 1st place",
        href: "https://www.unlv.edu/announcement/howard-r-hughes-college-engineering/unlv-engineering-celebrates-winning-student",
      },
      { where: "Fomo", href: "/work/fomo", internal: true },
    ],
    date: new Date("2026-05-06"),
  },
  {
    content: "interned @ PayPal, summer 2026",
    date: new Date("2026-08-15"),
  },
  {
    content: "developed large-tty",
    links: [{ where: "large-tty", href: "/work/large-tty" }],
    date: new Date("2026-02-26"),
  },
  {
    content: "created & created Bluff at Rebel Hacks",
    links: [{ where: "Bluff", href: "/work/bluff" }],
    date: new Date("2026-02-22"),
  },
  {
    content: "competed at South California's ICPC for UNLV",
    date: new Date("2025-11-15"),
  },
  {
    content: "competed & created Weyes at Cal Hacks 12.0",
    date: new Date("2025-10-29"),
  },
  {
    content: "created and released Vidlogd",
    links: [
      {
        where: "Vidlogd",
        href: "/work/vidlogd",
      },
    ],
    date: new Date("2025-06-17"),
  },
  {
    content: "built FlipTrick part of CodePath's iOS 101",
    links: [
      {
        where: "FlipTrick",
        href: "/work/fliptrick",
      },
    ],
    date: new Date("2025-05-25"),
  },
  {
    content: "began work on Fate",
    date: new Date("2025-03-26"),
  },
  {
    content: "created & hosted portfolio workshop for ACM",
    links: [
      {
        where: "portfolio workshop",
        href: "https://github.com/mamuzad/portfolio-workshop",
      },
    ],
    date: new Date("2025-03-03"),
  },
  {
    content: "updated portfolio to v3",
    date: new Date("2024-12-30"),
  },
  {
    content: "started position at Intellimind as software engineer intern",
    date: new Date("2024-11-17"),
  },
  {
    content: "competed at South California's ICPC for UNLV",
    date: new Date("2024-11-16"),
  },
]

export default recents
