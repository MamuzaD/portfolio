type social = {
  name: string
  href: string
  icon: string
  src: string
}

type reachout = {
  name: string
  href: string
  icon: React.ReactElement
}

export const socials: social[] = [
  {
    name: "Resume",
    icon: "mdi--file-document-outline",
    href: "/resume",
    src: "/socials/resume.jpg",
  },
  {
    name: "LinkedIn",
    icon: "mdi--linkedin",
    href: "https://linkedin.com/in/daniel-mamuza",
    src: "/socials/linkedin.jpg",
  },
  {
    name: "GitHub",
    icon: "mdi--github",
    href: "https://github.com/mamuzad",
    src: "/socials/github.jpg",
  },
]

export const reachouts: reachout[] = [
  {
    name: "hello@danielmamuza.com",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="m20 8l-8 5l-8-5V6l8 5l8-5m0-2H4c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2"
        />
      </svg>
    ),
    href: "mailto:hello@danielmamuza.com",
  },
  {
    name: "in/daniel-mamuza",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z"
        />
      </svg>
    ),
    href: "https://linkedin.com/in/daniel-mamuza",
  },
]
