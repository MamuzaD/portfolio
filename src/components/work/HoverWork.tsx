import type { CollectionEntry } from "astro:content"
import { motion } from "framer-motion"
import { ArrowRight, ArrowRightCircle } from "lucide-react"
import { useState } from "react"

import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card"
import { LinkPreview } from "@/components/ui/link-preview"

interface RecentWorkProps {
  projects: CollectionEntry<"work">[]
}

const HoverWork = ({ projects }: RecentWorkProps) => {
  const [highlightedProject, setHighlightedProject] = useState<any | null>(null)

  return (
    <section
      className="z-50 flex scroll-mt-32 flex-col items-center justify-center gap-12 md:scroll-mt-48"
      id="recent-work"
    >
      <h3 className="block text-3xl font-semibold md:hidden">recent work</h3>
      <div className="flex gap-8">
        {/* image */}
        <div className="bg-primary-foreground/50 shadow-experiencard-card-light dark:shadow-experiencard-card-dark z-50 hidden h-[500px] w-[500px] shrink-0 items-center justify-center rounded-3xl p-5 backdrop-blur-sm md:flex">
          {highlightedProject ? (
            <CardContainer className="rounded-lg p-4">
              <CardBody>
                <CardItem translateZ="125" className="">
                  <a href={`/work/${highlightedProject.id}`}>
                    <motion.img
                      key={highlightedProject?.data.card.img.src}
                      src={highlightedProject.data.card.img.src}
                      alt={highlightedProject.data.card.alt || highlightedProject.data.title}
                      className="shadow-mac-md hover:shadow-mac-lg h-full w-full rounded-lg object-cover transition-[box-shadow] duration-250"
                      initial={{ opacity: 0, translateY: 25 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 10,
                        duration: 3,
                        delay: 0.2,
                      }}
                      style={{
                        viewTransitionName: highlightedProject.data.card.alt,
                      }}
                    />
                  </a>
                </CardItem>
              </CardBody>
            </CardContainer>
          ) : (
            <div className="animate-bounce rounded-lg p-4 text-center text-neutral-500 transition-transform duration-1500">
              hover over a project
              <ArrowRightCircle className="ml-2 inline-block size-5" />
            </div>
          )}
        </div>
        {/* list */}
        <div className="flex-1 md:max-w-md">
          <ul className="space-y-10">
            {projects.map((project) => (
              <li key={project.id} onMouseEnter={() => setHighlightedProject(project)}>
                <a
                  href={`/work/${project.id}`}
                  className={`group hover:bg-muted/50 md:hover:bg-primary/30 mt-4 block cursor-pointer rounded-[2.5rem] px-10 py-5 backdrop-blur-xs transition-[background_color] duration-300 md:mt-0 md:rounded-xl ${highlightedProject && highlightedProject.id === project.id ? "bg-muted/70 md:bg-primary/40 md:dark:bg-primary/20" : "bg-muted/70 md:bg-transparent"}`}
                >
                  <div className="mt-4 block rounded-lg shadow-md md:hidden">
                    <img
                      src={project.data.card.img.src}
                      alt={project.data.card.alt || project.data.title}
                      className="h-full w-full rounded-3xl object-cover"
                    />
                  </div>
                  <span className="mt-4 flex w-full flex-row justify-between gap-6 md:mt-0">
                    <span className="">
                      <h3 className="text-base font-medium text-neutral-950 transition-none md:text-lg dark:text-neutral-50">
                        {project.data.title}
                      </h3>
                      <p className="text-sm text-neutral-500 md:text-base dark:text-neutral-600">
                        {project.data.caption}
                      </p>
                    </span>
                    <p className="flex items-center text-sm text-neutral-500 dark:text-neutral-600">
                      <span className="transition-[transform_opacity] duration-200 md:group-hover:opacity-0">
                        {project.data.duration.start.toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <ArrowRight className="ml-2 hidden scale-0 transform transition-transform delay-150 duration-300 group-hover:scale-100 md:block" />
                    </p>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <LinkPreview
        url="/work"
        isStatic
        imageSrc="/socials/work.jpg"
        side="bottom"
        sideOffset={25}
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2"
      >
        view all
      </LinkPreview>
    </section>
  )
}

export default HoverWork
