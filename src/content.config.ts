import { glob } from "astro/loaders"
import { type ImageFunction, defineCollection, z } from "astro:content"

const imageSchema = (image: ImageFunction) =>
  z.object({
    img: image(),
    alt: z.string().optional(),
  })
const linkSchema = z.object({ url: z.string(), name: z.string() })
const durationSchema = z.object({
  start: z.coerce.date(),
  end: z.union([z.coerce.date().optional(), z.literal("Present").optional()]),
})

const work = defineCollection({
  loader: glob({ base: "./src/content/work", pattern: "**/*.json" }),
  schema: ({ image }) =>
    z.object({
      // basic
      title: z.string(),
      caption: z.string(),
      description: z.array(z.string()),
      duration: durationSchema,

      seoDescription: z.string(),
      ogImg: z.string(),

      // links
      links: z.array(linkSchema),

      // tags
      tags: z.array(z.string()),

      // images
      banner: imageSchema(image),
      card: imageSchema(image),
      imgs: z.array(imageSchema(image)).optional(),
    }),
})

export const collections = { work }
