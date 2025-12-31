import { motion } from "motion/react"

import { topSkills } from "@/content/skills"

const TopSkills = () => {
  return (
    <div className="bg-muted-foreground/10 dark:bg-muted/60 z-10 col-span-2 flex w-full flex-col flex-wrap items-center justify-start gap-4 rounded-lg py-4 backdrop-blur-lg md:py-2">
      <span className="font-medium">most used technologies</span>
      <div className="flex flex-wrap gap-4 md:mt-4">
        {topSkills.map((skill, i) => {
          return (
            <div
              className="mx-auto flex flex-col items-center justify-center gap-1 transition-transform hover:scale-110 focus:scale-90"
              key={i}
            >
              <motion.span
                className="h-10 w-10 md:h-12 md:w-12"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.6 }}
                transition={{
                  whileHover: { duration: 500 },
                  whileTap: { duration: 10 },
                }}
              >
                {skill.icon}
              </motion.span>
              <span className="text-center text-xs">{skill.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TopSkills
